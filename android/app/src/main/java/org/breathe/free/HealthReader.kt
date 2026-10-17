package org.breathe.free

import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.permission.HealthPermission
import androidx.health.connect.client.records.*
import androidx.health.connect.client.request.ReadRecordsRequest
import androidx.health.connect.client.time.TimeRangeFilter
import org.json.JSONObject
import java.time.Duration
import java.time.Instant
import java.time.ZoneId

class HealthReader(private val client: HealthConnectClient) {
    companion object {
        val permissions = mapOf(
            "sleep" to HealthPermission.getReadPermission(SleepSessionRecord::class),
            "activity" to HealthPermission.getReadPermission(ExerciseSessionRecord::class),
            "hrv" to HealthPermission.getReadPermission(HeartRateVariabilityRmssdRecord::class),
            "restingHeartRate" to HealthPermission.getReadPermission(RestingHeartRateRecord::class)
        )
    }
    private suspend inline fun <reified T: Record> records(start: Instant, end: Instant): List<T> {
        val result = mutableListOf<T>()
        var token: String? = null
        var pages = 0
        do {
            val page = client.readRecords(ReadRecordsRequest(T::class, TimeRangeFilter.between(start, end), pageSize = 1000, pageToken = token))
            result.addAll(page.records); token = page.pageToken; pages++
            check(pages <= 100) { "Too many records" }
        } while (token != null)
        return result
    }
    suspend fun read(types: Set<String>): JSONObject {
        val granted = client.permissionController.getGrantedPermissions()
        val now = Instant.now()
        val start = now.minus(Duration.ofDays(7))
        val metrics = JSONObject()
        fun metric(type: String, value: Double?, at: Instant? = null, source: String? = null) {
            metrics.put(type, if (value == null) JSONObject().put("status", "noData") else JSONObject().put("status", "available").put("value", value).put("at", at.toString()).put("source", source ?: ""))
        }
        for ((type, permission) in permissions) {
            if (type !in types || permission !in granted) { metrics.put(type, JSONObject().put("status", "notShared")); continue }
            when (type) {
                "sleep" -> {
                    val item = records<SleepSessionRecord>(start, now).maxByOrNull { it.endTime }
                    metric(type, item?.let { Duration.between(it.startTime, it.endTime).toMinutes() / 60.0 }, item?.endTime, item?.metadata?.dataOrigin?.packageName)
                }
                "activity" -> {
                    val day = now.atZone(ZoneId.systemDefault()).toLocalDate().atStartOfDay(ZoneId.systemDefault()).toInstant()
                    val items = records<ExerciseSessionRecord>(day, now)
                    metric(type, if(items.isEmpty()) null else HealthSummary.minutes(items.map { it.startTime to it.endTime }, day, now), now, items.map { it.metadata.dataOrigin.packageName }.distinct().joinToString(", "))
                }
                "hrv" -> { val item = records<HeartRateVariabilityRmssdRecord>(start, now).maxByOrNull { it.time }; metric(type, item?.heartRateVariabilityMillis, item?.time, item?.metadata?.dataOrigin?.packageName) }
                "restingHeartRate" -> { val item = records<RestingHeartRateRecord>(start, now).maxByOrNull { it.time }; metric(type, item?.beatsPerMinute?.toDouble(), item?.time, item?.metadata?.dataOrigin?.packageName) }
            }
        }
        return JSONObject().put("status", if(types.none { permissions[it] in granted }) "denied" else "ready").put("metrics", metrics)
    }
}
