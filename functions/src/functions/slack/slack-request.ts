import https = require("https");
import { SlackResponse } from "./slack-response";

export const sendSlackMessage = (data: SlackResponse, url: string): Promise<void> => {
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
