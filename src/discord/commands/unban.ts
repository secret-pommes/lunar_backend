import { config } from "dotenv";

import Account from "../../../model/account";
import Bans from "../../../model/bans";

import * as changeTokens from "../../token/change";

config();

const { moderatorsIds } = process.env;

module.exports = {
  info: {
    name: "unban",
    description: "Unban a user by display name or discord id",
    options: [
      {
        name: "user",
        description: "user that you want to unban.",
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

    const userToUnban = interaction.options.getString("user");
    let selected;
    let bUseDiscordName = false;

    switch (true) {
      case userToUnban.includes("<@"): {
        selected = userToUnban.split("<@")[1].split(">")[0]; // discord_id (pinged)
        break;
      }

      case userToUnban.includes("id:"): {
        selected = userToUnban.split("id:")[1]; // discord_id
        break;
      }

      default: {
        selected = userToUnban; // display_name
        bUseDiscordName = true;
        break;
      }
    }

    if (!selected) {
      return await interaction.reply({
        content: "Cannot unban user, failed to get username or id.",
        ephemeral: true,
      });
    }

    try {
      await Account.updateOne(
        { DiscordId: selected },
        { $set: { Banned: false } }
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
      current?.HWID.push({ hwid: account.CurrentHardwareId });

      const HWIDIndex: any = current?.HWID.findIndex(
        (x: any) => x.hwid == account.CurrentHardwareId
      );

      if (HWIDIndex != -1) {
        current?.HWID.splice(HWIDIndex, 1);
      }

      await Bans.updateOne(
        { branch: "main" },
        { $set: { HWID: current?.HWID } }
      );

      return await interaction.reply({
        content: `Unbanned ${account.DisplayName} from backend.`,
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
