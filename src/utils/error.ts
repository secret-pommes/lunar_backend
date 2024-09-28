const allowedServices = [
  "account",
  "affiliates",
  "api",
  "auth",
  "catalog",
  "client",
  "content-controls",
  "content",
  "datarouter",
  "dedicated",
  "discord",
  "eulatracking",
  "fortnite",
  "friends",
  "launcher-resources",
  "launcher",
  "lightswitch",
  "links",
  "party",
  "priceengine",
  "socialban",
  "statsproxy",
  "status",
  "voice",
  "waitingroom",
];

// todo change req: any to req: FastifyRequest

export function not_found(req: any) {
  let serv = req.originalUrl.split("/")[1].split("/")[0];

  let found = false;
  allowedServices.forEach((service) => {
    if (serv == service) {
      found = true;
    }
  });

  if (!serv || !found) serv = "common";

  return {
    header: {
      "X-Epic-Error-Name": `errors.org.lunar.${serv}.not_found`,
      "X-Epic-Error-Code": 1004,
    },
    error: {
      errorCode: `errors.org.lunar.${serv}.not_found`,
      errorMessage:
        "Sorry the resource you were trying to find could not be found",
      messageVars: [req.originalUrl.replace(`/${serv}`, "")],
      numericErrorCode: 1004,
      originatingService: "fortnite",
      intent: "prod-live",
    },
  };
}

export function method(req: any) {
  let serv = req.originalUrl.split("/")[1].split("/")[0];

  let found = false;
  allowedServices.forEach((service) => {
    if (serv == service) {
      found = true;
    }
  });

  if (!serv || !found) serv = "common";

  return {
    header: {
      "X-Epic-Error-Name": `errors.org.lunar.${serv}.method_not_allowed`,
      "X-Epic-Error-Code": 1009,
    },
    error: {
      errorCode: `errors.org.lunar.${serv}.method_not_allowed`,
      errorMessage:
        "Sorry the resource you were trying to access cannot be accessed with the HTTP method you used.",
      messageVars: [req.originalUrl.replace(`/${serv}`, "")],
      numericErrorCode: 1009,
      originatingService: "fortnite",
      intent: "prod-live",
    },
  };
}

export function permission(req: any) {
  let serv = req.originalUrl.split("/")[1].split("/")[0];

  let found = false;
  allowedServices.forEach((service) => {
    if (serv == service) {
      found = true;
    }
  });

  if (!serv || !found) serv = "common";

  return {
    header: {
      "X-Epic-Error-Name": `errors.org.lunar.${serv}.missing_permission`,
      "X-Epic-Error-Code": 1023,
    },
    error: {
      errorCode: `errors.org.lunar.${serv}.missing_permission`,
      errorMessage: `Sorry your login does not posses the permissions '${req.originalUrl.replace(
        `/${serv}`,
        ""
      )}' needed to perform the requested operation`,
      messageVars: [req.originalUrl.replace(`/${serv}`, "")],
      numericErrorCode: 1023,
      originatingService: "fortnite",
      intent: "prod-live",
    },
  };
}

export function invalid_credentials(req: any) {
  let serv = req.originalUrl.split("/")[1].split("/")[0];

  let found = false;
  allowedServices.forEach((service) => {
    if (serv == service) {
      found = true;
    }
  });

  if (!serv || !found) serv = "common";

  return {
    header: {
      "X-Epic-Error-Name": `errors.org.lunar.${serv}.invalid_account_credentials`,
      "X-Epic-Error-Code": 18031,
    },
    error: {
      errorCode: `errors.org.lunar.${serv}.invalid_account_credentials`,
      errorMessage: `Your e-mail and/or passcode are incorrect. Please check them and try again.`,
      messageVars: [req.originalUrl.replace(`/${serv}`, "")],
      numericErrorCode: 18031,
      originatingService: "fortnite",
      intent: "prod-live",
    },
  };
}

export function refresh_missing(req: any) {
  let serv = req.originalUrl.split("/")[1].split("/")[0];

  let found = false;
  allowedServices.forEach((service) => {
    if (serv == service) {
      found = true;
    }
  });

  if (!serv || !found) serv = "common";

  return {
    header: {
      "X-Epic-Error-Name": "errors.org.lunar.oauth.invalid_request",
      "X-Epic-Error-Code": 18031,
    },
    error: {
      errorCode: "errors.org.lunar.oauth.invalid_request",
      errorMessage: "Refresh token is required.",
      messageVars: [req.originalUrl.replace(`/${serv}`, "")],
      numericErrorCode: 18031,
      originatingService: "fortnite",
      intent: "prod-live",
    },
  };
}

export function accountId_missing(req: any) {
  let serv = req.originalUrl.split("/")[1].split("/")[0];

  let found = false;
  allowedServices.forEach((service) => {
    if (serv == service) {
      found = true;
    }
  });

  if (!serv || !found) serv = "common";

  return {
    header: {
      "X-Epic-Error-Name": "errors.org.lunar.oauth.invalid_request",
      "X-Epic-Error-Code": 18031,
    },
    error: {
      errorCode: "errors.org.lunar.oauth.invalid_request",
      errorMessage: "Account Id is required.",
      messageVars: [req.originalUrl.replace(`/${serv}`, "")],
      numericErrorCode: 18031,
      originatingService: "fortnite",
      intent: "prod-live",
    },
  };
}

export function oauth_unsupported_grand_type(req: any) {
  let serv = req.originalUrl.split("/")[1].split("/")[0];

  let found = false;
  allowedServices.forEach((service) => {
    if (serv == service) {
      found = true;
    }
  });

  if (!serv || !found) serv = "common";

  return {
    header: {
      "X-Epic-Error-Name": "errors.org.lunar.oauth.invalid_grant",
      "X-Epic-Error-Code": 1016,
    },
    error: {
      errorCode: "errors.org.lunar.oauth.invalid_grant",
      errorMessage: `Wrong auth type: ${req.body.grant_type}`,
      messageVars: [req.originalUrl.replace(`/${serv}`, "")],
      numericErrorCode: 1016,
      originatingService: "fortnite",
      intent: "prod-live",
    },
  };
}

export function authorization_failed(req: any) {
  let serv = req.originalUrl.split("/")[1].split("/")[0];

  let found = false;
  allowedServices.forEach((service) => {
    if (serv == service) {
      found = true;
    }
  });

  if (!serv || !found) serv = "common";

  return {
    header: {
      "X-Epic-Error-Name": `errors.org.lunar.${serv}.authorization.authorization_failed`,
      "X-Epic-Error-Code": 1016,
    },
    error: {
      errorCode: `errors.org.lunar.${serv}.authorization.authorization_failed`,
      errorMessage: `Authorization failed for ${req.originalUrl.replace(
        `/${serv}`,
        ""
      )}`,
      messageVars: [req.originalUrl.replace(`/${serv}`, "")],
      numericErrorCode: 1016,
      originatingService: "fortnite",
      intent: "prod-live",
    },
  };
}

export function server_error(req: any) {
  let serv = req.originalUrl.split("/")[1].split("/")[0];

  let found = false;
  allowedServices.forEach((service) => {
    if (serv == service) {
      found = true;
    }
  });

  if (!serv || !found) serv = "common";

  return {
    header: {
      "X-Epic-Error-Name": `errors.org.lunar.${serv}.server_error`,
      "X-Epic-Error-Code": 1012,
    },
    error: {
      errorCode: `errors.org.lunar.${serv}.server_error`,
      errorMessage: "Internal Epic Error",
      messageVars: [req.originalUrl.replace(`/${serv}`, "")],
      numericErrorCode: 1012,
      originatingService: "fortnite",
      intent: "prod-live",
    },
  };
}

export function account_banned(req: any) {
  let serv = req.originalUrl.split("/")[1].split("/")[0];

  let found = false;
  allowedServices.forEach((service) => {
    if (serv == service) {
      found = true;
    }
  });

  if (!serv || !found) serv = "common";

  return {
    header: {
      "X-Epic-Error-Name": `errors.org.lunar.${serv}.user_banned`,
      "X-Epic-Error-Code": null,
    },
    error: {
      errorCode: `errors.org.lunar.${serv}.user_banned`,
      errorMessage: "You are currently banned from playing Fortnite.",
      messageVars: [req.originalUrl.replace(`/${serv}`, "")],
      numericErrorCode: null,
      originatingService: "fortnite",
      intent: "prod-live",
    },
  };
}

export function account_not_found(req: any) {
  let serv = req.originalUrl.split("/")[1].split("/")[0];

  let found = false;
  allowedServices.forEach((service) => {
    if (serv == service) {
      found = true;
    }
  });

  if (!serv || !found) serv = "common";

  return {
    header: {
      "X-Epic-Error-Name": `errors.org.lunar.${serv}.account_not_found`,
      "X-Epic-Error-Code": 18007,
    },
    error: {
      errorCode: `errors.org.lunar.${serv}.account_not_found`,
      errorMessage: `Sorry, we couldn't find the selected account.`,
      messageVars: [req.originalUrl.replace(`/${serv}`, "")],
      numericErrorCode: 18007,
      originatingService: "fortnite",
      intent: "prod-live",
    },
  };
}

export function playlist_unavaible(req: any) {
  let serv = req.originalUrl.split("/")[1].split("/")[0];

  let found = false;
  allowedServices.forEach((service) => {
    if (serv == service) {
      found = true;
    }
  });

  if (!serv || !found) serv = "common";

  return {
    header: {
      "X-Epic-Error-Name": `errors.org.lunar.${serv}.invalid_playlist`,
      "X-Epic-Error-Code": 16106,
    },
    error: {
      errorCode: `errors.org.lunar.${serv}.invalid_playlist`,
      errorMessage: "This gamemode is currently unavaible.",
      messageVars: [req.originalUrl.replace(`/${serv}`, "")],
      numericErrorCode: 16106,
      originatingService: "fortnite",
      intent: "prod-live",
    },
  };
}

export function operation_not_found(req: any) {
  let serv = req.originalUrl.split("/")[1].split("/")[0];

  let found = false;
  allowedServices.forEach((service) => {
    if (serv == service) {
      found = true;
    }
  });

  if (!serv || !found) serv = "common";

  return {
    header: {
      "X-Epic-Error-Name": `errors.org.lunar.${serv}.operation_not_found`,
      "X-Epic-Error-Code": 16035,
    },
    error: {
      errorCode: `errors.org.lunar.${serv}.operation_not_found`,
      errorMessage: `Operation ${req.params.operation} is not a valid mcp operation.`,
      messageVars: [req.originalUrl.replace(`/${serv}`, "")],
      numericErrorCode: 16035,
      originatingService: "fortnite",
      intent: "prod-live",
    },
  };
}

export function auth_invalid_request(req: any) {
  let serv = req.originalUrl.split("/")[1].split("/")[0];

  let found = false;
  allowedServices.forEach((service) => {
    if (serv == service) {
      found = true;
    }
  });

  if (!serv || !found) serv = "common";

  return {
    header: {
      "X-Epic-Error-Name": "errors.org.lunar.oauth.invalid_request",
      "X-Epic-Error-Code": 1013,
    },
    error: {
      errorCode: "errors.org.lunar.oauth.invalid_request",
      errorMessage: "Exchange code is required.",
      messageVars: [req.originalUrl.replace(`/${serv}`, "")],
      numericErrorCode: 1013,
      originatingService: "fortnite",
      intent: "prod-live",
    },
  };
}

export function auth_exchange_code_not_found(req: any) {
  let serv = req.originalUrl.split("/")[1].split("/")[0];

  let found = false;
  allowedServices.forEach((service) => {
    if (serv == service) {
      found = true;
    }
  });

  if (!serv || !found) serv = "common";

  return {
    header: {
      "X-Epic-Error-Name": "errors.org.lunar.oauth.exchange_code_not_found",
      "X-Epic-Error-Code": 18057,
    },
    error: {
      errorCode: "errors.org.lunar.oauth.exchange_code_not_found",
      errorMessage:
        "Sorry the exchange code you supplied was not found. It is possible that it was no longer valid.",
      messageVars: [req.originalUrl.replace(`/${serv}`, "")],
      numericErrorCode: 18057,
      originatingService: "fortnite",
      intent: "prod-live",
    },
  };
}

export function auth_header_invalid(req: any) {
  let serv = req.originalUrl.split("/")[1].split("/")[0];

  let found = false;
  allowedServices.forEach((service) => {
    if (serv == service) {
      found = true;
    }
  });

  if (!serv || !found) serv = "common";

  return {
    header: {
      "X-Epic-Error-Name": "errors.org.lunar.oauth.invalid_client",
      "X-Epic-Error-Code": 18057,
    },
    error: {
      errorCode: "errors.org.lunar.oauth.invalid_client",
      errorMessage:
        "It appears that your Authorization header may be invalid or not present, please verify that you are sending the correct headers.",
      messageVars: [req.originalUrl.replace(`/${serv}`, "")],
      numericErrorCode: 18057,
      originatingService: "fortnite",
      intent: "prod-live",
    },
  };
}

export function bad_request(req: any) {
  let serv = req.originalUrl.split("/")[1].split("/")[0];

  let found = false;
  allowedServices.forEach((service) => {
    if (serv == service) {
      found = true;
    }
  });

  if (!serv || !found) serv = "common";

  return {
    header: {
      "X-Epic-Error-Name": "errors.org.lunar.oauth.bad_request",
      "X-Epic-Error-Code": 1012,
    },
    error: {
      errorCode: "errors.org.lunar.oauth.bad_request",
      errorMessage:
        "The client is not configured correctly. Please make sure it is associated with an Application.",
      messageVars: [req.originalUrl.replace(`/${serv}`, "")],
      numericErrorCode: 1012,
      originatingService: "fortnite",
      intent: "prod-live",
    },
  };
}

export function reedem_code_not_found(req: any) {
  let serv = req.originalUrl.split("/")[1].split("/")[0];

  let found = false;
  allowedServices.forEach((service) => {
    if (serv == service) {
      found = true;
    }
  });

  if (!serv || !found) serv = "common";

  return {
    header: {
      "X-Epic-Error-Name": `errors.org.lunarfn.${serv}.code_not_found`,
      "X-Epic-Error-Code": 19007,
    },
    error: {
      errorCode: `errors.org.lunarfn.${serv}.code_not_found`,
      errorMessage: "code not found $CODE", // add code here
      messageVars: [], // add code here
      numericErrorCode: 19007,
      originatingService: "fortnite",
      intent: "prod-live",
    },
  };
}

export function affiliate_not_found(req: any) {
  let serv = req.originalUrl.split("/")[1].split("/")[0];

  let found = false;
  allowedServices.forEach((service) => {
    if (serv == service) {
      found = true;
    }
  });

  if (!serv || !found) serv = "common";

  return {
    header: {
      "X-Epic-Error-Name": `errors.org.lunarfn.${serv}.affiliate.not_found`,
      "X-Epic-Error-Code": 47010,
    },
    error: {
      errorCode: "errors.org.epicgames.lunarfn.affiliate.not_found",
      errorMessage: "Sorry, the affiliate cannot be found by slug [].",
      messageVars: [req.originalUrl.replace(`/${serv}`, "")],
      numericErrorCode: 47010,
      originatingService: "fortnite",
      intent: "prod-live",
    },
  };
}

export function missing_action(req: any) {
  let serv = req.originalUrl.split("/")[1].split("/")[0];

  let found = false;
  allowedServices.forEach((service) => {
    if (serv == service) {
      found = true;
    }
  });

  if (!serv || !found) serv = "common";

  return {
    header: {
      "X-Epic-Error-Name": `errors.org.lunarfn.${serv}.missing_action`,
      "X-Epic-Error-Code": 1023,
    },
    error: {
      errorCode: `errors.org.lunarfn.${serv}.missing_action`,
      errorMessage:
        "Login is banned or does not posses the action 'PLAY' needed to perform the requested operation for platform ''",
      messageVars: [req.originalUrl.replace(`/${serv}`, "")],
      numericErrorCode: 1023,
      originatingService: "fortnite",
      intent: "prod-live",
    },
  };
}

export function already_purchased(req: any) {
  let serv = req.originalUrl.split("/")[1].split("/")[0];

  let found = false;
  allowedServices.forEach((service) => {
    if (serv == service) {
      found = true;
    }
  });

  if (!serv || !found) serv = "common";

  return {
    header: {
      "X-Epic-Error-Name": `errors.org.lunarfn.${serv}.already_owned`,
      "X-Epic-Error-Code": 1040,
    },
    error: {
      errorCode: `errors.org.lunarfn.${serv}.already_owned`,
      errorMessage: "You have already bought this item before.",
      messageVars: [req.originalUrl.replace(`/${serv}`, "")],
      numericErrorCode: 1040,
      originatingService: "fortnite",
      intent: "prod-live",
    },
  };
}

export function rate_limited(req: any) {
  let serv = req.originalUrl.split("/")[1].split("/")[0];

  let found = false;
  allowedServices.forEach((service) => {
    if (serv == service) {
      found = true;
    }
  });

  if (!serv || !found) serv = "common";

  return {
    header: {
      "X-Epic-Error-Name": `errors.org.lunarfn.${serv}.throttled`,
      "X-Epic-Error-Code": 1040,
    },
    error: {
      errorCode: `errors.org.lunarfn.${serv}.throttled`,
      errorMessage: "You are being rate limited. Please try again later.",
      messageVars: [req.originalUrl.replace(`/${serv}`, "")],
      numericErrorCode: 1040,
      originatingService: "fortnite",
      intent: "prod-live",
    },
  };
}

export function not_enough_currency(
  req: any,
  expected: number,
  current: number
) {
  let serv = req.originalUrl.split("/")[1].split("/")[0];

  let found = false;
  allowedServices.forEach((service) => {
    if (serv == service) {
      found = true;
    }
  });

  if (!serv || !found) serv = "common";

  return {
    header: {
      "X-Epic-Error-Name": "errors.com.lunarfn.currency.mtx.insufficient",
      "X-Epic-Error-Code": 1023,
    },
    error: {
      errorCode: "errors.com.lunarfn.currency.mtx.insufficient",
      errorMessage: `You can not afford this item (${expected}), you only have ${current}.`,
      messageVars: [],
      numericErrorCode: 1023,
      originatingService: "fortnite",
      intent: "prod-live",
    },
  };
}

export function custom(
  req: any,
  code: any,
  num: any,
  errorMsg: any,
  service: any
) {
  let serv = req.originalUrl.split("/")[1].split("/")[0];

  let found = false;
  allowedServices.forEach((service) => {
    if (serv == service) {
      found = true;
    }
  });

  if (!serv || !found) serv = "common";

  if (!code) code = "unknown";
  if (!num) num = null;
  if (!errorMsg) errorMsg = "No information provided.";
  if (!service) service = "unknown";

  return {
    header: {
      "X-Epic-Error-Name": `errors.org.lunar.${serv}.${code}`,
      "X-Epic-Error-Code": num,
    },
    error: {
      errorCode: `errors.org.lunar.${serv}.${code}`,
      errorMessage: errorMsg,
      messageVars: [req.originalUrl.replace(`/${serv}`, "")],
      numericErrorCode: num,
      originatingService: service,
      intent: "prod-live",
    },
  };
}
