package org.breathe.free

import android.Manifest
import android.annotation.SuppressLint
import android.content.Intent
import android.net.Uri
import android.os.*
import android.speech.tts.TextToSpeech
import android.util.Base64
import android.webkit.*
import androidx.activity.ComponentActivity
import androidx.activity.result.contract.ActivityResultContracts
import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.PermissionController
import androidx.lifecycle.lifecycleScope
import androidx.webkit.WebViewAssetLoader
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import kotlinx.coroutines.launch
import org.json.JSONArray
import org.json.JSONObject
import java.io.ByteArrayInputStream
import java.util.Locale

class MainActivity: ComponentActivity() {
    private lateinit var web: WebView
    private var speech: TextToSpeech? = null
    private var speechReady = false
    private var permissionRequest: Pair<String, Set<String>>? = null
    private var reminderRequest: String? = null
    private var saveRequest: Pair<String,ByteArray>? = null
    private val permissions = registerForActivityResult(PermissionController.createRequestPermissionResultContract()) {
        val request=permissionRequest;permissionRequest=null
        if(request!=null)readHealth(request.first,request.second)
    }
    private val notifications=registerForActivityResult(ActivityResultContracts.RequestPermission()) {
        Reminders.scheduleAll(this);reminderRequest?.let {id->reply(id,JSONObject().put("permissionNeeded",!Reminders.allowed(this)))};reminderRequest=null
    }
    private val saveDocument=registerForActivityResult(ActivityResultContracts.CreateDocument("*/*")) {uri->
        val request=saveRequest;saveRequest=null
        if(request!=null)try{if(uri==null)throw IllegalStateException("cancelled");contentResolver.openOutputStream(uri)?.use{it.write(request.second)}?:error("saveFailed");reply(request.first,JSONObject().put("saved",true))}catch(_:Exception){fail(request.first,"saveFailed")}
    }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        web=WebView(this)
        web.settings.javaScriptEnabled=true;web.settings.domStorageEnabled=true
        web.settings.allowFileAccess=false;web.settings.allowContentAccess=false
        web.settings.mixedContentMode=WebSettings.MIXED_CONTENT_NEVER_ALLOW
        web.settings.mediaPlaybackRequiresUserGesture=true
        val loader=WebViewAssetLoader.Builder().addPathHandler("/assets/",WebViewAssetLoader.AssetsPathHandler(this)).build()
        web.webViewClient=object: WebViewClient(){
            override fun shouldInterceptRequest(view: WebView,request: WebResourceRequest): WebResourceResponse {
                return loader.shouldInterceptRequest(request.url)?:WebResourceResponse("text/plain","UTF-8",403,"Local content only",emptyMap(),ByteArrayInputStream(ByteArray(0)))
            }
            override fun shouldOverrideUrlLoading(view: WebView,request: WebResourceRequest): Boolean {
                if(request.url.host=="appassets.androidplatform.net"&&request.url.path?.startsWith("/assets/site/")==true)return false
                if(request.isForMainFrame&&request.url.scheme in setOf("https","http"))try{startActivity(Intent(Intent.ACTION_VIEW,request.url))}catch(_:Exception){}
                return true
            }
        }
        web.addJavascriptInterface(Bridge(),"BreatheAndroid")
        web.webChromeClient=WebChromeClient()
        setContentView(web)
        ViewCompat.setOnApplyWindowInsetsListener(web){view,insets->val bars=insets.getInsets(WindowInsetsCompat.Type.systemBars());view.setPadding(bars.left,bars.top,bars.right,bars.bottom);insets}
        speech=TextToSpeech(this){speechReady=it==TextToSpeech.SUCCESS}
        val routine=intent.getStringExtra("routine")?.takeIf {it.matches(Regex("[\\w-]{1,80}"))}
        web.loadUrl("https://appassets.androidplatform.net/assets/site/index.html"+(routine?.let{"?routine=$it"}?:""))
    }
    inner class Bridge {
        @JavascriptInterface fun postMessage(raw: String) {
            if(raw.length>180000)return
            runOnUiThread {
                if(web.url?.startsWith("https://appassets.androidplatform.net/assets/site/")!=true)return@runOnUiThread
                try{
                    val request=JSONObject(raw);val id=request.getString("id")
                    if(!id.matches(Regex("[0-9]{1,12}")))return@runOnUiThread
                    dispatch(id,request.getString("method"),request.optJSONObject("payload")?:JSONObject())
                }catch(_:Exception){/* Invalid calls never reach a permission or device API. */}
            }
        }
    }
    private fun dispatch(id:String,method:String,payload:JSONObject) {
        when(method){
            "connectHealth","readHealth"->{
                val status=HealthConnectClient.getSdkStatus(this)
                if(status!=HealthConnectClient.SDK_AVAILABLE){reply(id,JSONObject().put("status",if(status==HealthConnectClient.SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED)"updateRequired" else "unavailable"));return}
                val selected=payload.optJSONArray("types")?:JSONArray()
                val types=(0 until selected.length()).map {selected.optString(it)}.filter {it in HealthReader.permissions}.toSet()
                if(types.isEmpty()){fail(id,"noTypes");return}
                if(method=="connectHealth"){
                    if(permissionRequest!=null){fail(id,"busy");return}
                    permissionRequest=id to types
                    permissions.launch(types.mapNotNull {HealthReader.permissions[it]}.toSet())
                }else readHealth(id,types)
            }
            "disconnectHealth"->lifecycleScope.launch{try{HealthConnectClient.getOrCreate(this@MainActivity).permissionController.revokeAllPermissions();reply(id,JSONObject().put("disconnected",true))}catch(_:Exception){fail(id,"healthUnavailable")}}
            "setReminders"->{
                Reminders.set(this,payload.optJSONArray("routines")?:JSONArray())
                if(payload.optBoolean("requestPermission")&&!Reminders.allowed(this)&&Build.VERSION.SDK_INT>=33){
                    if(reminderRequest!=null){fail(id,"busy");return};reminderRequest=id;notifications.launch(Manifest.permission.POST_NOTIFICATIONS)
                }else reply(id,JSONObject().put("permissionNeeded",!Reminders.allowed(this)))
            }
            "vibrate"->{
                val input=payload.optJSONArray("pattern")?:JSONArray();val pattern=(0 until minOf(input.length(),8)).map{input.optLong(it).coerceIn(0,100)}
                val vibrator=if(Build.VERSION.SDK_INT>=31)getSystemService(VibratorManager::class.java).defaultVibrator else getSystemService(Vibrator::class.java)
                if(vibrator.hasVibrator()&&pattern.isNotEmpty())vibrator.vibrate(VibrationEffect.createWaveform((listOf(0L)+pattern).toLongArray(),-1))
                reply(id,JSONObject().put("available",vibrator.hasVibrator()))
            }
            "speak"->{
                val language=if(payload.optString("language")=="es")"es" else "en"
                val voice=speech?.voices?.firstOrNull{!it.isNetworkConnectionRequired&&it.locale.language==language}
                if(speechReady&&voice!=null){speech?.voice=voice;speech?.setSpeechRate(.9f);speech?.speak(payload.optString("text").take(300),TextToSpeech.QUEUE_FLUSH,null,"phase")}
                reply(id,JSONObject().put("available",speechReady&&voice!=null))
            }
            "silence"->{silence();reply(id,JSONObject())}
            "saveFile"->{
                if(saveRequest!=null){fail(id,"busy");return}
                val name=payload.optString("name").takeIf{it.matches(Regex("breathe-[a-z-]+\\.(json|ics)"))}?:run{fail(id,"invalidFile");return}
                val bytes=try{Base64.decode(payload.optString("base64"),Base64.DEFAULT)}catch(_:Exception){fail(id,"invalidFile");return}
                if(bytes.size>120000){fail(id,"fileTooLarge");return}
                saveRequest=id to bytes;saveDocument.launch(name)
            }
            else->fail(id,"unsupported")
        }
    }
    private fun readHealth(id:String,types:Set<String>) {lifecycleScope.launch{
        try{reply(id,HealthReader(HealthConnectClient.getOrCreate(this@MainActivity)).read(types))}catch(_:Exception){fail(id,"healthUnavailable")}
    }}
    private fun reply(id:String,data:JSONObject){web.evaluateJavascript("window.dispatchEvent(new CustomEvent('breathe-native',{detail:${JSONObject().put("id",id).put("data",data)}}));",null)}
    private fun fail(id:String,error:String){web.evaluateJavascript("window.dispatchEvent(new CustomEvent('breathe-native',{detail:${JSONObject().put("id",id).put("error",error)}}));",null)}
    private fun silence(){speech?.stop();if(Build.VERSION.SDK_INT>=31)getSystemService(VibratorManager::class.java).defaultVibrator.cancel() else getSystemService(Vibrator::class.java).cancel()}
    override fun onPause(){if(::web.isInitialized){web.evaluateJavascript("window.dispatchEvent(new Event('breathe-pause'));",null);web.onPause()};silence();super.onPause()}
    override fun onResume(){super.onResume();if(::web.isInitialized)web.onResume();Reminders.scheduleAll(this)}
    override fun onDestroy(){silence();speech?.shutdown();web.removeJavascriptInterface("BreatheAndroid");web.destroy();super.onDestroy()}
}
