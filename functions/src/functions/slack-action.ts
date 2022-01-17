import { getGifBlocks, getSlackBlocks } from "./slack/block-builder";
import { SlackActionTrigger } from "./slack/slack-data";
import { sendSlackMessage } from "./slack/slack-request";
import { SlackResponse } from "./slack/slack-response";

export const slackAction = async (body: { payload: string }): Promise<void> => {
  const action: SlackActionTrigger = JSON.parse(body.payload);
  const actionId = action.actions[0].action_id;
  if (actionId.startsWith("send")) {
    const value = JSON.parse(action?.actions?.[0]?.value as string);
    const data: SlackResponse = getGifBlocks(value, action?.user);
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
};
