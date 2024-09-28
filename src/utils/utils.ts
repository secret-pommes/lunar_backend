import axios from "axios";
import path from "path";
import crypto from "crypto";
import { FastifyRequest } from "fastify";
import { config } from "dotenv";

import Friends from "../../model/friends";
import * as log from "./log";

config();

const EncryptKey =
  "d0a3b02d9d4b3c8a899e38d5f792a3a98f7398e08c020ea19a0c5a3a011a5b7f";
const IVLength = 16;

export function FNVersion(req: FastifyRequest) {
  const agent = req.headers["user-agent"] || "";

  let final = {
    season: 0,
    version: 0.0,
  };

  // v2.5+
  final.season = Number(agent.split("-")[1]?.split(".")[0]);
  final.version = Number(agent.split("-")[1]?.split("-")[0]);

  if (agent.includes("Next")) {
    final.season = 2;
  } else if (agent.includes("3807424")) {
    final.season = 2;
    final.version = 1.11;
  } else if (agent.includes("3870737")) {
    final.season = 2;
    final.version = Number("2.4.2");
  } else if (agent.includes("3724489")) {
    final.season = 1;
    final.version = 1.8;
  }

  return final;
}

export function ClientLang(req: FastifyRequest) {
  const agent = req.headers["accept-language"]?.split("-")[0] || "en";
  let lang: string;

  try {
    lang = agent.toLowerCase();
  } catch {
    lang = "en";
  }

  return lang;
}

export function getFileType(file: any) {
  const ending = path.extname(file);

  switch (ending) {
    case ".html":
      return "text/html";
    case ".css":
      return "text/css";
    case ".js":
      return "application/javascript";
    default:
      return "application/octet-stream";
  }
}

export function ClientPlatform(req: FastifyRequest) {
  const agent = req.headers["user-agent"] || "";

  let platform = agent.split(" ")[1]?.split("/")[0]?.toLowerCase() || "windows";

  if (
    agent.includes("Cert") ||
    agent.includes("Live") ||
    agent.includes("Next")
  ) {
    platform = "windows";
  }
  return platform;
}

export function GetEndOfDayAsISOString(date: Date) {
  date.setHours(23, 59, 59, 999);
  const ISOString = date.toISOString();
  return ISOString;
}

export async function MakePostRequest(
  url: string,
  data: any,
  retries: number = 3
) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await axios.post(url, data);
      if (res.status != 200 && res.status != 204) return false;
      return res.data;
    } catch (err) {
      log.warning(`Failed to make post request!\nURL: ${url}\nError: {err}`);
      return false;
    }
  }
}

export function decryptString(str: string) {
  try {
    const parts = str.split(":");
    const iv = Buffer.from(parts[0], "hex");
    const encryptedText = Buffer.from(parts[1], "hex");

    const decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      Buffer.from(EncryptKey, "hex"),
      iv
    );
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString();
  } catch (error) {
    console.error("Decryption error:", error);
    throw error; // Rethrow the error or handle it appropriately
  }
}

export async function checkFriendRequest(senderId: string, receiverId: string) {
  const sender = (await Friends.findOne({ accountId: senderId }).lean()) || {
    accountId: "",
    created: "",
    Accepted: [],
    Blocked: [],
    Incoming: [],
    Outgoing: [],
  };

  const receiver = (await Friends.findOne({
    accountId: receiverId,
  }).lean()) || {
    accountId: "",
    created: "",
    Accepted: [],
    Blocked: [],
    Incoming: [],
    Outgoing: [],
  };

  if (!sender.accountId || !receiver.accountId) return false;

  if (
    sender.Accepted.find((x: any) => x.accountId == receiver.accountId) ||
    receiver.Accepted.find((x: any) => x.accountId == sender.accountId) ||
    sender.Blocked.find((x: any) => x.accountId == receiver.accountId) ||
    receiver.Blocked.find((x: any) => x.accountId == sender.accountId) ||
    sender.accountId == receiver.accountId
  ) {
    return false;
  }

  // yeah
  return true;
}

export function check24gAgo(dateInput: any) {
  const date = new Date(dateInput);
  const now = new Date();
  const ago = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  return date < ago;
}

export async function sendFriendRequest(senderId: string, receiverId: string) {
  if (!(await checkFriendRequest(senderId, receiverId))) return false;

  const [sender, receiver] = await Promise.all([
    Friends.findOne({ accountId: senderId }).lean(),
    Friends.findOne({ accountId: receiverId }).lean(),
  ]);

  const senderList: any = {
    Accpted: sender?.Accepted,
    Outgoing: sender?.Outgoing,
    Incoming: sender?.Incoming,
    Blocked: sender?.Blocked,
  };

  const receiverList: any = {
    Accpted: receiver?.Accepted,
    Outgoing: receiver?.Outgoing,
    Incoming: receiver?.Incoming,
    Blocked: receiver?.Blocked,
  };

  senderList.Outgoing.push({ accountId: receiverId });
  receiverList.Incoming.push({ accountId: senderId });

  const req1 = {
    msg: {
      payload: {
        accountId: senderId,
        status: "PENDING",
        direction: "INBOUND",
        created: new Date().toISOString(),
        favorite: false,
      },
      type: "com.epicgames.friends.core.apiobjects.Friend",
      timestamp: new Date().toISOString(),
    },
    receiverId,
  };

  const req2 = {
    msg: {
      payload: {
        accountId: receiverId,
        status: "PENDING",
        direction: "OUTBOUND",
        created: new Date().toISOString(),
        favorite: false,
      },
      type: "com.epicgames.friends.core.apiobjects.Friend",
      timestamp: new Date().toISOString(),
    },
    receiverId: senderId,
  };

  await Promise.all([
    axios.post(
      "https://vantage.lunarfn.org/friends/api/messaging/sendToId",
      req1
    ),
    axios.post(
      "https://vantage.lunarfn.org/friends/api/messaging/sendToId",
      req2
    ),
    Friends.updateOne(
      { accountId: senderId },
      {
        $set: {
          Accepted: senderList.Accepted,
          Incoming: senderList.Incoming,
          Outgoing: senderList.Outgoing,
          Blocked: senderList.Blocked,
        },
      }
    ),
    Friends.updateOne(
      { accountId: receiverId },
      {
        $set: {
          Accepted: receiverList.Accepted,
          Incoming: receiverList.Incoming,
          Outgoing: receiverList.Outgoing,
          Blocked: receiverList.Blocked,
        },
      }
    ),
  ]);

  return true;
}

export async function acceptFriendRequest(
  senderId: string,
  receiverId: string
) {
  if (!(await checkFriendRequest(senderId, receiverId))) return false;

  const [sender, receiver] = await Promise.all([
    Friends.findOne({ accountId: senderId }).lean(),
    Friends.findOne({ accountId: receiverId }).lean(),
  ]);

  const incomingIndex: any = sender?.Incoming.findIndex(
    (x: any) => x.accountId == receiverId
  );

  const senderList: any = {
    Accepted: sender?.Accepted,
    Outgoing: sender?.Outgoing,
    Incoming: sender?.Incoming,
    Blocked: sender?.Blocked,
  };

  const receiverList: any = {
    Accepted: receiver?.Accepted,
    Outgoing: receiver?.Outgoing,
    Incoming: receiver?.Incoming,
    Blocked: receiver?.Blocked,
  };

  receiverList?.Outgoing.splice(
    receiver?.Outgoing.findIndex((x: any) => x.accountId == senderId),
    1
  );
  receiverList.Accepted.push({ accountId: senderId });

  if (incomingIndex != -1) {
    sender?.Incoming.splice(incomingIndex, 1);
    sender?.Accepted.push({ accountId: receiverId });

    const req1 = {
      msg: {
        payload: {
          accountId: senderId,
          status: "ACCEPTED",
          direction: "OUTBOUND",
          created: new Date().toISOString(),
          favorite: false,
        },
        type: "com.epicgames.friends.core.apiobjects.Friend",
        timestamp: new Date().toISOString(),
      },
      receiverId,
    };

    const req2 = {
      msg: {
        payload: {
          accountId: receiverId,
          status: "ACCEPTED",
          direction: "OUTBOUND",
          created: new Date().toISOString(),
          favorite: false,
        },
        type: "com.epicgames.friends.core.apiobjects.Friend",
        timestamp: new Date().toISOString(),
      },
      receiverId: senderId,
    };

    await Promise.all([
      axios.post(
        "https://vantage.lunarfn.org/friends/api/messaging/sendToId",
        req1
      ),
      axios.post(
        "https://vantage.lunarfn.org/friends/api/messaging/sendToId",
        req2
      ),
      Friends.updateOne(
        { accountId: senderId },
        {
          $set: {
            Accepted: senderList.Accepted,
            Incoming: senderList.Incoming,
            Outgoing: senderList.Outgoing,
            Blocked: senderList.Blocked,
          },
        }
      ),
      Friends.updateOne(
        { accountId: receiverId },
        {
          $set: {
            Accepted: receiverList.Accepted,
            Incoming: receiverList.Incoming,
            Outgoing: receiverList.Outgoing,
            Blocked: receiverList.Blocked,
          },
        }
      ),
    ]);

    return true;
  }
}
