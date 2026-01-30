import StudyLog from "../models/StudyLog.js";
import Subject from "../models/Subject.js";

export const logStudy = async (req, res) => {
  try {
    const { subjectId, chaptersStudied } = req.body;

    if (!subjectId || !chaptersStudied) {
      return res.status(400).json({ message: "All fields required" });
    }

    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    // update completed chapters
    subject.completedChapters += chaptersStudied;
    await subject.save();

    const log = await StudyLog.create({
      userId: req.user.id,
      subjectId,
      chaptersStudied
    });

    res.status(201).json(log);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to log study" });
  }
};
