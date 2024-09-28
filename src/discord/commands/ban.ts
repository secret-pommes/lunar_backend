import { config } from "dotenv";

import Account from "../../../model/account";
import Bans from "../../../model/bans";
import * as changeTokens from "../../token/change";

config();

const { moderatorsIds } = process.env;

module.exports = {
  info: {
    name: "ban",
    description: "Ban a user by display name or discord id",
    options: [
      {
        name: "user",
        description: "user that you want to ban.",
        type: 3,
        required: true,
      },
    ],
  },

  command: async (interaction: any) => {
    if (!String(moderatorsIds).includes(interaction.user.id)) {
      return await interaction.reply({
        content:
          "You do not own the required permissions to execure this command.",
        ephemeral: true,
      });
    }

    const userToBan = interaction.options.getString("user");
    let selected;
    let bUseDiscordName = false;

    switch (true) {
      case userToBan.includes("<@"): {
        selected = userToBan.split("<@")[1].split(">")[0]; // discord_id (pinged)
        break;
      }

      case userToBan.includes("id:"): {
        selected = userToBan.split("id:")[1]; // discord_id
        break;
      }

      default: {
        selected = userToBan; // display_name
        bUseDiscordName = true;
        break;
      }
    }

    if (!selected) {
      return await interaction.reply({
        content: "Cannot ban user, failed to get username or id.",
        ephemeral: true,
      });
    }

    try {
      await Account.updateOne(
        { DiscordId: selected },
        { $set: { Banned: true } }
      );

      let account: any;

      if (bUseDiscordName) {
        account = await Account.findOne({
          DisplayName: selected,
        });
      } else {
        account = await Account.findOne({
          DiscordId: selected,
        }).lean();
      }

      const current = await Bans.findOne({ branch: "main" }).lean();
      current?.HWID.push({ hwid: account?.CurrentHardwareId });

      await Bans.updateOne(
        { branch: "main" },
        { $set: { HWID: current?.HWID } }
      );

      changeTokens.BanToken(account?.CurrentHardwareId);
      return await interaction.reply({
        content: `Banned ${account.DisplayName} from backend.`,
        ephemeral: true,
      });
    } catch {
      return await interaction.reply({
        content: `Failed to ban ${selected} because database interaction failed.`,
        ephemeral: true,
      });
    }
  },
};
