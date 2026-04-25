



import { runAI } from "../utils/aiHelper.js";

const normalizeText = (text) => {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
};

const getTokens = (text) => {
  return normalizeText(text).split(" ").filter(Boolean);
};

const getSimilarity = (a, b) => {
  const first = new Set(getTokens(a));
  const second = new Set(getTokens(b));

  if (first.size === 0 || second.size === 0) return 0;

  let same = 0;

  first.forEach((token) => {
    if (second.has(token)) same++;
  });

  return same / Math.max(first.size, second.size);
};

const isSimilarQuestion = (question, previousQuestions) => {
  const cleanQuestion = normalizeText(question);

  return previousQuestions.some((previous) => {
    const cleanPrevious = normalizeText(previous);

    if (!cleanPrevious) return false;
    if (cleanQuestion === cleanPrevious) return true;

    return getSimilarity(cleanQuestion, cleanPrevious) >= 0.92;
  });
};

const shuffleArray = (items) => {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index--) {
    const randomIndex = Math.floor(Math.random() * (index + 1));

    [shuffled[index], shuffled[randomIndex]] = [
      shuffled[randomIndex],
      shuffled[index]
    ];
  }

  return shuffled;
};

const shuffleOptions = (options, correctAnswer) => {
  const cleanOptions = Array.from(
    new Set(options.map((option) => String(option || "").trim()).filter(Boolean))
  );

  if (!cleanOptions.includes(correctAnswer)) {
    cleanOptions[0] = correctAnswer;
  }

  return shuffleArray(cleanOptions).slice(0, 4);
};

const extractJsonValue = (text) => {
  if (!text) return null;

  const cleaned = String(text)
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    // Try extracting JSON below.
  }

  const arrayStart = cleaned.indexOf("[");
  const arrayEnd = cleaned.lastIndexOf("]");

  if (arrayStart !== -1 && arrayEnd > arrayStart) {
    try {
      return JSON.parse(cleaned.slice(arrayStart, arrayEnd + 1));
    } catch {
      // Try object below.
    }
  }

  const objectStart = cleaned.indexOf("{");
  const objectEnd = cleaned.lastIndexOf("}");

  if (objectStart !== -1 && objectEnd > objectStart) {
    try {
      return JSON.parse(cleaned.slice(objectStart, objectEnd + 1));
    } catch {
      return null;
    }
  }

  return null;
};

const stripOptionLabel = (value) => {
  return String(value || "")
    .replace(/^\s*[A-E]\s*[\).\:\-]\s*/i, "")
    .trim();
};

const getOptionLetter = (value) => {
  const match = String(value || "").match(/^\s*([A-E])\s*[\).\:\-]\s*/i);
  return match ? match[1].toUpperCase() : "";
};

const isOnlyOptionLabel = (value) => {
  const clean = String(value || "").trim();

  return /^[A-E]$/i.test(clean) ||
    /^option\s+[A-E]$/i.test(clean) ||
    /^[A-E][\).\:\-]$/i.test(clean);
};

const isBadOption = (value) => {
  const clean = String(value || "").trim();

  if (!clean) return true;
  if (isOnlyOptionLabel(clean)) return true;

  return false;
};

const extractOptions = (item) => {
  const optionMap = {};

  ["A", "B", "C", "D", "E"].forEach((letter) => {
    const direct = item?.[letter] || item?.[letter.toLowerCase()];
    const optionKey =
      item?.[`option${letter}`] ||
      item?.[`Option${letter}`] ||
      item?.[`option_${letter}`] ||
      item?.[`choice${letter}`] ||
      item?.[`choice_${letter}`];

    const value = direct || optionKey;

    if (value) {
      optionMap[letter] = stripOptionLabel(value);
    }
  });

  let rawOptions =
    item?.options ||
    item?.choices ||
    item?.answers ||
    item?.alternatives ||
    [];

  if (!Array.isArray(rawOptions) && typeof rawOptions === "object") {
    Object.entries(rawOptions).forEach(([key, value]) => {
      const letter = String(key || "").trim().toUpperCase();

      if (/^[A-E]$/.test(letter)) {
        optionMap[letter] = stripOptionLabel(value);
      }
    });

    rawOptions = Object.values(rawOptions);
  }

  if (Array.isArray(rawOptions)) {
    rawOptions.forEach((option) => {
      if (typeof option === "object" && option !== null) {
        Object.entries(option).forEach(([key, value]) => {
          const letter = String(key || "").trim().toUpperCase();

          if (/^[A-E]$/.test(letter)) {
            optionMap[letter] = stripOptionLabel(value);
          }
        });
      }

      if (typeof option === "string") {
        const letter = getOptionLetter(option);

        if (letter) {
          optionMap[letter] = stripOptionLabel(option);
        }
      }
    });
  }

  let options = [];

  if (Object.keys(optionMap).length >= 2) {
    options = ["A", "B", "C", "D"]
      .map((letter) => optionMap[letter])
      .filter(Boolean);
  } else if (Array.isArray(rawOptions)) {
    options = rawOptions
      .map((option) => {
        if (typeof option === "object" && option !== null) {
          return stripOptionLabel(Object.values(option)[0]);
        }

        return stripOptionLabel(option);
      })
      .filter(Boolean);
  }

  return {
    options: options.slice(0, 4),
    optionMap
  };
};

const normalizeCorrectAnswer = ({ item, options, optionMap }) => {
  let correctAnswer = String(
    item?.correctAnswer ||
    item?.answer ||
    item?.correct ||
    item?.rightAnswer ||
    item?.correct_option ||
    ""
  ).trim();

  const answerLetter = correctAnswer
    .replace(/option/i, "")
    .replace(/[^A-E]/gi, "")
    .trim()
    .toUpperCase();

  if (answerLetter && optionMap[answerLetter]) {
    return optionMap[answerLetter];
  }

  correctAnswer = stripOptionLabel(correctAnswer);

  if (correctAnswer && options.includes(correctAnswer)) {
    return correctAnswer;
  }

  const matchedOption = options.find((option) => {
    return normalizeText(option) === normalizeText(correctAnswer);
  });

  if (matchedOption) return matchedOption;

  return options[0] || "";
};

const normalizeMCQ = (item, topic, index) => {
  if (!item || !item.question) return null;

  const question = String(item.question).trim();

  const { options, optionMap } = extractOptions(item);

  if (options.length < 4) return null;
  if (options.some(isBadOption)) return null;

  const uniqueOptions = Array.from(new Set(options));

  if (uniqueOptions.length < 4) return null;

  const correctAnswer = normalizeCorrectAnswer({
    item,
    options: uniqueOptions,
    optionMap
  });

  if (!correctAnswer || isBadOption(correctAnswer)) return null;

  const shuffledOptions = shuffleOptions(uniqueOptions, correctAnswer);

  if (shuffledOptions.length < 4) return null;
  if (shuffledOptions.some(isBadOption)) return null;

  return {
    id: index + 1,
    question,
    options: shuffledOptions,
    correctAnswer,
    explanation:
      item.explanation ||
      `Review the main concept of ${topic} to understand this answer.`
  };
};

const withShuffledOptions = (item) => {
  return {
    ...item,
    options: shuffleOptions(item.options, item.correctAnswer)
  };
};

const fallbackMCQs = ({
  subject,
  topic,
  difficulty,
  previousQuestions,
  count,
  startNumber
}) => {
  const focusAreas = [
    "basic concept",
    "definition",
    "real exam application",
    "common mistake",
    "revision strategy",
    "problem solving step",
    "keyword recognition",
    "concept comparison",
    "accuracy improvement",
    "mock test analysis",
    "formula or rule use",
    "example based understanding",
    "tricky option elimination",
    "memory recall",
    "final exam preparation"
  ];

  const templates = [
    (n, focus) => ({
      question: `For ${topic} in ${subject}, which choice best matches the ${focus} in question ${n}?`,
      options: [
        `Apply the ${focus} of ${topic} with clear understanding`,
        "Ignore the topic and guess randomly",
        "Skip every difficult question",
        "Memorize unrelated facts only"
      ],
      correctAnswer: `Apply the ${focus} of ${topic} with clear understanding`,
      explanation: `This question checks the ${focus} of ${topic}.`
    }),
    (n, focus) => ({
      question: `In a ${difficulty} level ${subject} test, how should a student handle the ${focus} of ${topic} in question ${n}?`,
      options: [
        "Read the question carefully and connect it with the concept",
        "Choose the longest option every time",
        "Avoid checking mistakes",
        "Study without practice"
      ],
      correctAnswer: "Read the question carefully and connect it with the concept",
      explanation: "Careful reading plus concept connection improves accuracy."
    }),
    (n, focus) => ({
      question: `Which action is most useful for improving ${topic} through ${focus} practice in question ${n}?`,
      options: [
        "Solve, review, and retry similar questions",
        "Only read once without testing",
        "Ignore wrong answers",
        "Stop revision completely"
      ],
      correctAnswer: "Solve, review, and retry similar questions",
      explanation: "Practice becomes useful when mistakes are reviewed."
    }),
    (n, focus) => ({
      question: `What should be avoided while studying the ${focus} part of ${topic} in question ${n}?`,
      options: [
        "Guessing without understanding the question",
        "Making short notes",
        "Checking solved examples",
        "Practicing similar questions"
      ],
      correctAnswer: "Guessing without understanding the question",
      explanation: "Guessing does not build concept clarity."
    }),
    (n, focus) => ({
      question: `Why is the ${focus} of ${topic} important for ${subject} exams in question ${n}?`,
      options: [
        "It helps solve new and application based questions",
        "It removes the need to revise",
        "It makes every answer automatic without thinking",
        "It is unrelated to exam performance"
      ],
      correctAnswer: "It helps solve new and application based questions",
      explanation: "Exam questions often test application, not only memory."
    })
  ];

  const result = [];
  const blocked = [...previousQuestions];
  let cursor = 0;

  while (result.length < count && cursor < 200) {
    const number = startNumber + cursor;
    const focus = focusAreas[cursor % focusAreas.length];
    const template = templates[cursor % templates.length];
    const item = withShuffledOptions(template(number, focus));

    if (!isSimilarQuestion(item.question, blocked)) {
      result.push({
        id: result.length + 1,
        ...item
      });

      blocked.push(item.question);
    }

    cursor++;
  }

  return result;
};

export const generateMCQ = async (req, res) => {
  try {
    const {
      subject = "General",
      topic,
      difficulty = "medium",
      previousQuestions = [],
      count = 5,
      startNumber = 1,
      attempt = 1
    } = req.body;

    const cleanTopic = String(topic || "").trim();
    const cleanSubject = String(subject || "General").trim() || "General";

    if (!cleanTopic) {
      return res.status(400).json({
        success: false,
        message: "Topic is required",
        mcqs: []
      });
    }

    const safeCount = Math.min(Math.max(Number(count || 5), 1), 10);
    const safeStartNumber = Math.max(Number(startNumber || 1), 1);

    const cleanPreviousQuestions = Array.isArray(previousQuestions)
      ? previousQuestions.map((question) => String(question || "").trim()).filter(Boolean)
      : [];

    const previousText = cleanPreviousQuestions.length > 0
      ? cleanPreviousQuestions
          .map((question, index) => `${index + 1}. ${question}`)
          .join("\n")
      : "No previous questions yet.";

    const prompt = `
Generate exactly ${safeCount} NEW multiple choice questions.

Subject: "${cleanSubject}"
Topic: "${cleanTopic}"
Difficulty: "${difficulty}"
Start question number from: ${safeStartNumber}
Attempt: ${attempt}

Already generated questions:
${previousText}

Important rules:
- Do not repeat any old question.
- Do not slightly rewrite old questions.
- Do not only change options.
- Question text must be new.
- Options must be full meaningful answer text.
- Never return options as only "A", "B", "C", "D".
- Correct answers must appear in random positions, not always first.
- Each option should be a complete phrase or sentence.
- Each question must test a different idea, subtopic, example, formula, rule, mistake, or application.
- Exactly 4 options for each question.
- Only one correct answer.
- correctAnswer must exactly match one option.

Return ONLY valid JSON array. No markdown.

Format:
[
  {
    "question": "Question text",
    "options": [
      "Full option text one",
      "Full option text two",
      "Full option text three",
      "Full option text four"
    ],
    "correctAnswer": "Exact full correct option text",
    "explanation": "Short explanation"
  }
]
`;

    let rawItems = [];

    try {
      const reply = await runAI(prompt);
      const parsed = extractJsonValue(reply);

      rawItems = Array.isArray(parsed)
        ? parsed
        : Array.isArray(parsed?.mcqs)
          ? parsed.mcqs
          : Array.isArray(parsed?.questions)
            ? parsed.questions
            : parsed
              ? [parsed]
              : [];
    } catch (err) {
      console.error("AI MCQ generation failed:", err.message);
    }

    const finalMcqs = [];
    const blockedQuestions = [...cleanPreviousQuestions];

    rawItems.forEach((item) => {
      const normalized = normalizeMCQ(
        item,
        cleanTopic,
        finalMcqs.length
      );

      if (!normalized) return;

      if (isSimilarQuestion(normalized.question, blockedQuestions)) {
        return;
      }

      finalMcqs.push({
        ...normalized,
        id: finalMcqs.length + 1
      });

      blockedQuestions.push(normalized.question);
    });

    if (finalMcqs.length < safeCount) {
      const fallback = fallbackMCQs({
        subject: cleanSubject,
        topic: cleanTopic,
        difficulty,
        previousQuestions: blockedQuestions,
        count: safeCount - finalMcqs.length,
        startNumber: safeStartNumber + finalMcqs.length
      });

      finalMcqs.push(...fallback);
    }

    return res.status(200).json({
      success: true,
      mcqs: finalMcqs.slice(0, safeCount)
    });
  } catch (error) {
    console.error("MCQ Controller Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to generate MCQs",
      mcqs: []
    });
  }
};
