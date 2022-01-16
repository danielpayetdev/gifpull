import * as functions from "firebase-functions";
import https = require("https");
import { TenorResult } from "./bean/tenor-result";
import { SlackActionTrigger, SlackParams, User } from "./bean/slack-params";
import { SlackResponse } from "./bean/slack-response";

const TENOR_KEY = functions.config().tenor.key;
const GIF_PER_PAGE = 3;

export const gifPullSlackCmd = functions.https.onRequest(async (request, response) => {
  if (request.method === "POST") {
    const slackParams: SlackParams = request.body;
    try {
      response.contentType("application/json");
      response.status(200).json(await getSlackBlocks(slackParams.text, 1));
    } catch (e) {
      console.error(e);
      response.status(500).send();
    }
  } else {
    response.status(405).send("Method not allowed");
  }
});

export const gifPullSlackAction = functions.https.onRequest(async (request, response) => {
  if (request.method === "POST") {
    const action: SlackActionTrigger = JSON.parse(request.body.payload);
    try {
      const actionId = action.actions[0].action_id;
      if (actionId.startsWith("send")) {
        const data: SlackResponse = getGifBlocks(action?.actions?.[0]?.value as string, action?.user);
        await sendSlackMessage(data, action.response_url);
      } else if (actionId === "nextPage") {
        const value = JSON.parse(action?.actions?.[0]?.value as string);
        const data: SlackResponse = await getSlackBlocks(
          value.searchText,
          +value.nextPage
        );
        await sendSlackMessage(data, action.response_url);
      } else if (actionId === "cancel") {
        const data = SlackResponse.create();
        data.delete_original = true;
        await sendSlackMessage(data, action.response_url);
      }
      response.status(200).send();
    } catch (e) {
      console.error(e);
      response.status(500).send(e);
    }
  } else {
    response.status(405).send("Method not allowed");
  }
});

const getTenorResult = (text: string, pos: number): Promise<TenorResult> => {
  return new Promise((resolve, reject) => {
    https.get(
      `https://api.tenor.com/v1/search?q=${text}&key=${TENOR_KEY}&limit=${GIF_PER_PAGE}&media_filter=minimal&contentfilter=low&pos=${pos}`,
      (res) => {
        let data = "";
        res.on("data", (d) => {
          data += d;
        });
        res.on("end", () => resolve(JSON.parse(data))
        );
        res.on("error", (e) => {
          console.error(e);
          reject(e);
        });
      });
  });
};

const sendSlackMessage = (data: SlackResponse, url: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const options: https.RequestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    };
    const req = https.request(url, options);
    req.on("error", (e) => {
      reject(e);
    });
    req.write(JSON.stringify(data));
    req.end(() => resolve());
  });
};

const getSlackBlocks = async (text: string, pos: number): Promise<SlackResponse> => {
  const tenorResult = await getTenorResult(text, pos);
  let messageFormat = SlackResponse.create().addHeader("Selectionez un gif à envoyer");
  tenorResult.results.forEach((result, index) => {
    messageFormat = messageFormat.addDivider().addGifSelector(result.media[0].tinygif.url, index);
  });
  messageFormat.addButtonNextPage(pos + GIF_PER_PAGE, text);
  messageFormat.replace_original = true;
  return messageFormat;
};

const getGifBlocks = (url: string, sender: User): SlackResponse => {
  const messageFormat = SlackResponse.create().addGif(url, `<@${sender.id}> a envoyé un gif`, );
  messageFormat.delete_original = true;
  messageFormat.setInChannel();
  return messageFormat;
};
