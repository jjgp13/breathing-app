package org.breathe.free
import org.junit.Assert.assertEquals
import org.junit.Test
import java.time.Instant

class HealthSummaryTest {
    private fun at(minutes:Long)=Instant.EPOCH.plusSeconds(minutes*60)
    @Test fun overlappingSourcesCountOnceAndClipToToday(){assertEquals(80.0,HealthSummary.minutes(listOf(at(-20) to at(30),at(15) to at(60),at(90) to at(120)),at(0),at(110)),.001)}
    @Test fun missingIntervalsStayEmpty(){assertEquals(0.0,HealthSummary.minutes(emptyList(),at(0),at(60)),.001)}
    @Test fun adjacentIntervalsRemainContinuous(){assertEquals(60.0,HealthSummary.minutes(listOf(at(0) to at(30),at(30) to at(60)),at(0),at(60)),.001)}
}
