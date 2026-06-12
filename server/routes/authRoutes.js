








// // import express from "express";
// // import {
// //   registerUser,
// //   loginUser,
// //   getMe,
// //   updateProfile
// // } from "../controllers/authController.js";
// // import authMiddleware from "../middleware/authMiddleware.js";

// // const router = express.Router();

// // router.get("/test", (req, res) => {
// //   res.json({
// //     success: true,
// //     message: "Auth route working"
// //   });
// // });

// // router.post("/register", registerUser);
// // router.post("/login", loginUser);

// // router.get("/me", authMiddleware, getMe);
// // router.get("/verify", authMiddleware, getMe);
// // router.put("/profile", authMiddleware, updateProfile);

// // router.post("/logout", authMiddleware, (req, res) => {
// //   res.json({
// //     success: true,
// //     message: "Logged out"
// //   });
// // });

// // export default router;








// import express from "express";
// import {
//   registerUser,
//   loginUser,
//   adminLogin,
//   getMe,
//   updateProfile
// } from "../controllers/authController.js";
// import authMiddleware from "../middleware/authMiddleware.js";

// const router = express.Router();

// router.get("/test", (req, res) => {
//   res.json({
//     success: true,
//     message: "Auth route working"
//   });
// });

// router.post("/register", registerUser);
// router.post("/login", loginUser);
// router.post("/admin-login", adminLogin);

// router.get("/me", authMiddleware, getMe);
// router.get("/verify", authMiddleware, getMe);
// router.put("/profile", authMiddleware, updateProfile);

// router.post("/logout", authMiddleware, (req, res) => {
//   res.json({
//     success: true,
//     message: "Logged out"
//   });
// });

// export default router;






import express from "express";
import {
  registerUser,
  loginUser,
  adminLogin,
  getMe,
  updateProfile
} from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Auth route working"
  });
});

router.get("/admin-check", (req, res) => {
  res.json({
    success: true,
    message: "Admin route file updated"
  });
});

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/admin-login", adminLogin);

router.get("/me", authMiddleware, getMe);
router.get("/verify", authMiddleware, getMe);
router.put("/profile", authMiddleware, updateProfile);

router.post("/logout", authMiddleware, (req, res) => {
  res.json({
    success: true,
    message: "Logged out"
  });
});

export default router;
