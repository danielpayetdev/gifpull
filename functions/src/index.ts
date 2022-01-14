import * as functions from "firebase-functions";
import https = require("https");

const TENOR_KEY = "";

export const gifPullSlackCmd = functions.https.onRequest((request, response) => {
  if (request.method === "POST") {
    const slackParams: SlackParams = request.body;
    try {
      https.get(`https://api.tenor.com/v1/search?q=${slackParams.text}&key=${TENOR_KEY}&limit=1&media_filter=minimal&contentfilter=low`, (res) => {
        let data: string = "";
        res.on("data", (d) => {
          data += d;
        });
        res.on("end", () => {
          response.status(200).send(JSON.parse(data).results[0].media[0].gif.url);
        });
        res.on("error", (e) => {
          console.error(e);
          response.status(500).send();
        });
      });
    } catch (e) {
      console.error(e);
    }
  } else {
    response.status(405).send("Method not allowed");
  }
});

interface SlackParams {
  token: string;
  team_id: string;
  team_domain: string;
  channel_id: string;
  channel_name: string;
  user_id: string;
  user_name: string;
  command: string;
  text: string;
  api_app_id: string;
  is_entreprise_install: string;
  response_url: string;
  trigger_id: string;
}

// {
// 	"blocks": [
// 		{
// 			"type": "section",
// 			"text": {
// 				"type": "mrkdwn",
// 				"text": "Selectionnez un gif"
// 			}
// 		},
// 		{
// 			"type": "divider"
// 		},
// 		{
// 			"type": "image",
// 			"image_url": "https://media.tenor.com/images/4f542641c3ac3fe6fcbba0cd12677810/tenor.gif",
// 			"alt_text": "Haunted hotel image"
// 		},
// 		{
// 			"type": "actions",
// 			"elements": [
// 				{
// 					"type": "button",
// 					"text": {
// 						"type": "plain_text",
// 						"text": "Click Me",
// 						"emoji": true
// 					},
// 					"value": "click_me_123",
// 					"action_id": "actionId-0"
// 				}
// 			]
// 		}
// 	]
// }
