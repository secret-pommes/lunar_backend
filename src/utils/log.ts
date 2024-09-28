import fs from "fs";
import path from "path";
import { config } from "dotenv";

import { SendBackendLogMSG } from "../discord/bot";

config();

const { bSendLogsToDiscord, bDebuggingLogs } = process.env;

export function backend(data: string): void {
  if (bSendLogsToDiscord) {
    SendBackendLogMSG(`[Backend] ${data}`);
  }

  console.log(`\x1b[32m[Backend]\x1b[0m ${data}`);
}

export function account(data: string): void {
  if (bSendLogsToDiscord) {
    SendBackendLogMSG(`[Account] ${data}`);
  }

  console.log(`\x1b[32m[Account]\x1b[0m ${data}`);
}

export function warning(data: string): void {
  if (bSendLogsToDiscord) {
    SendBackendLogMSG(`[Warning] ${data}`);
  }

  console.log(`\x1b[31m[Warning]\x1b[0m ${data}`);
}

export function debug(data: string): void {
  if (bDebuggingLogs) {
    console.log(`\x1b[33;1m[Debug]\x1b[0m ${data}`);

    if (bSendLogsToDiscord) {
      SendBackendLogMSG(`[Debug] ${data}`);
    }
  }
}

export function boot() {
  const ascii = fs.readFileSync(
    path.join(__dirname, "../../resources/ascii.txt")
  );
  const { version } = require("../../package.json");
  console.log(`\x1b[34;1m${ascii}\x1b[0m\n- v${version} by not_secret1337`);
}
