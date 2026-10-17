package org.breathe.free

import android.Manifest
import android.app.*
import android.content.*
import android.content.pm.PackageManager
import android.os.Build
import org.json.JSONArray
import org.json.JSONObject
import java.time.ZonedDateTime

object Reminders {
    private const val CHANNEL = "breathe-gentle-reminders"
    private fun prefs(context: Context) = context.getSharedPreferences("reminders", Context.MODE_PRIVATE)
    fun allowed(context: Context) = Build.VERSION.SDK_INT < 33 || context.checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED
    fun all(context: Context) = JSONArray(prefs(context).getString("routines", "[]"))
    fun set(context: Context, input: JSONArray) {
        val previous = all(context)
        for (i in 0 until previous.length()) cancel(context, previous.getJSONObject(i).optString("id"))
        val safe = JSONArray()
        for(i in 0 until minOf(input.length(),30)) {
            val r = input.getJSONObject(i)
            if(!r.optString("id").matches(Regex("[\\w-]{1,80}")) || !r.optString("time").matches(Regex("([01]\\d|2[0-3]):[0-5]\\d"))) continue
            val days = r.optJSONArray("days") ?: continue
            if((0 until days.length()).none { days.optInt(it,-1) in 0..6 }) continue
            safe.put(JSONObject().put("id",r.getString("id")).put("time",r.getString("time")).put("days",days))
        }
        prefs(context).edit().putString("routines",safe.toString()).apply(); scheduleAll(context)
    }
    private fun pending(context: Context,id: String) = PendingIntent.getBroadcast(context,id.hashCode(),Intent(context,ReminderReceiver::class.java).setAction("breathe.$id").putExtra("routine",id),PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
    private fun cancel(context: Context,id: String) {context.getSystemService(AlarmManager::class.java).cancel(pending(context,id));context.getSystemService(NotificationManager::class.java).cancel(id.hashCode())}
    fun scheduleAll(context: Context) {val list=all(context);for(i in 0 until list.length())schedule(context,list.getJSONObject(i))}
    fun schedule(context: Context,routine: JSONObject) {
        if(!allowed(context))return
        val now=ZonedDateTime.now();val parts=routine.getString("time").split(':');val days=routine.getJSONArray("days")
        val chosen=(0 until days.length()).map {days.optInt(it,-1)}.toSet()
        var next=now.withHour(parts[0].toInt()).withMinute(parts[1].toInt()).withSecond(0).withNano(0)
        while(next<=now || next.dayOfWeek.value%7 !in chosen)next=next.plusDays(1)
        context.getSystemService(AlarmManager::class.java).setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP,next.toInstant().toEpochMilli(),pending(context,routine.getString("id")))
    }
    fun show(context: Context,id: String) {
        if(!allowed(context))return
        val manager=context.getSystemService(NotificationManager::class.java)
        manager.createNotificationChannel(NotificationChannel(CHANNEL,"Optional practice reminders",NotificationManager.IMPORTANCE_DEFAULT))
        val spanish=context.resources.configuration.locales[0].language=="es"
        val open=PendingIntent.getActivity(context,id.hashCode(),Intent(context,MainActivity::class.java).putExtra("routine",id),PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
        val notification=Notification.Builder(context,CHANNEL).setSmallIcon(org.breathe.free.R.drawable.breathe_icon).setContentTitle(if(spanish) "Un momento para ti" else "A moment for yourself").setContentText(if(spanish) "Tu práctica está disponible cuando te venga bien." else "Your practice is here when it suits you.").setContentIntent(open).setAutoCancel(true).setVisibility(Notification.VISIBILITY_PRIVATE).build()
        manager.notify(id.hashCode(),notification)
    }
}
class ReminderReceiver: BroadcastReceiver() {override fun onReceive(context: Context,intent: Intent){val id=intent.getStringExtra("routine")?:return;val list=Reminders.all(context);for(i in 0 until list.length()){val r=list.getJSONObject(i);if(r.optString("id")==id){Reminders.show(context,id);Reminders.schedule(context,r);break}}}}
class BootReceiver: BroadcastReceiver() {override fun onReceive(context: Context,intent: Intent){if(intent.action in setOf(Intent.ACTION_BOOT_COMPLETED,Intent.ACTION_TIMEZONE_CHANGED,Intent.ACTION_TIME_CHANGED))Reminders.scheduleAll(context)}}
