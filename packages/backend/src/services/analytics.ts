// This is extremely specific for our survey and survey-1
import { getResponsesBySurvey } from './dynamodb.js'

export async function aggregateAnalytics(surveyId: string) {
  // 1. Fetch live raw responses from DynamoDB
  const responses = await getResponsesBySurvey(surveyId)

  // Default structure if empty
  if (!responses || responses.length === 0) {
    return {
      summary: [
        { title: 'Total Responses', value: '0', trend: 'N/A' },
        { title: 'Completion Rate', value: '0%', trend: 'N/A' },
        { title: 'Average Time', value: '0s', trend: 'N/A' },
      ],
      trends: [],
      dropoffsByStage: [],
    }
  }

  // 2. Compute Total Responses
  const totalResponses = responses.length

  // 3. Compute Average Time
  let totalTimeMs = 0
  let timeCount = 0
  responses.forEach((r) => {
    if (r.metadata?.completionTime) {
      totalTimeMs += r.metadata.completionTime
      timeCount++
    }
  })

  const avgTimeSeconds =
    timeCount > 0 ? Math.round(totalTimeMs / timeCount / 1000) : 0
  const avgTimeMinutes = Math.floor(avgTimeSeconds / 60)
  const avgTimeRemainder = avgTimeSeconds % 60
  const avgTimeStr =
    avgTimeMinutes > 0
      ? `${avgTimeMinutes}m ${avgTimeRemainder}s`
      : `${avgTimeSeconds}s`

  // 4. Compute Completion Rate
  const completedResponses = responses.filter(
    (r) => r.metadata?.completionTime != null
  ).length
  const completionRate = Math.round((completedResponses / totalResponses) * 100)

  // 5. Aggregate Trends (grouped by day of creation)
  const trendsMap: Record<string, { completions: number; dropoffs: number }> =
    {}

  responses.forEach((r) => {
    // extract YYYY-MM-DD
    const dateStr = r.createdAt.split('T')[0]
    if (!trendsMap[dateStr]) {
      trendsMap[dateStr] = { completions: 0, dropoffs: 0 }
    }

    if (r.metadata?.completionTime != null) {
      trendsMap[dateStr].completions++
    } else {
      trendsMap[dateStr].dropoffs++
    }
  })

  const trends = Object.keys(trendsMap)
    .sort()
    .map((date) => ({
      date,
      completions: trendsMap[date].completions,
      dropoffs: trendsMap[date].dropoffs,
    }))

  // 6. Aggregate DropoffsByStage (rough approximation by answer count)
  // E.g. 0-2 answers = Intro, 3-9 = Feedback, 10+ = Review
  let intro = 0,
    feedbackDrop = 0,
    reviewDrop = 0

  responses.forEach((r) => {
    if (r.metadata?.completionTime != null) return // not a dropoff

    const answerCount = Object.keys(r.answers).length
    if (answerCount <= 2) intro++
    else if (answerCount <= 9) feedbackDrop++
    else reviewDrop++
  })

  const dropoffsByStage = [
    { stage: 'Intro', counts: intro },
    { stage: 'Feedback', counts: feedbackDrop },
    { stage: 'Review', counts: reviewDrop },
  ].filter((d) => d.counts > 0)

  return {
    summary: [
      {
        title: 'Total Responses',
        value: totalResponses.toString(),
        trend: 'Live',
      },
      { title: 'Completion Rate', value: `${completionRate}%`, trend: 'Live' },
      { title: 'Average Time', value: avgTimeStr, trend: 'Live' },
    ],
    trends,
    dropoffsByStage:
      dropoffsByStage.length > 0
        ? dropoffsByStage
        : [{ stage: 'None', counts: 0 }],
  }
}
