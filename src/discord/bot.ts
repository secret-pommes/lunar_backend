import { Client, Intents, Interaction, TextChannel } from "discord.js";
import fs from "fs";
import path from "path";
import axios from "axios";
import { config } from "dotenv";

config();

import * as log from "../utils/log";

const {
  appTokenProd,
  appTokenDev,
  bProduction,
  BackendLogChannel,
  ItemShopLogChannel,
} = process.env;

// 4.4x+
const serverTypeIndex: any = {
  playlist_defaultsolo: "Solo",
  playlist_defaultduo: "Duos",
  playlist_defaultsquad: "Squads",
  playlist_blitz_solo: "Blitz - Solo",
  playlist_blitz_duos: "Blitz- Duos",
  playlist_deimos_solo_winter: "LateGame",
};

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MEMBERS,
  ],
});

client.login(appTokenProd);

client.once("ready", () => {
  log.backend("Discord Bot Connected!");

  SendBackendLogMSG(
    ":white_check_mark: Successfully connected to Discord Channel!"
  );

  const commands = client.application?.commands;
  const commandsPath = path.join(__dirname, "commands");

  fs.readdirSync(commandsPath).forEach((fileName: string) => {
    const filePath = path.join(commandsPath, fileName);
    const command = require(filePath);

    if (command && command.info && command.info.name) {
      commands
        ?.create(command.info)
        .then(() => log.debug(`Created discord cmd: ${command.info.name}`))
        .catch((err) =>
          console.error(
            `Failed to create command ${command.info.name}: ${err.message}`
          )
        );
    } else {
      log.warning(`Command file ${fileName} is missing an info property`);
    }
  });

  UpdateActivity();
  setInterval(() => UpdateActivity(), 60 * 1000);
});

client.on("interactionCreate", (interaction: Interaction) => {
  if (
    !interaction.isApplicationCommand() ||
    !fs.existsSync(
      path.join(__dirname, `./commands/${interaction.commandName}.ts`)
    )
  ) {
    log.debug("Client executed command that does not exits!");
    return;
  }
  require(`./commands/${interaction.commandName}`).command(interaction);
  try {
  } catch {
    return;
  }
});

export async function SendBackendLogMSG(message: string) {
  try {
    const SelectedChannel = await client.channels.fetch(
      String(BackendLogChannel)
    );
    if (!SelectedChannel || !(SelectedChannel instanceof TextChannel)) {
      log.debug("Failed to setup SendBackendLogMSG function!");
      return;
    }

    await SelectedChannel.send(message);
  } catch {}
}

// shit
export async function SendBackendReport(title: string, content: string) {
  try {
    const SelectedChannel = await client.channels.fetch(
      String(BackendLogChannel)
    );
    if (!SelectedChannel || !(SelectedChannel instanceof TextChannel)) {
      log.debug("Failed to setup SendBackendLogMSG function!");
      return;
    }

    await SelectedChannel.send(`TITLE: ${title}\n${content}`);
  } catch {}
}

export async function IsInServerCheck(userId: string) {
  const server: any = client.guilds.cache.get("1186048196011630632");
  const member: any = server.members.cache.get(userId);

  return !!member;
}

export function ServerUptimeWebhook(serverType: string, serverId: string) {
  const url =
    "https://discord.com/api/webhooks/1247267111840256080/dKxaLzi1M2QyCWT_bwOwwfZcrgOXPGOTKTJcpkDy3rgvijjWMEQQqhnNJnMqwFdVacfr";

  const playlist = serverTypeIndex[serverType] || "session";

  const embed = {
    // WIP
    title: `A ${playlist} match became available!`,
    color: 0x1f2a82,
    fields: [
      {
        name: `Queue into ${playlist} to join the server!`,
        value: "\u200B",
        inline: true,
      },
    ],
    footer: {
      text: serverId,
    },
    timestamp: new Date().toISOString(),
  };

  const payload = {
    embeds: [embed],
    content: "<@&1195791989778686013>",
  };

  axios
    .post(url, payload)
    .then((response) => log.debug(`Discord Webhook Response: ${response.data}`))
    .catch((err) =>
      log.debug(`Error while sending discord webhook msg: ${err}`)
    );
}

function UpdateActivity() {
  client.user?.setPresence({
    activities: [
      {
        name: "https://up.lunarfn.org",
        type: "WATCHING",
      },
    ],
    status: "online",
    afk: false,
  });
}
