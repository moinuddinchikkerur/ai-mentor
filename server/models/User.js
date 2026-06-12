


// // import mongoose from "mongoose";

// // const userSchema = new mongoose.Schema(
// //   {
// //     name: {
// //       type: String,
// //       required: true,
// //       trim: true,
// //       minlength: 2,
// //       maxlength: 60
// //     },

// //     email: {
// //       type: String,
// //       required: true,
// //       unique: true,
// //       lowercase: true,
// //       trim: true,
// //       index: true,
// //       match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
// //     },

// //     password: {
// //       type: String,
// //       required: true,
// //       select: false
// //     },

// //     exam: {
// //       type: String,
// //       default: "",
// //       trim: true,
// //       maxlength: 80
// //     },

// //     targetDate: {
// //       type: Date,
// //       default: null
// //     },

// //     lastLoginAt: {
// //       type: Date,
// //       default: null
// //     }
// //   },
// //   {
// //     timestamps: true
// //   }
// // );

// // export default mongoose.model("User", userSchema);









// import mongoose from "mongoose";

// const userSchema = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//       required: true,
//       trim: true,
//       minlength: 2,
//       maxlength: 60
//     },

//     email: {
//       type: String,
//       required: true,
//       unique: true,
//       lowercase: true,
//       trim: true,
//       index: true,
//       match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
//     },

//     password: {
//       type: String,
//       required: true,
//       select: false
//     },

//     role: {
//       type: String,
//       enum: ["student", "admin"],
//       default: "student"
//     },

//     exam: {
//       type: String,
//       default: "",
//       trim: true,
//       maxlength: 80
//     },

//     targetDate: {
//       type: Date,
//       default: null
//     },

//     lastLoginAt: {
//       type: Date,
//       default: null
//     }
//   },
//   {
//     timestamps: true
//   }
// );

// export default mongoose.model("User", userSchema);








import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 60
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },

    password: {
      type: String,
      required: true,
      select: false
    },

    role: {
      type: String,
      enum: ["student", "admin"],
      default: "student"
    },

    isBlocked: {
      type: Boolean,
      default: false
    },

    exam: {
      type: String,
      default: "",
      trim: true,
      maxlength: 80
    },

    targetDate: {
      type: Date,
      default: null
    },

    lastLoginAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model("User", userSchema);
