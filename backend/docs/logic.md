# Veridyn Core Logic

## Inputs
- Subjects
- Topics per subject
- Exam date
- Daily available study hours
- Past performance (marks / confidence)

## Processing
1. Calculate days remaining until exam
2. Divide syllabus across available days
3. Assign daily study tasks
4. Track completed vs missed tasks
5. Adjust future plan based on progress

## Outputs
- Daily study plan
- Weekly progress summary
- Exam readiness indicator (Green / Yellow / Red)

## Rules (initial)
- If topic repeatedly skipped → mark as weak
- If days left < backlog days → raise warning
- If completion rate > 80% → on track
