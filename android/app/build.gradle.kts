plugins { id("com.android.application"); id("org.jetbrains.kotlin.android") }
providers.gradleProperty("breatheBuildDir").orNull?.let { layout.buildDirectory.set(file(it)) }
android {
    namespace = "org.breathe.free"
    compileSdk = 36
    defaultConfig { applicationId = "org.breathe.free"; minSdk = 28; targetSdk = 36; versionCode = 3; versionName = "0.3.0" }
    compileOptions { sourceCompatibility = JavaVersion.VERSION_17; targetCompatibility = JavaVersion.VERSION_17 }
    kotlinOptions { jvmTarget = "17" }
}
dependencies {
    implementation("androidx.activity:activity-ktx:1.9.3")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.8.7")
    implementation("androidx.webkit:webkit:1.12.1")
    implementation("androidx.health.connect:connect-client:1.1.0")
    testImplementation("junit:junit:4.13.2")
}
