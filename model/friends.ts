import mongoose from "mongoose";

export default mongoose.model(
  "Friends",
  new mongoose.Schema(
    {
      accountId: { type: String, required: true },
      created: { type: String, default: new Date().toISOString() },

      // Friendlist
      Accepted: { type: Array, default: [] },
      Blocked: { type: Array, default: [] },
      Incoming: { type: Array, default: [] },
      Outgoing: { type: Array, default: [] },
    },
    { collection: "Friends" }
  )
);
