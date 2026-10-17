package org.breathe.free

import java.time.Duration
import java.time.Instant

/** Merge overlapping exercise intervals instead of double-counting multiple sources. */
object HealthSummary {
    fun minutes(intervals: List<Pair<Instant, Instant>>, start: Instant, end: Instant): Double {
        val clipped = intervals.map { maxOf(it.first, start) to minOf(it.second, end) }.filter { it.second > it.first }.sortedBy { it.first }
        if (clipped.isEmpty()) return 0.0
        var from = clipped.first().first
        var to = clipped.first().second
        var millis = 0L
        for ((a, b) in clipped.drop(1)) {
            if (a <= to) to = maxOf(to, b)
            else { millis += Duration.between(from, to).toMillis(); from = a; to = b }
        }
        return (millis + Duration.between(from, to).toMillis()) / 60000.0
    }
}
