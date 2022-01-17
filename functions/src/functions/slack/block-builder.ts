import { getGifFromTenor, GIF_PER_PAGE } from "../tenor/tenor";
import { User } from "./slack-data";
import { SlackResponse } from "./slack-response";

export const getSlackBlocks = async (text: string, pos: number): Promise<SlackResponse> => {
  const tenorResult = await getGifFromTenor(text, pos);
  let messageFormat = SlackResponse.create().addHeader("Selectionez un gif à envoyer");
  tenorResult.results.forEach((result, index) => {
    messageFormat = messageFormat.addDivider().addGifSelector(result.media[0].tinygif.url, index, text);
  });
  messageFormat.addButtonNextPage(pos + GIF_PER_PAGE, text);
  messageFormat.replace_original = true;
  return messageFormat;
};

export const getGifBlocks = (data: {imageUrl: string, text: string}, sender: User): SlackResponse => {
  const messageFormat = SlackResponse.create().addGif(data.imageUrl, `<@${sender.id}> a envoyé un gif`, data.text);
  messageFormat.delete_original = true;
  messageFormat.setInChannel();
  return messageFormat;
};
