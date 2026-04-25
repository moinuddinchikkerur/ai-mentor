












import mongoose from "mongoose";
import { runAI } from "../utils/aiHelper.js";
import Evaluation from "../models/Evaluation.js";

const MAX_QUESTION_LENGTH = 1500;
const MAX_ANSWER_LENGTH = 12000;
const allowedMaxMarks = [2, 5, 10, 15, 20, 25, 30];

const stopWords = new Set([
  "what",
  "which",
  "when",
  "where",
  "why",
  "how",
  "the",
  "is",
  "are",
  "was",
  "were",
  "a",
  "an",
  "of",
  "to",
  "for",
  "in",
  "on",
  "at",
  "and",
  "or",
  "with",
  "by",
  "explain",
  "define",
  "write",
  "note",
  "short",
  "answer"
]);

const markRubrics = {
  2: {
    minWords: 6,
    idealWords: 18,
    expectedSentences: 1,
    expectExample: false,
    guidance: "short definition or one direct point"
  },
  5: {
    minWords: 18,
    idealWords: 45,
    expectedSentences: 2,
    expectExample: false,
    guidance: "definition plus 2-3 direct points"
  },
  10: {
    minWords: 40,
    idealWords: 90,
    expectedSentences: 4,
    expectExample: true,
    guidance: "definition, explanation, points, and one example"
  },
  15: {
    minWords: 70,
    idealWords: 140,
    expectedSentences: 5,
    expectExample: true,
    guidance: "well-structured answer with key points and example"
  },
  20: {
    minWords: 100,
    idealWords: 180,
    expectedSentences: 6,
    expectExample: true,
    guidance: "detailed answer with explanation, points, and conclusion"
  },
  25: {
    minWords: 140,
    idealWords: 240,
    expectedSentences: 7,
    expectExample: true,
    guidance: "very detailed answer with strong explanation and structure"
  },
  30: {
    minWords: 180,
    idealWords: 320,
    expectedSentences: 8,
    expectExample: true,
    guidance: "full long-form answer with depth, coverage, and examples"
  }
};

const createChatId = () => {
  return `eval-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

const cleanText = (value) => {
  return String(value || "").trim();
};

const countWords = (text) => {
  return cleanText(text).split(/\s+/).filter(Boolean).length;
};

const clamp = (value, min = 0, max = 1) => {
  return Math.max(min, Math.min(max, value));
};

const getSentenceCount = (text) => {
  return cleanText(text)
    .split(/[.!?]+/)
    .map((part) => part.trim())
    .filter(Boolean).length;
};

const extractKeywords = (question) => {
  return cleanText(question)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !stopWords.has(word));
};

const getKeywordCoverage = (question, answer) => {
  const questionWords = extractKeywords(question);
  const answerWords = new Set(
    cleanText(answer)
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter(Boolean)
  );

  if (questionWords.length === 0) return 0.5;

  const matched = questionWords.filter((word) => answerWords.has(word)).length;

  return matched / questionWords.length;
};

const hasDefinitionStyle = (answer) => {
  return /( is | means | refers to | can be defined as | is the process of )/i.test(
    ` ${cleanText(answer).toLowerCase()} `
  );
};

const hasExampleStyle = (answer) => {
  return /(for example|for instance|such as|e\.g\.|example)/i.test(answer);
};

const calculateMarks = (question, answer, maxMarks) => {
  const rubric = markRubrics[maxMarks] || markRubrics[20];
  const wordCount = countWords(answer);
  const coverageScore = clamp(getKeywordCoverage(question, answer));
  const lengthScore = clamp(wordCount / rubric.idealWords);
  const structureScore = clamp(getSentenceCount(answer) / rubric.expectedSentences);
  const definitionScore = hasDefinitionStyle(answer) ? 1 : 0.45;
  const exampleScore = rubric.expectExample
    ? (hasExampleStyle(answer) ? 1 : 0.15)
    : 1;

  let ratio =
    (0.35 * lengthScore) +
    (0.25 * coverageScore) +
    (0.15 * structureScore) +
    (0.15 * definitionScore) +
    (0.10 * exampleScore);

  const lengthProgress = wordCount / rubric.minWords;

  if (lengthProgress < 0.35) {
    ratio = Math.min(ratio, 0.18);
  } else if (lengthProgress < 0.6) {
    ratio = Math.min(ratio, 0.35);
  } else if (lengthProgress < 1) {
    ratio = Math.min(ratio, 0.6);
  }

  if (coverageScore < 0.2) {
    ratio = Math.min(ratio, 0.45);
  }

  const marks = Math.max(
    0,
    Math.min(maxMarks, Math.round(ratio * maxMarks))
  );

  return {
    marks,
    wordCount,
    rubric
  };
};

const fallbackFeedback = ({ subject, marks, maxMarks, wordCount, rubric }) => {
  return `Strengths:
- Your answer attempts the main idea of the question.
- The response is readable and directly linked to ${subject}.

Missing Points:
- Add more depth based on the ${maxMarks}-mark requirement.
- Include clearer explanation, more points, and one example if needed.

Suggestions:
- For ${maxMarks} marks, write a ${rubric.guidance}.
- Add subject-specific keywords from the question.
- End with one short conclusion if the answer is long.

Marks out of ${maxMarks}: ${marks}
Word Count: ${wordCount}`;
};

export const evaluateAnswer = async (req, res) => {
  try {
    const cleanSubject = cleanText(req.body.subject) || "General";
    const cleanQuestion = cleanText(req.body.question);
    const cleanAnswer = cleanText(req.body.answer);
    const cleanChatId = cleanText(req.body.chatId) || createChatId();

    const selectedMaxMarks = allowedMaxMarks.includes(Number(req.body.maxMarks))
      ? Number(req.body.maxMarks)
      : 20;

    if (!cleanQuestion || !cleanAnswer) {
      return res.status(400).json({
        success: false,
        message: "Question and answer are required"
      });
    }

    if (cleanQuestion.length > MAX_QUESTION_LENGTH) {
      return res.status(400).json({
        success: false,
        message: "Question is too long"
      });
    }

    if (cleanAnswer.length > MAX_ANSWER_LENGTH) {
      return res.status(400).json({
        success: false,
        message: "Answer is too long"
      });
    }

    const { marks, wordCount, rubric } = calculateMarks(
      cleanQuestion,
      cleanAnswer,
      selectedMaxMarks
    );

    const prompt = `
You are an exam answer evaluator.

Subject:
${cleanSubject}

Question:
${cleanQuestion}

Student Answer:
${cleanAnswer}

This answer is being checked out of ${selectedMaxMarks} marks.
Expected answer depth: ${rubric.guidance}

Give concise student-friendly feedback in plain text with exactly these sections:

Strengths:
- point 1
- point 2

Missing Points:
- point 1
- point 2

Suggestions:
- point 1
- point 2

Do not include marks because marks are added separately.
Keep feedback suitable for a ${selectedMaxMarks}-mark answer.
`;

    const aiFeedback = await runAI(prompt);

    const result = aiFeedback
      ? `Marks out of ${selectedMaxMarks}: ${marks}

Word Count: ${wordCount}

${aiFeedback.trim()}`
      : fallbackFeedback({
          subject: cleanSubject,
          marks,
          maxMarks: selectedMaxMarks,
          wordCount,
          rubric
        });

    const evaluation = await Evaluation.create({
      userId: req.user.id,
      chatId: cleanChatId,
      subject: cleanSubject,
      question: cleanQuestion,
      answer: cleanAnswer,
      result,
      marks,
      maxMarks: selectedMaxMarks,
      wordCount
    });

    return res.status(201).json({
      success: true,
      result,
      evaluation
    });
  } catch (err) {
    console.error("Evaluation Error:", err);

    return res.status(500).json({
      success: false,
      message: "Evaluation failed"
    });
  }
};

export const getEvaluationChats = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const filterSubject = cleanText(req.query.subject);

    const match = {
      userId
    };

    if (filterSubject && filterSubject !== "ALL") {
      match.subject = filterSubject;
    }

    const chats = await Evaluation.aggregate([
      {
        $match: match
      },
      {
        $sort: {
          createdAt: 1
        }
      },
      {
        $group: {
          _id: "$chatId",
          subject: { $last: "$subject" },
          lastQuestion: { $last: "$question" },
          lastResult: { $last: "$result" },
          lastMarks: { $last: "$marks" },
          lastMaxMarks: { $last: "$maxMarks" },
          updatedAt: { $last: "$createdAt" },
          totalEntries: { $sum: 1 }
        }
      },
      {
        $sort: {
          updatedAt: -1
        }
      }
    ]);

    return res.json({
      success: true,
      chats
    });
  } catch (err) {
    console.error("Failed to load evaluation chats:", err);

    return res.status(500).json({
      success: false,
      message: "Failed to load chats"
    });
  }
};

export const getEvaluationChat = async (req, res) => {
  try {
    const chatId = cleanText(req.params.chatId);

    if (!chatId) {
      return res.status(400).json({
        success: false,
        message: "Chat id is required"
      });
    }

    const entries = await Evaluation.find({
      chatId,
      userId: req.user.id
    })
      .sort({ createdAt: 1 })
      .lean();

    return res.json({
      success: true,
      chatId,
      subject: entries[0]?.subject || "General",
      entries
    });
  } catch (err) {
    console.error("Failed to load evaluation chat:", err);

    return res.status(500).json({
      success: false,
      message: "Failed to load chat"
    });
  }
};

export const deleteEvaluationChat = async (req, res) => {
  try {
    const chatId = cleanText(req.params.chatId);

    if (!chatId) {
      return res.status(400).json({
        success: false,
        message: "Chat id is required"
      });
    }

    const deleted = await Evaluation.deleteMany({
      chatId,
      userId: req.user.id
    });

    return res.json({
      success: true,
      message: deleted.deletedCount > 0 ? "Chat deleted" : "No chat found",
      deletedCount: deleted.deletedCount
    });
  } catch (err) {
    console.error("Delete evaluation chat failed:", err);

    return res.status(500).json({
      success: false,
      message: "Delete failed"
    });
  }
};