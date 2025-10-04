const mongoose = require("mongoose");
const { Schema } = mongoose;

const EvaluationSchema = new Schema(
  {
    hfsLevel: { type: Number, required: true },        // 1,2,3 หรือ 5 (5 = ไม่พบอาการ)
    at: { type: Date, default: Date.now },             // เวลาที่ประเมิน
  },
  { _id: false }
);

const EstimationSchema = new Schema(
  {
    painLevel: { type: Number, required: true, min: 0, max: 10 },

    // เก็บรูปเป็น base64 string เหมือนเดิม (8 รูป)
    photos: {
      type: [String],
      required: true,
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length === 8,
        message: "photos ต้องมี 8 รูป",
      },
    },

    hfsLevel: { type: Number, default: 0, enum: [0, 1, 2, 3, 5] },

    from: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },


    time: String,  
    date: String,  

    to: { type: String, required: true, default: "admin" },

    evaluations: {
      type: Map,
      of: EvaluationSchema,
      default: {},
    },
  },
  {
    timestamps: true,  
    minimize: false,  
  }
);

EstimationSchema.index({ from: 1, createdAt: -1 });

module.exports = mongoose.model("Estimation", EstimationSchema);