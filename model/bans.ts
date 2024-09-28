import mongoose from "mongoose";

export default mongoose.model(
  "AC",
  new mongoose.Schema(
    {
      created: { type: String, default: new Date().toISOString() },

      Updated_At: { type: String, required: true },
      branch: { type: String, required: true },
      HWID: { type: Array, default: [] },
    },
    {
      collection: "Bans",
    }
  )
);
