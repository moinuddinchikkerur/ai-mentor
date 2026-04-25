




























import mongoose from "mongoose";
import { runAI } from "../utils/aiHelper.js";
import CareerGuide from "../models/CareerGuide.js";

const cleanText = (value, fallback = "") => {
  const text = String(value || "").trim();
  return text || fallback;
};

const splitList = (value) => {
  const seen = new Set();

  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .filter((item) => {
      const key = item.toLowerCase();

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    });
};

const hasKeyword = (text, keywords) => {
  return keywords.some((keyword) => text.includes(keyword));
};

const uniqueItems = (items) => {
  const seen = new Set();

  return items.filter((item) => {
    const key = String(item || "").trim().toLowerCase();

    if (!key || seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
};

const getStudyCadence = (studyTime) => {
  const value = String(studyTime || "").toLowerCase();

  if (value.includes("10+")) return "90 minutes a day";
  if (value.includes("8-10")) return "60-75 minutes a day";
  if (value.includes("5-7")) return "45-60 minutes a day";
  return "30-45 minutes a day";
};

const detectProfileLevel = ({ skillsList, education }) => {
  const joinedSkills = skillsList.join(" ").toLowerCase();
  const joinedEducation = String(education || "").toLowerCase();

  if (
    joinedSkills.includes("advanced") ||
    joinedSkills.includes("expert") ||
    joinedSkills.includes("internship") ||
    joinedSkills.includes("experience")
  ) {
    return "Advanced";
  }

  if (
    skillsList.length >= 4 ||
    joinedSkills.includes("react") ||
    joinedSkills.includes("node") ||
    joinedSkills.includes("python") ||
    joinedSkills.includes("sql") ||
    joinedSkills.includes("figma") ||
    joinedEducation.includes("b.tech") ||
    joinedEducation.includes("bca")
  ) {
    return "Intermediate";
  }

  return "Beginner";
};

const domainCatalog = [
  {
    label: "Frontend Development",
    keywords: ["frontend", "web", "react", "html", "css", "javascript", "ui"],
    roles: [
      "Frontend Developer",
      "UI Developer",
      "Junior Web Developer"
    ],
    skills: [
      "HTML",
      "CSS",
      "JavaScript",
      "Responsive Design",
      "React",
      "Git",
      "API Integration",
      "Accessibility"
    ],
    projects: [
      "Build a personal portfolio website with project sections",
      "Create a task manager with filtering and local storage",
      "Build a dashboard using a public API and charts"
    ],
    interviewFocus: [
      "JavaScript fundamentals",
      "DOM and events",
      "Responsive layouts",
      "React components and state"
    ]
  },
  {
    label: "Backend Development",
    keywords: ["backend", "node", "api", "server", "database", "express"],
    roles: [
      "Backend Developer",
      "API Developer",
      "Junior Full Stack Developer"
    ],
    skills: [
      "Node.js",
      "Express",
      "REST APIs",
      "MongoDB or SQL",
      "Authentication",
      "Error Handling",
      "Git",
      "Deployment Basics"
    ],
    projects: [
      "Create a secure REST API with login and CRUD",
      "Build a task or notes backend with auth",
      "Deploy a backend project with environment variables"
    ],
    interviewFocus: [
      "HTTP methods and status codes",
      "Database modeling",
      "Authentication and authorization",
      "API design and error handling"
    ]
  },
  {
    label: "Data / AI",
    keywords: ["data", "machine learning", "ai", "python", "analytics", "ml"],
    roles: [
      "Data Analyst",
      "Machine Learning Engineer",
      "AI Engineer"
    ],
    skills: [
      "Python",
      "SQL",
      "Data Cleaning",
      "Pandas",
      "Statistics",
      "Machine Learning Basics",
      "Visualization",
      "Problem Solving"
    ],
    projects: [
      "Analyze a dataset and build a clean dashboard",
      "Create a prediction model with a clear report",
      "Build a mini AI app that solves one focused problem"
    ],
    interviewFocus: [
      "Python and data structures",
      "Statistics basics",
      "Model evaluation",
      "Explaining project decisions clearly"
    ]
  },
  {
    label: "UI / UX Design",
    keywords: ["design", "ui", "ux", "figma", "product design"],
    roles: [
      "UI Designer",
      "UX Designer",
      "Product Designer"
    ],
    skills: [
      "Figma",
      "Wireframing",
      "Visual Hierarchy",
      "Design Systems",
      "User Flows",
      "Prototyping",
      "Research Basics",
      "Communication"
    ],
    projects: [
      "Redesign a real app with before and after case study",
      "Create a mobile app prototype in Figma",
      "Build a design system for a student product"
    ],
    interviewFocus: [
      "Design decisions",
      "Case study storytelling",
      "User journey thinking",
      "Design system basics"
    ]
  },
  {
    label: "Cybersecurity",
    keywords: ["cyber", "security", "soc", "ethical hacking", "network"],
    roles: [
      "Security Analyst",
      "SOC Analyst",
      "Junior Cybersecurity Engineer"
    ],
    skills: [
      "Networking Basics",
      "Linux",
      "Security Fundamentals",
      "Threat Detection",
      "Incident Response",
      "Documentation",
      "Scripting Basics",
      "Analytical Thinking"
    ],
    projects: [
      "Set up a home lab and document findings",
      "Create a basic security checklist for small systems",
      "Write a beginner incident response case study"
    ],
    interviewFocus: [
      "Networking basics",
      "Common threats",
      "Security tools overview",
      "Incident response steps"
    ]
  },
  {
    label: "Mobile App Development",
    keywords: ["mobile", "android", "ios", "flutter", "react native"],
    roles: [
      "Mobile App Developer",
      "Android Developer",
      "Cross Platform App Developer"
    ],
    skills: [
      "App Fundamentals",
      "Flutter or React Native",
      "Navigation",
      "State Management",
      "API Integration",
      "Testing Basics",
      "Git",
      "Publishing Workflow"
    ],
    projects: [
      "Build a student planner mobile app",
      "Create a weather or notes app with API support",
      "Publish a polished app prototype with screenshots"
    ],
    interviewFocus: [
      "App structure",
      "State handling",
      "Performance basics",
      "API and storage handling"
    ]
  },
  {
    label: "Digital Marketing",
    keywords: ["marketing", "seo", "content", "social media", "branding"],
    roles: [
      "Digital Marketing Executive",
      "SEO Specialist",
      "Content Strategist"
    ],
    skills: [
      "SEO Basics",
      "Content Planning",
      "Social Media Strategy",
      "Analytics",
      "Copywriting",
      "Campaign Thinking",
      "Research",
      "Communication"
    ],
    projects: [
      "Create a 30-day content plan for a mock brand",
      "Run a small SEO audit and document fixes",
      "Build a campaign case study with goals and metrics"
    ],
    interviewFocus: [
      "Audience targeting",
      "Basic analytics",
      "Campaign thinking",
      "Content quality and consistency"
    ]
  }
];

const defaultDomain = {
  label: "General Professional Path",
  roles: [
    "Entry-Level Specialist",
    "Project Associate",
    "Operations or Support Executive"
  ],
  skills: [
    "Communication",
    "Problem Solving",
    "Time Management",
    "Digital Tools",
    "Research",
    "Documentation",
    "Presentation",
    "Learning Agility"
  ],
  projects: [
    "Build a portfolio that showcases your strongest work",
    "Create one real-world project based on your interest",
    "Document your learning progress and outcomes clearly"
  ],
  interviewFocus: [
    "Communication",
    "Problem solving",
    "Basic domain understanding",
    "Project explanation"
  ]
};

const getDomainConfig = (interest, skillsList) => {
  const haystack = `${interest} ${skillsList.join(" ")}`.toLowerCase();

  const matched = domainCatalog.find((domain) =>
    hasKeyword(haystack, domain.keywords)
  );

  return matched || defaultDomain;
};

const buildCareerOptions = (domain, level, interest) => {
  const levelBonus = {
    Beginner: 0,
    Intermediate: 4,
    Advanced: 8
  };

  const baseScores = [90, 84, 78];

  return domain.roles.slice(0, 3).map((title, index) => ({
    title,
    matchScore: Math.min(98, baseScores[index] + (levelBonus[level] || 0)),
    why:
      index === 0
        ? `This is the strongest match if you want to grow in ${interest}.`
        : index === 1
          ? "This is a practical alternative path with strong learning value."
          : "This gives you flexibility while you build confidence and experience.",
    firstStep:
      index === 0
        ? `Start one beginner-friendly project directly related to ${title}.`
        : index === 1
          ? `Study the core tools used in ${title} and build one small case study.`
          : "Create a learning plan and collect 2 portfolio-ready examples."
  }));
};

const buildRequiredSkills = (domain, skillsList) => {
  const existing = skillsList.map((item) => item.toLowerCase());

  return uniqueItems(
    [...domain.skills, "Communication", "Problem Solving"].filter(
      (skill) => !existing.includes(skill.toLowerCase())
    )
  ).slice(0, 8);
};

const buildRoadmap = ({ interest, goal, studyTime }, requiredSkills) => {
  const dailyCadence = getStudyCadence(studyTime);
  const firstSkill = requiredSkills[0] || "core fundamentals";
  const secondSkill = requiredSkills[1] || "a practical tool";
  const thirdSkill = requiredSkills[2] || "portfolio building";

  return [
    {
      phase: "First 2 Weeks",
      items: [
        `Understand the basics of ${interest}.`,
        `Study ${firstSkill} and ${secondSkill} for ${dailyCadence}.`,
        "Set up a clean notes system and GitHub account."
      ]
    },
    {
      phase: "First 30 Days",
      items: [
        `Practice ${dailyCadence} with small exercises and guided tutorials.`,
        `Finish one mini project that proves your understanding of ${firstSkill}.`,
        "Write down what you learned and where you got stuck."
      ]
    },
    {
      phase: "Next 60 Days",
      items: [
        `Build one stronger project focused on ${thirdSkill}.`,
        "Improve project quality, structure, and explanation.",
        "Start preparing resume, LinkedIn, or portfolio sections."
      ]
    },
    {
      phase: "Next 90 Days",
      items: [
        goal
          ? `Align your work with your goal: ${goal}.`
          : "Apply your learning toward internships, entry-level roles, or freelance work.",
        "Practice mock interviews and project explanations.",
        "Start applying consistently and refining weak areas each week."
      ]
    }
  ];
};

const buildProjects = (domain, interest, level) => {
  const extraProject =
    level === "Beginner"
      ? `Create one simple beginner project in ${interest} and explain every feature clearly.`
      : `Build one polished case-study project in ${interest} with measurable results.`;

  return uniqueItems([...domain.projects, extraProject]).slice(0, 4);
};

const buildInterviewFocus = (domain) => {
  return uniqueItems([
    ...domain.interviewFocus,
    "Confidence while explaining your project decisions"
  ]).slice(0, 5);
};

const buildNextSteps = ({ goal, interest }, careerOptions, projects) => {
  const steps = [
    `Choose one target role from: ${careerOptions.map((item) => item.title).join(", ")}.`,
    `Start the first project: ${projects[0] || `a beginner project in ${interest}`}.`,
    "Track your progress every week and improve one weak area at a time."
  ];

  const goalText = String(goal || "").toLowerCase();

  if (goalText.includes("internship")) {
    steps.push("Prepare a one-page resume and apply to a few internships every week.");
  } else if (goalText.includes("freelance")) {
    steps.push("Create 2 client-style samples and set up a freelance-ready portfolio.");
  } else if (goalText.includes("job")) {
    steps.push("Practice interview questions and begin targeted job applications.");
  } else {
    steps.push("Build visibility with GitHub, portfolio, LinkedIn, or case studies.");
  }

  return steps.slice(0, 4);
};

const buildGuideData = (profile) => {
  const domain = getDomainConfig(profile.interest, profile.skills);
  const level = detectProfileLevel({
    skillsList: profile.skills,
    education: profile.education
  });

  const careerOptions = buildCareerOptions(domain, level, profile.interest);
  const requiredSkills = buildRequiredSkills(domain, profile.skills);
  const roadmap = buildRoadmap(profile, requiredSkills);
  const projects = buildProjects(domain, profile.interest, level);
  const interviewFocus = buildInterviewFocus(domain);
  const nextSteps = buildNextSteps(profile, careerOptions, projects);

  return {
    overview: `You currently look like a ${level.toLowerCase()} learner in ${domain.label}. A practical next move is to focus on one target role, build 2-3 portfolio-quality projects, and stay consistent with ${getStudyCadence(profile.studyTime)} of study.`,
    profile: {
      interest: profile.interest,
      skills: profile.skills.length > 0 ? profile.skills : ["Beginner"],
      education: profile.education,
      goal: profile.goal,
      workStyle: profile.workStyle,
      studyTime: profile.studyTime,
      level
    },
    careerOptions,
    requiredSkills,
    roadmap,
    projects,
    interviewFocus,
    nextSteps
  };
};

const fallbackGuide = (guideData) => {
  const { profile, careerOptions, requiredSkills, roadmap, projects, nextSteps } =
    guideData;

  return `
Career Direction
You are currently at the ${profile.level} level for ${profile.interest}. A strong next move is to choose one target role, study consistently, and build visible proof of your work.

Best Role Matches
${careerOptions
  .map(
    (item, index) =>
      `${index + 1}. ${item.title} (${item.matchScore}% match) - ${item.why}`
  )
  .join("\n")}

Required Skills
${requiredSkills.map((item) => `- ${item}`).join("\n")}

Roadmap
${roadmap
  .map(
    (phase) =>
      `${phase.phase}\n${phase.items.map((item) => `- ${item}`).join("\n")}`
  )
  .join("\n\n")}

Portfolio Projects
${projects.map((item) => `- ${item}`).join("\n")}

Immediate Next Steps
${nextSteps.map((item) => `- ${item}`).join("\n")}
`.trim();
};

const buildPrompt = (guideData) => {
  const { profile, careerOptions, requiredSkills, roadmap, projects, nextSteps } =
    guideData;

  return `
You are a practical career mentor for students and early professionals.

Student Profile:
- Interest: ${profile.interest}
- Skills: ${profile.skills.join(", ")}
- Education: ${profile.education}
- Goal: ${profile.goal}
- Preferred Work Style: ${profile.workStyle}
- Study Time: ${profile.studyTime}
- Current Level: ${profile.level}

Suggested Roles:
${careerOptions.map((item) => `- ${item.title} (${item.matchScore}% match)`).join("\n")}

Skills To Build:
${requiredSkills.map((item) => `- ${item}`).join("\n")}

Roadmap:
${roadmap
  .map((phase) => `${phase.phase}: ${phase.items.join(" | ")}`)
  .join("\n")}

Projects:
${projects.map((item) => `- ${item}`).join("\n")}

Immediate Next Steps:
${nextSteps.map((item) => `- ${item}`).join("\n")}

Write a clear, motivating career guide in simple language.
Use these sections:
1. Best career direction
2. Top role matches
3. Skills to build
4. 90-day roadmap
5. Portfolio ideas
6. Final action plan

Keep it practical, easy to read, and student-friendly.
`;
};

const toSkillsText = (skills) => {
  return Array.isArray(skills) ? skills.join(", ") : "";
};

const serializeCareerGuide = (doc) => {
  const item = doc?.toObject ? doc.toObject() : doc;

  return {
    _id: String(item._id),
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    inputs: {
      interest: item.interest || "",
      skills: toSkillsText(item.skills),
      education: item.education || "",
      goal: item.goal || "",
      workStyle: item.workStyle || "Flexible",
      studyTime: item.studyTime || "5-7 hrs/week"
    },
    guide: item.guide || "",
    guideData: item.guideData || null,
    aiUsed: Boolean(item.aiUsed)
  };
};

export const careerGuide = async (req, res) => {
  try {
    console.log("Career request:", req.body);

    const interest = cleanText(req.body?.interest);
    const skills = cleanText(req.body?.skills);
    const education = cleanText(req.body?.education, "Not mentioned");
    const goal = cleanText(req.body?.goal, "Become career-ready");
    const workStyle = cleanText(req.body?.workStyle, "Flexible");
    const studyTime = cleanText(req.body?.studyTime, "5-7 hrs/week");

    if (!interest) {
      return res.status(400).json({
        success: false,
        message: "Interest is required"
      });
    }

    const profile = {
      interest,
      skills: splitList(skills),
      education,
      goal,
      workStyle,
      studyTime
    };

    const guideData = buildGuideData(profile);
    let guide = fallbackGuide(guideData);
    let aiUsed = false;

    try {
      const aiReply = await runAI(buildPrompt(guideData));

      if (aiReply && String(aiReply).trim()) {
        guide = String(aiReply).trim();
        aiUsed = true;
      }
    } catch (aiErr) {
      console.error("Career AI fallback used:", aiErr.message);
    }

    const savedGuide = await CareerGuide.create({
      userId: req.user.id,
      interest,
      skills: profile.skills,
      education,
      goal,
      workStyle,
      studyTime,
      guide,
      guideData,
      aiUsed
    });

    return res.json({
      success: true,
      aiUsed,
      guide,
      guideData,
      generatedAt: savedGuide.createdAt,
      savedGuide: serializeCareerGuide(savedGuide)
    });
  } catch (err) {
    console.error("Career Error:", err.message);

    return res.status(500).json({
      success: false,
      message: "Career guidance failed"
    });
  }
};

export const getCareerHistory = async (req, res) => {
  try {
    const guides = await CareerGuide.find({
      userId: req.user.id
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    return res.json({
      success: true,
      data: guides.map((item) => serializeCareerGuide(item))
    });
  } catch (err) {
    console.error("Career history error:", err.message);

    return res.status(500).json({
      success: false,
      message: "Failed to load career history"
    });
  }
};

export const clearCareerHistory = async (req, res) => {
  try {
    await CareerGuide.deleteMany({
      userId: req.user.id
    });

    return res.json({
      success: true,
      message: "Career history cleared"
    });
  } catch (err) {
    console.error("Career history clear error:", err.message);

    return res.status(500).json({
      success: false,
      message: "Failed to clear career history"
    });
  }
};

export const deleteCareerHistoryItem = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid career history id"
      });
    }

    const deleted = await CareerGuide.findOneAndDelete({
      _id: id,
      userId: req.user.id
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Career history item not found"
      });
    }

    return res.json({
      success: true,
      message: "Career history item deleted"
    });
  } catch (err) {
    console.error("Career history delete error:", err.message);

    return res.status(500).json({
      success: false,
      message: "Failed to delete career history item"
    });
  }
};
