// import mongoose from "mongoose";

// const studyLogSchema = new mongoose.Schema({

//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//     required: true
//   },

//   // 🔥 PLAN DATA
//   subjects: {
//     type: [String],
//     default: []
//   },

//   days: {
//     type: Number,
//     default: 0
//   },

//   // 🔥 FIXED (IMPORTANT)
//   plan: {
//     type: mongoose.Schema.Types.Mixed,
//     default: null
//   },

//   // 🔥 OPTIONAL (for stats)
//   hours: {
//     type: Number,
//     default: 0
//   },

//   subject: {
//     type: String,
//     default: ""
//   },

//   date: {
//     type: Date,
//     default: Date.now
//   },

//   createdAt: {
//     type: Date,
//     default: Date.now
//   }

// });

// export default mongoose.model("StudyLog", studyLogSchema);








import mongoose from "mongoose";

const studyLogSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  subjects: {
    type: [String],
    default: []
  },

  days: {
    type: Number,
    default: 0
  },

  plan: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },

  hours: {
    type: Number,
    default: 0
  },

  subject: {
    type: String,
    default: ""
  },

  // 🔥 NEW FIELDS (NO BREAKING)
  session: {
    type: Number,
    default: 0
  },

  absent: {
    type: Number,
    default: 0
  },

  alerts: {
    type: Number,
    default: 0
  },

  score: {
    type: Number,
    default: 100
  },

  date: {
    type: Date,
    default: Date.now
  },

  createdAt: {
    type: Date,
    default: Date.now
  }

});

export default mongoose.model("StudyLog", studyLogSchema);
