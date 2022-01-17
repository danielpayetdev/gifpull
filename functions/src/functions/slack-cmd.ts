import { getSlackBlocks } from "./slack/block-builder";
import { SlackCmd } from "./slack/slack-data";
import { SlackResponse } from "./slack/slack-response";

export const slackCmd = (slackParams: SlackCmd): Promise<SlackResponse> => {
  return getSlackBlocks(slackParams.text, 1);
};
