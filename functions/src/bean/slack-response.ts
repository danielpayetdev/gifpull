/* eslint-disable camelcase */
export class SlackResponse {
  public blocks?: TypeBlock[];
  public response_type?: TypeResponse;
  public text?: string;
  public replace_original?: boolean;
  public delete_original?: boolean;

  constructor({
    blocks,
    response_type,
    text,
  }: {
    blocks?: TypeBlock[];
    response_type?: TypeResponse;
    text?: string;
  }) {
    this.blocks = blocks;
    this.response_type = response_type;
    this.text = text;
  }

  public static create(): SlackResponse {
    return new SlackResponse({
      blocks: undefined,
      response_type: undefined,
      text: undefined,
    });
  }

  public toJson(): string {
    const res = JSON.stringify(this);
    console.log(res);
    return res;
  }

  public setEphemeral(): SlackResponse {
    this.response_type = TypeResponse.EPHEMERAL;
    return this;
  }

  public setInChannel(): SlackResponse {
    this.response_type = TypeResponse.IN_CHANNEL;
    return this;
  }

  public setText(text: string): SlackResponse {
    this.text = text;
    return this;
  }

  private addBlock<T extends TypeBlock>(block: T) {
    if (this.blocks === undefined) {
      this.blocks = [];
    }
    this.blocks.push(block);
  }

  public addHeader(text: string): SlackResponse {
    this.addBlock(
      new SectionBlock(
        new MarkdownBlock(text)
      )
    );
    return this;
  }

  public addDivider(): SlackResponse {
    this.addBlock(new DividerBlock());
    return this;
  }

  public addGifSelector(imageUrl: string, index: number, text: string): SlackResponse {
    this.addBlock(new ImageBlock(imageUrl));
    this.addBlock(new ActionBlock(new ButtonBlock(`send-${index}`, JSON.stringify({ imageUrl, text }), "Envoyer", ButtonStyle.PRIMARY)));
    return this;
  }

  public addGif(imageUrl: string, title?: string, imageTitle?: string): SlackResponse {
    if (title != undefined) {
      this.addBlock(new SectionBlock(new MarkdownBlock(title)));
    }
    this.addBlock(new ImageBlock(imageUrl, imageTitle ? new TextBlock(imageTitle) : undefined));
    return this;
  }

  public addButtonNextPage(nextPage: number, searchText: string): SlackResponse {
    this.addDivider();
    this.addBlock(new ActionBlock(
      new ButtonBlock("nextPage", JSON.stringify({ nextPage, searchText }), "Suivant", ButtonStyle.PRIMARY),
      new ButtonBlock("cancel", "cancel", "Annuler", ButtonStyle.DANGER),
    ));
    return this;
  }
}

export interface TypeBlock {
  type: string;
}

export class DividerBlock implements TypeBlock {
  type = "divider";
}

export class SectionBlock implements TypeBlock {
  public type = "section";

  constructor(public text: TextBlock, public accessory?: AccesoryBlock) { }
}

export class SectionFieldBlock implements TypeBlock {
  public type = "section";

  constructor(public fields: TypeBlock[]) { }
}

export class AccesoryBlock implements TypeBlock {
  type = "accessory";
}

export class TextBlock implements TypeBlock {
  type = "plain_text";

  constructor(public text: string, public emoji?: boolean) { }
}

export class MarkdownBlock implements TypeBlock {
  type = "mrkdwn";

  constructor(public text: string) { }
}

export class ImageBlock implements TypeBlock {
  type = "image";
  alt_text = "amazing gif";

  // eslint-disable-next-line camelcase
  constructor(public image_url: string, public title?: TextBlock) { }
}

export class ActionBlock implements TypeBlock {
  type = "actions";
  elements: TypeBlock[];

  constructor(...elements: TypeBlock[]) {
    this.elements = elements;
  }
}

export class ButtonBlock implements TypeBlock {
  type = "button";
  public text: TextBlock;

  // eslint-disable-next-line camelcase
  constructor(public action_id: string, public value: unknown, text: string, public style?: ButtonStyle) {
    this.text = new TextBlock(text);
  }
}

enum TypeResponse {
  EPHEMERAL = "ephemeral",
  IN_CHANNEL = "in_channel",
}

enum ButtonStyle {
  PRIMARY = "primary",
  DANGER = "danger",
}
