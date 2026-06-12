





// // import User from "../models/User.js";
// // import bcrypt from "bcryptjs";
// // import jwt from "jsonwebtoken";

// // const isValidEmail = (email) => {
// //   return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
// // };

// // const createToken = (userId) => {
// //   if (!process.env.JWT_SECRET) {
// //     throw new Error("JWT_SECRET missing in .env");
// //   }

// //   return jwt.sign(
// //     { id: userId },
// //     process.env.JWT_SECRET,
// //     { expiresIn: "7d" }
// //   );
// // };

// // const normalizeName = (value) => {
// //   return String(value || "").trim().replace(/\s+/g, " ");
// // };

// // const normalizeEmail = (value) => {
// //   return String(value || "").trim().toLowerCase();
// // };

// // const normalizeExam = (value) => {
// //   return String(value || "").trim().replace(/\s+/g, " ");
// // };

// // const formatDateOnly = (value) => {
// //   if (!value) return null;

// //   const date = new Date(value);

// //   if (Number.isNaN(date.getTime())) {
// //     return null;
// //   }

// //   const year = date.getUTCFullYear();
// //   const month = String(date.getUTCMonth() + 1).padStart(2, "0");
// //   const day = String(date.getUTCDate()).padStart(2, "0");

// //   return `${year}-${month}-${day}`;
// // };

// // const getProfileCompletion = (user) => {
// //   let completed = 0;

// //   if (user.name) completed += 1;
// //   if (user.email) completed += 1;
// //   if (user.exam) completed += 1;
// //   if (user.targetDate) completed += 1;

// //   return Math.round((completed / 4) * 100);
// // };

// // const cleanUser = (user) => {
// //   return {
// //     id: String(user._id),
// //     name: user.name,
// //     email: user.email,
// //     exam: user.exam || "",
// //     targetDate: formatDateOnly(user.targetDate),
// //     lastLoginAt: user.lastLoginAt ? user.lastLoginAt.toISOString() : null,
// //     createdAt: user.createdAt ? user.createdAt.toISOString() : null,
// //     updatedAt: user.updatedAt ? user.updatedAt.toISOString() : null,
// //     profileCompletion: getProfileCompletion(user)
// //   };
// // };

// // const parseTargetDate = (value) => {
// //   if (!value) return null;

// //   const text = String(value).trim();
// //   const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);

// //   if (match) {
// //     const year = Number(match[1]);
// //     const month = Number(match[2]);
// //     const day = Number(match[3]);

// //     const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0));

// //     if (
// //       date.getUTCFullYear() !== year ||
// //       date.getUTCMonth() !== month - 1 ||
// //       date.getUTCDate() !== day
// //     ) {
// //       return false;
// //     }

// //     return date;
// //   }

// //   const parsed = new Date(text);

// //   if (Number.isNaN(parsed.getTime())) {
// //     return false;
// //   }

// //   return new Date(
// //     Date.UTC(
// //       parsed.getUTCFullYear(),
// //       parsed.getUTCMonth(),
// //       parsed.getUTCDate(),
// //       12,
// //       0,
// //       0,
// //       0
// //     )
// //   );
// // };

// // const isPastDate = (date) => {
// //   if (!date) return false;

// //   const now = new Date();

// //   const todayUtc = Date.UTC(
// //     now.getUTCFullYear(),
// //     now.getUTCMonth(),
// //     now.getUTCDate()
// //   );

// //   const compareUtc = Date.UTC(
// //     date.getUTCFullYear(),
// //     date.getUTCMonth(),
// //     date.getUTCDate()
// //   );

// //   return compareUtc < todayUtc;
// // };

// // export const registerUser = async (req, res) => {
// //   try {
// //     const { name, email, password, exam, targetDate } = req.body;

// //     if (!name?.trim() || !email?.trim() || !password) {
// //       return res.status(400).json({
// //         success: false,
// //         message: "Name, email and password are required"
// //       });
// //     }

// //     const normalizedName = normalizeName(name);
// //     const normalizedEmail = normalizeEmail(email);
// //     const normalizedExam = normalizeExam(exam);

// //     if (normalizedName.length < 2) {
// //       return res.status(400).json({
// //         success: false,
// //         message: "Name must be at least 2 characters"
// //       });
// //     }

// //     if (normalizedName.length > 60) {
// //       return res.status(400).json({
// //         success: false,
// //         message: "Name must be 60 characters or less"
// //       });
// //     }

// //     if (!isValidEmail(normalizedEmail)) {
// //       return res.status(400).json({
// //         success: false,
// //         message: "Please enter a valid email"
// //       });
// //     }

// //     if (password.length < 6) {
// //       return res.status(400).json({
// //         success: false,
// //         message: "Password must be at least 6 characters"
// //       });
// //     }

// //     if (normalizedExam.length > 80) {
// //       return res.status(400).json({
// //         success: false,
// //         message: "Exam name must be 80 characters or less"
// //       });
// //     }

// //     const parsedTargetDate = parseTargetDate(targetDate);

// //     if (parsedTargetDate === false) {
// //       return res.status(400).json({
// //         success: false,
// //         message: "Invalid target date"
// //       });
// //     }

// //     if (parsedTargetDate && isPastDate(parsedTargetDate)) {
// //       return res.status(400).json({
// //         success: false,
// //         message: "Target date cannot be in the past"
// //       });
// //     }

// //     const exist = await User.exists({ email: normalizedEmail });

// //     if (exist) {
// //       return res.status(400).json({
// //         success: false,
// //         message: "User already exists"
// //       });
// //     }

// //     const hashedPassword = await bcrypt.hash(password, 10);

// //     const user = await User.create({
// //       name: normalizedName,
// //       email: normalizedEmail,
// //       password: hashedPassword,
// //       exam: normalizedExam,
// //       targetDate: parsedTargetDate
// //     });

// //     return res.status(201).json({
// //       success: true,
// //       message: "Registered Successfully. Please login.",
// //       user: cleanUser(user)
// //     });
// //   } catch (err) {
// //     console.error("Register Error:", err);

// //     if (err.code === 11000) {
// //       return res.status(400).json({
// //         success: false,
// //         message: "Email already in use"
// //       });
// //     }

// //     return res.status(500).json({
// //       success: false,
// //       message: err.message || "Server error"
// //     });
// //   }
// // };

// // export const loginUser = async (req, res) => {
// //   try {
// //     const { email, password } = req.body;

// //     if (!email?.trim() || !password) {
// //       return res.status(400).json({
// //         success: false,
// //         message: "Email and password are required"
// //       });
// //     }

// //     const normalizedEmail = normalizeEmail(email);

// //     const user = await User
// //       .findOne({ email: normalizedEmail })
// //       .select("+password");

// //     if (!user) {
// //       return res.status(400).json({
// //         success: false,
// //         message: "Invalid credentials"
// //       });
// //     }

// //     const isMatch = await bcrypt.compare(password, user.password);

// //     if (!isMatch) {
// //       return res.status(400).json({
// //         success: false,
// //         message: "Invalid credentials"
// //       });
// //     }

// //     user.lastLoginAt = new Date();
// //     await user.save();

// //     const token = createToken(user._id);

// //     return res.status(200).json({
// //       success: true,
// //       token,
// //       user: cleanUser(user)
// //     });
// //   } catch (err) {
// //     console.error("Login Error:", err);

// //     return res.status(500).json({
// //       success: false,
// //       message: err.message || "Server error"
// //     });
// //   }
// // };

// // export const getMe = async (req, res) => {
// //   try {
// //     const user = await User.findById(req.user.id);

// //     if (!user) {
// //       return res.status(404).json({
// //         success: false,
// //         message: "User not found"
// //       });
// //     }

// //     return res.json({
// //       success: true,
// //       user: cleanUser(user)
// //     });
// //   } catch (err) {
// //     console.error("Get Me Error:", err);

// //     return res.status(500).json({
// //       success: false,
// //       message: "Failed to load profile"
// //     });
// //   }
// // };

// // export const updateProfile = async (req, res) => {
// //   try {
// //     const {
// //       name,
// //       email,
// //       exam,
// //       targetDate,
// //       oldPassword,
// //       newPassword
// //     } = req.body;

// //     const user = await User
// //       .findById(req.user.id)
// //       .select("+password");

// //     if (!user) {
// //       return res.status(404).json({
// //         success: false,
// //         message: "User not found"
// //       });
// //     }

// //     if (!name?.trim() || !email?.trim()) {
// //       return res.status(400).json({
// //         success: false,
// //         message: "Name and email are required"
// //       });
// //     }

// //     const normalizedName = normalizeName(name);
// //     const normalizedEmail = normalizeEmail(email);
// //     const normalizedExam = normalizeExam(exam);

// //     if (normalizedName.length < 2) {
// //       return res.status(400).json({
// //         success: false,
// //         message: "Name must be at least 2 characters"
// //       });
// //     }

// //     if (normalizedName.length > 60) {
// //       return res.status(400).json({
// //         success: false,
// //         message: "Name must be 60 characters or less"
// //       });
// //     }

// //     if (!isValidEmail(normalizedEmail)) {
// //       return res.status(400).json({
// //         success: false,
// //         message: "Please enter a valid email"
// //       });
// //     }

// //     if (normalizedExam.length > 80) {
// //       return res.status(400).json({
// //         success: false,
// //         message: "Exam name must be 80 characters or less"
// //       });
// //     }

// //     const parsedTargetDate = parseTargetDate(targetDate);

// //     if (parsedTargetDate === false) {
// //       return res.status(400).json({
// //         success: false,
// //         message: "Invalid target date"
// //       });
// //     }

// //     if (parsedTargetDate && isPastDate(parsedTargetDate)) {
// //       return res.status(400).json({
// //         success: false,
// //         message: "Target date cannot be in the past"
// //       });
// //     }

// //     const emailTaken = await User.exists({
// //       email: normalizedEmail,
// //       _id: { $ne: user._id }
// //     });

// //     if (emailTaken) {
// //       return res.status(400).json({
// //         success: false,
// //         message: "Email already in use"
// //       });
// //     }

// //     user.name = normalizedName;
// //     user.email = normalizedEmail;
// //     user.exam = normalizedExam;
// //     user.targetDate = parsedTargetDate;

// //     const wantsPasswordChange = Boolean(oldPassword || newPassword);

// //     if (wantsPasswordChange) {
// //       if (!oldPassword) {
// //         return res.status(400).json({
// //           success: false,
// //           message: "Old password is required"
// //         });
// //       }

// //       if (!newPassword) {
// //         return res.status(400).json({
// //           success: false,
// //           message: "New password is required"
// //         });
// //       }

// //       if (newPassword.length < 6) {
// //         return res.status(400).json({
// //           success: false,
// //           message: "New password must be at least 6 characters"
// //         });
// //       }

// //       if (oldPassword === newPassword) {
// //         return res.status(400).json({
// //           success: false,
// //           message: "New password must be different from old password"
// //         });
// //       }

// //       const isMatch = await bcrypt.compare(oldPassword, user.password);

// //       if (!isMatch) {
// //         return res.status(400).json({
// //           success: false,
// //           message: "Old password incorrect"
// //         });
// //       }

// //       user.password = await bcrypt.hash(newPassword, 10);
// //     }

// //     await user.save();

// //     return res.json({
// //       success: true,
// //       message: "Profile updated",
// //       user: cleanUser(user)
// //     });
// //   } catch (err) {
// //     console.error("Update Profile Error:", err);

// //     if (err.code === 11000) {
// //       return res.status(400).json({
// //         success: false,
// //         message: "Email already in use"
// //       });
// //     }

// //     return res.status(500).json({
// //       success: false,
// //       message: "Profile update failed"
// //     });
// //   }
// // };
















// import User from "../models/User.js";
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";

// const isValidEmail = (email) => {
//   return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
// };

// const createToken = (userId) => {
//   if (!process.env.JWT_SECRET) {
//     throw new Error("JWT_SECRET missing in .env");
//   }

//   return jwt.sign(
//     { id: userId },
//     process.env.JWT_SECRET,
//     { expiresIn: "7d" }
//   );
// };

// const normalizeName = (value) => {
//   return String(value || "").trim().replace(/\s+/g, " ");
// };

// const normalizeEmail = (value) => {
//   return String(value || "").trim().toLowerCase();
// };

// const normalizeExam = (value) => {
//   return String(value || "").trim().replace(/\s+/g, " ");
// };

// const formatDateOnly = (value) => {
//   if (!value) return null;

//   const date = new Date(value);

//   if (Number.isNaN(date.getTime())) {
//     return null;
//   }

//   const year = date.getUTCFullYear();
//   const month = String(date.getUTCMonth() + 1).padStart(2, "0");
//   const day = String(date.getUTCDate()).padStart(2, "0");

//   return `${year}-${month}-${day}`;
// };

// const getProfileCompletion = (user) => {
//   let completed = 0;

//   if (user.name) completed += 1;
//   if (user.email) completed += 1;
//   if (user.exam) completed += 1;
//   if (user.targetDate) completed += 1;

//   return Math.round((completed / 4) * 100);
// };

// const cleanUser = (user) => {
//   return {
//     id: String(user._id),
//     name: user.name,
//     email: user.email,
//     role: user.role || "student",
//     exam: user.exam || "",
//     targetDate: formatDateOnly(user.targetDate),
//     lastLoginAt: user.lastLoginAt ? user.lastLoginAt.toISOString() : null,
//     createdAt: user.createdAt ? user.createdAt.toISOString() : null,
//     updatedAt: user.updatedAt ? user.updatedAt.toISOString() : null,
//     profileCompletion: getProfileCompletion(user)
//   };
// };

// const parseTargetDate = (value) => {
//   if (!value) return null;

//   const text = String(value).trim();
//   const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);

//   if (match) {
//     const year = Number(match[1]);
//     const month = Number(match[2]);
//     const day = Number(match[3]);

//     const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0));

//     if (
//       date.getUTCFullYear() !== year ||
//       date.getUTCMonth() !== month - 1 ||
//       date.getUTCDate() !== day
//     ) {
//       return false;
//     }

//     return date;
//   }

//   const parsed = new Date(text);

//   if (Number.isNaN(parsed.getTime())) {
//     return false;
//   }

//   return new Date(
//     Date.UTC(
//       parsed.getUTCFullYear(),
//       parsed.getUTCMonth(),
//       parsed.getUTCDate(),
//       12,
//       0,
//       0,
//       0
//     )
//   );
// };

// const isPastDate = (date) => {
//   if (!date) return false;

//   const now = new Date();

//   const todayUtc = Date.UTC(
//     now.getUTCFullYear(),
//     now.getUTCMonth(),
//     now.getUTCDate()
//   );

//   const compareUtc = Date.UTC(
//     date.getUTCFullYear(),
//     date.getUTCMonth(),
//     date.getUTCDate()
//   );

//   return compareUtc < todayUtc;
// };

// export const registerUser = async (req, res) => {
//   try {
//     const { name, email, password, exam, targetDate } = req.body;

//     if (!name?.trim() || !email?.trim() || !password) {
//       return res.status(400).json({
//         success: false,
//         message: "Name, email and password are required"
//       });
//     }

//     const normalizedName = normalizeName(name);
//     const normalizedEmail = normalizeEmail(email);
//     const normalizedExam = normalizeExam(exam);

//     if (normalizedName.length < 2) {
//       return res.status(400).json({
//         success: false,
//         message: "Name must be at least 2 characters"
//       });
//     }

//     if (normalizedName.length > 60) {
//       return res.status(400).json({
//         success: false,
//         message: "Name must be 60 characters or less"
//       });
//     }

//     if (!isValidEmail(normalizedEmail)) {
//       return res.status(400).json({
//         success: false,
//         message: "Please enter a valid email"
//       });
//     }

//     if (password.length < 6) {
//       return res.status(400).json({
//         success: false,
//         message: "Password must be at least 6 characters"
//       });
//     }

//     if (normalizedExam.length > 80) {
//       return res.status(400).json({
//         success: false,
//         message: "Exam name must be 80 characters or less"
//       });
//     }

//     const parsedTargetDate = parseTargetDate(targetDate);

//     if (parsedTargetDate === false) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid target date"
//       });
//     }

//     if (parsedTargetDate && isPastDate(parsedTargetDate)) {
//       return res.status(400).json({
//         success: false,
//         message: "Target date cannot be in the past"
//       });
//     }

//     const exist = await User.exists({ email: normalizedEmail });

//     if (exist) {
//       return res.status(400).json({
//         success: false,
//         message: "User already exists"
//       });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const user = await User.create({
//       name: normalizedName,
//       email: normalizedEmail,
//       password: hashedPassword,
//       exam: normalizedExam,
//       targetDate: parsedTargetDate
//     });

//     return res.status(201).json({
//       success: true,
//       message: "Registered Successfully. Please login.",
//       user: cleanUser(user)
//     });
//   } catch (err) {
//     console.error("Register Error:", err);

//     if (err.code === 11000) {
//       return res.status(400).json({
//         success: false,
//         message: "Email already in use"
//       });
//     }

//     return res.status(500).json({
//       success: false,
//       message: err.message || "Server error"
//     });
//   }
// };

// export const loginUser = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     if (!email?.trim() || !password) {
//       return res.status(400).json({
//         success: false,
//         message: "Email and password are required"
//       });
//     }

//     const normalizedEmail = normalizeEmail(email);

//     const user = await User
//       .findOne({ email: normalizedEmail })
//       .select("+password");

//     if (!user) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid credentials"
//       });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);

//     if (!isMatch) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid credentials"
//       });
//     }

//     user.lastLoginAt = new Date();
//     await user.save();

//     const token = createToken(user._id);

//     return res.status(200).json({
//       success: true,
//       token,
//       user: cleanUser(user)
//     });
//   } catch (err) {
//     console.error("Login Error:", err);

//     return res.status(500).json({
//       success: false,
//       message: err.message || "Server error"
//     });
//   }
// };

// export const adminLogin = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     if (!email?.trim() || !password) {
//       return res.status(400).json({
//         success: false,
//         message: "Email and password are required"
//       });
//     }

//     const normalizedEmail = normalizeEmail(email);

//     const user = await User
//       .findOne({ email: normalizedEmail })
//       .select("+password");

//     if (!user) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid admin credentials"
//       });
//     }

//     if (user.role !== "admin") {
//       return res.status(403).json({
//         success: false,
//         message: "Admin access only"
//       });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);

//     if (!isMatch) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid admin credentials"
//       });
//     }

//     user.lastLoginAt = new Date();
//     await user.save();

//     const token = createToken(user._id);

//     return res.status(200).json({
//       success: true,
//       token,
//       user: cleanUser(user)
//     });
//   } catch (err) {
//     console.error("Admin Login Error:", err);

//     return res.status(500).json({
//       success: false,
//       message: err.message || "Server error"
//     });
//   }
// };

// export const getMe = async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id);

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found"
//       });
//     }

//     return res.json({
//       success: true,
//       user: cleanUser(user)
//     });
//   } catch (err) {
//     console.error("Get Me Error:", err);

//     return res.status(500).json({
//       success: false,
//       message: "Failed to load profile"
//     });
//   }
// };

// export const updateProfile = async (req, res) => {
//   try {
//     const {
//       name,
//       email,
//       exam,
//       targetDate,
//       oldPassword,
//       newPassword
//     } = req.body;

//     const user = await User
//       .findById(req.user.id)
//       .select("+password");

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found"
//       });
//     }

//     if (!name?.trim() || !email?.trim()) {
//       return res.status(400).json({
//         success: false,
//         message: "Name and email are required"
//       });
//     }

//     const normalizedName = normalizeName(name);
//     const normalizedEmail = normalizeEmail(email);
//     const normalizedExam = normalizeExam(exam);

//     if (normalizedName.length < 2) {
//       return res.status(400).json({
//         success: false,
//         message: "Name must be at least 2 characters"
//       });
//     }

//     if (normalizedName.length > 60) {
//       return res.status(400).json({
//         success: false,
//         message: "Name must be 60 characters or less"
//       });
//     }

//     if (!isValidEmail(normalizedEmail)) {
//       return res.status(400).json({
//         success: false,
//         message: "Please enter a valid email"
//       });
//     }

//     if (normalizedExam.length > 80) {
//       return res.status(400).json({
//         success: false,
//         message: "Exam name must be 80 characters or less"
//       });
//     }

//     const parsedTargetDate = parseTargetDate(targetDate);

//     if (parsedTargetDate === false) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid target date"
//       });
//     }

//     if (parsedTargetDate && isPastDate(parsedTargetDate)) {
//       return res.status(400).json({
//         success: false,
//         message: "Target date cannot be in the past"
//       });
//     }

//     const emailTaken = await User.exists({
//       email: normalizedEmail,
//       _id: { $ne: user._id }
//     });

//     if (emailTaken) {
//       return res.status(400).json({
//         success: false,
//         message: "Email already in use"
//       });
//     }

//     user.name = normalizedName;
//     user.email = normalizedEmail;
//     user.exam = normalizedExam;
//     user.targetDate = parsedTargetDate;

//     const wantsPasswordChange = Boolean(oldPassword || newPassword);

//     if (wantsPasswordChange) {
//       if (!oldPassword) {
//         return res.status(400).json({
//           success: false,
//           message: "Old password is required"
//         });
//       }

//       if (!newPassword) {
//         return res.status(400).json({
//           success: false,
//           message: "New password is required"
//         });
//       }

//       if (newPassword.length < 6) {
//         return res.status(400).json({
//           success: false,
//           message: "New password must be at least 6 characters"
//         });
//       }

//       if (oldPassword === newPassword) {
//         return res.status(400).json({
//           success: false,
//           message: "New password must be different from old password"
//         });
//       }

//       const isMatch = await bcrypt.compare(oldPassword, user.password);

//       if (!isMatch) {
//         return res.status(400).json({
//           success: false,
//           message: "Old password incorrect"
//         });
//       }

//       user.password = await bcrypt.hash(newPassword, 10);
//     }

//     await user.save();

//     return res.json({
//       success: true,
//       message: "Profile updated",
//       user: cleanUser(user)
//     });
//   } catch (err) {
//     console.error("Update Profile Error:", err);

//     if (err.code === 11000) {
//       return res.status(400).json({
//         success: false,
//         message: "Email already in use"
//       });
//     }

//     return res.status(500).json({
//       success: false,
//       message: "Profile update failed"
//     });
//   }
// };






import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const createToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET missing in .env");
  }

  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

const normalizeName = (value) => {
  return String(value || "").trim().replace(/\s+/g, " ");
};

const normalizeEmail = (value) => {
  return String(value || "").trim().toLowerCase();
};

const normalizeExam = (value) => {
  return String(value || "").trim().replace(/\s+/g, " ");
};

const formatDateOnly = (value) => {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getProfileCompletion = (user) => {
  let completed = 0;

  if (user.name) completed += 1;
  if (user.email) completed += 1;
  if (user.exam) completed += 1;
  if (user.targetDate) completed += 1;

  return Math.round((completed / 4) * 100);
};

const cleanUser = (user) => {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role || "student",
    isBlocked: Boolean(user.isBlocked),
    exam: user.exam || "",
    targetDate: formatDateOnly(user.targetDate),
    lastLoginAt: user.lastLoginAt ? user.lastLoginAt.toISOString() : null,
    createdAt: user.createdAt ? user.createdAt.toISOString() : null,
    updatedAt: user.updatedAt ? user.updatedAt.toISOString() : null,
    profileCompletion: getProfileCompletion(user)
  };
};

const parseTargetDate = (value) => {
  if (!value) return null;

  const text = String(value).trim();
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);

  if (match) {
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);

    const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0));

    if (
      date.getUTCFullYear() !== year ||
      date.getUTCMonth() !== month - 1 ||
      date.getUTCDate() !== day
    ) {
      return false;
    }

    return date;
  }

  const parsed = new Date(text);

  if (Number.isNaN(parsed.getTime())) {
    return false;
  }

  return new Date(
    Date.UTC(
      parsed.getUTCFullYear(),
      parsed.getUTCMonth(),
      parsed.getUTCDate(),
      12,
      0,
      0,
      0
    )
  );
};

const isPastDate = (date) => {
  if (!date) return false;

  const now = new Date();

  const todayUtc = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate()
  );

  const compareUtc = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate()
  );

  return compareUtc < todayUtc;
};

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, exam, targetDate } = req.body;

    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required"
      });
    }

    const normalizedName = normalizeName(name);
    const normalizedEmail = normalizeEmail(email);
    const normalizedExam = normalizeExam(exam);

    if (normalizedName.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Name must be at least 2 characters"
      });
    }

    if (normalizedName.length > 60) {
      return res.status(400).json({
        success: false,
        message: "Name must be 60 characters or less"
      });
    }

    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email"
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters"
      });
    }

    if (normalizedExam.length > 80) {
      return res.status(400).json({
        success: false,
        message: "Exam name must be 80 characters or less"
      });
    }

    const parsedTargetDate = parseTargetDate(targetDate);

    if (parsedTargetDate === false) {
      return res.status(400).json({
        success: false,
        message: "Invalid target date"
      });
    }

    if (parsedTargetDate && isPastDate(parsedTargetDate)) {
      return res.status(400).json({
        success: false,
        message: "Target date cannot be in the past"
      });
    }

    const exist = await User.exists({ email: normalizedEmail });

    if (exist) {
      return res.status(400).json({
        success: false,
        message: "User already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: normalizedName,
      email: normalizedEmail,
      password: hashedPassword,
      exam: normalizedExam,
      targetDate: parsedTargetDate
    });

    return res.status(201).json({
      success: true,
      message: "Registered Successfully. Please login.",
      user: cleanUser(user)
    });
  } catch (err) {
    console.error("Register Error:", err);

    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Email already in use"
      });
    }

    return res.status(500).json({
      success: false,
      message: err.message || "Server error"
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    const normalizedEmail = normalizeEmail(email);

    const user = await User
      .findOne({ email: normalizedEmail })
      .select("+password");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: "Your account has been blocked by admin"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    user.lastLoginAt = new Date();
    await user.save();

    const token = createToken(user._id);

    return res.status(200).json({
      success: true,
      token,
      user: cleanUser(user)
    });
  } catch (err) {
    console.error("Login Error:", err);

    return res.status(500).json({
      success: false,
      message: err.message || "Server error"
    });
  }
};

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    const normalizedEmail = normalizeEmail(email);

    const user = await User
      .findOne({ email: normalizedEmail })
      .select("+password");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid admin credentials"
      });
    }

    if (user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access only"
      });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: "This admin account is blocked"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid admin credentials"
      });
    }

    user.lastLoginAt = new Date();
    await user.save();

    const token = createToken(user._id);

    return res.status(200).json({
      success: true,
      token,
      user: cleanUser(user)
    });
  } catch (err) {
    console.error("Admin Login Error:", err);

    return res.status(500).json({
      success: false,
      message: err.message || "Server error"
    });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    return res.json({
      success: true,
      user: cleanUser(user)
    });
  } catch (err) {
    console.error("Get Me Error:", err);

    return res.status(500).json({
      success: false,
      message: "Failed to load profile"
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const {
      name,
      email,
      exam,
      targetDate,
      oldPassword,
      newPassword
    } = req.body;

    const user = await User
      .findById(req.user.id)
      .select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (!name?.trim() || !email?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name and email are required"
      });
    }

    const normalizedName = normalizeName(name);
    const normalizedEmail = normalizeEmail(email);
    const normalizedExam = normalizeExam(exam);

    if (normalizedName.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Name must be at least 2 characters"
      });
    }

    if (normalizedName.length > 60) {
      return res.status(400).json({
        success: false,
        message: "Name must be 60 characters or less"
      });
    }

    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email"
      });
    }

    if (normalizedExam.length > 80) {
      return res.status(400).json({
        success: false,
        message: "Exam name must be 80 characters or less"
      });
    }

    const parsedTargetDate = parseTargetDate(targetDate);

    if (parsedTargetDate === false) {
      return res.status(400).json({
        success: false,
        message: "Invalid target date"
      });
    }

    if (parsedTargetDate && isPastDate(parsedTargetDate)) {
      return res.status(400).json({
        success: false,
        message: "Target date cannot be in the past"
      });
    }

    const emailTaken = await User.exists({
      email: normalizedEmail,
      _id: { $ne: user._id }
    });

    if (emailTaken) {
      return res.status(400).json({
        success: false,
        message: "Email already in use"
      });
    }

    user.name = normalizedName;
    user.email = normalizedEmail;
    user.exam = normalizedExam;
    user.targetDate = parsedTargetDate;

    const wantsPasswordChange = Boolean(oldPassword || newPassword);

    if (wantsPasswordChange) {
      if (!oldPassword) {
        return res.status(400).json({
          success: false,
          message: "Old password is required"
        });
      }

      if (!newPassword) {
        return res.status(400).json({
          success: false,
          message: "New password is required"
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: "New password must be at least 6 characters"
        });
      }

      if (oldPassword === newPassword) {
        return res.status(400).json({
          success: false,
          message: "New password must be different from old password"
        });
      }

      const isMatch = await bcrypt.compare(oldPassword, user.password);

      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: "Old password incorrect"
        });
      }

      user.password = await bcrypt.hash(newPassword, 10);
    }

    await user.save();

    return res.json({
      success: true,
      message: "Profile updated",
      user: cleanUser(user)
    });
  } catch (err) {
    console.error("Update Profile Error:", err);

    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Email already in use"
      });
    }

    return res.status(500).json({
      success: false,
      message: "Profile update failed"
    });
  }
};
