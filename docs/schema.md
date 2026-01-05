# Veridyn – Database Schema (MongoDB)

## Student
{
  _id,
  name,
  examName,
  examDate,
  dailyStudyHours,
  createdAt
}

## Subject
{
  _id,
  studentId,
  subjectName,
  topics: [
    {
      name,
      difficulty
    }
  ]
}

## StudyPlan
{
  _id,
  studentId,
  startDate,
  endDate,
  totalDays,
  status
}

## DailyTask
{
  _id,
  studentId,
  subjectId,
  topicName,
  plannedDate,
  estimatedTime,
  status, // pending | completed | skipped
  skipReason
}
