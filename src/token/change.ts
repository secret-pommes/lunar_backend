import * as global from "../global";
import * as log from "../utils/log";

export function BanToken(accountId: string) {
  const AccessIndex = global.AccessTokens.findIndex(
    (token: any) => token.accountId == accountId
  );

  const RefreshIndex = global.RefreshTokens.findIndex(
    (token: any) => token.accountId == accountId
  );

  if (AccessIndex != -1) {
    global.AccessTokens[AccessIndex].account.Banned = true;
    log.account(`Banned ${accountId}'s access token.`);
  }
  if (RefreshIndex != -1) {
    global.RefreshTokens[RefreshIndex].account.Banned = true;
    log.account(`Banned ${accountId}' refresh token.`);
  }
}
