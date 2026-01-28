import StudyLog from "../models/StudyLog.js";

export const getSubjectAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;

    const logs = await StudyLog.find({ user: userId });

    const subjectMap = {};

    logs.forEach((log) => {
      const subject = log.subject;
      if (!subjectMap[subject]) {
        subjectMap[subject] = 0;
      }
      subjectMap[subject] += log.chaptersStudied || 0;
    });

    const subjects = Object.keys(subjectMap).map((s) => ({
      name: s,
      chapters: subjectMap[s],
    }));

    if (subjects.length === 0) {
      return res.json({ subjects: [], weakest: "", strongest: "" });
    }

    let weakest = subjects[0];
    let strongest = subjects[0];

    subjects.forEach((s) => {
      if (s.chapters < weakest.chapters) weakest = s;
      if (s.chapters > strongest.chapters) strongest = s;
    });

    res.json({
      subjects,
      weakest: weakest.name,
      strongest: strongest.name,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to calculate subject analytics" });
  }
};
