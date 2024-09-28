import crypto from "crypto";

import * as global from "../global";

export function CreateExchange(accountId: string) {
  const exchange = crypto.randomBytes(16).toString("hex");
  global.ExchangeCodes.push({
    [exchange]: {
      exchange,
      accountId,
      created: new Date().toISOString(),
    },
  });

  return exchange;
}

export function useExchange(exchange: any) {
  const index = global.ExchangeCodes.findIndex(
    (exchange_code: any) => exchange_code[exchange]
  );
  if (index !== -1) {
    const code = global.ExchangeCodes[index][exchange];
    global.ExchangeCodes.splice(index, 1);
    return code;
  } else {
    return null;
  }
}
