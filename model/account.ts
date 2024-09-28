import mongoose from "mongoose";

export default mongoose.model(
  "Accounts",
  new mongoose.Schema(
    {
      accountId: { type: String, required: true },
      created: { type: String, default: new Date().toISOString() },

      // Account
      DiscordId: { type: String, required: true },
      DisplayName: { type: String, required: true },
      Email: { type: String, required: true },
      Token: { type: String, required: true },
      Banned: { type: Boolean, default: false },
      CurrentHardwareId: { type: String, default: "" },
    },
    {
      collection: "Accounts",
    }
  )
);
