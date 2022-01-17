import * as functions from "firebase-functions";
import { checkSignature } from "./auth/auth";
import { slackAction } from "./functions/slack-action";
import { slackCmd } from "./functions/slack-cmd";

export const gifPullSlackCmd = functions.https.onRequest(async (request, response) => {
  return slackRequest(request, response, async () => {
    response.contentType("application/json");
    response.status(200).json(await slackCmd(request.body));
  });
});

export const gifPullSlackAction = functions.https.onRequest(async (request, response) => {
  return slackRequest(request, response, async () => {
    await slackAction(request.body);
    response.status(200).send();
  });
});

const slackRequest =
  async (request: functions.https.Request, response: functions.Response, fn: () => Promise<void>): Promise<void> => {
    try {
      checkSignature(request);
    } catch (e) {
      console.error(e);
      response.status(403).send();
      return;
    }
    if (request.method === "POST") {
      try {
        await fn();
      } catch (e) {
        console.error(e);
        response.status(500).send();
      }
    } else {
      response.status(405).send("Method not allowed");
    }
  };
