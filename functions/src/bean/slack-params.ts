import { TextBlock } from "./slack-response";

/* eslint-disable camelcase */
export interface SlackParams {
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

export interface SlackActionTrigger {
  type: string;
  user: User,
  api_app_id: string;
  token: string;
  container: {
    type: string;
    message_ts: string;
    channel_id: string;
    is_ephemeral: boolean;
  };
  trigger_id: string;
  team: {
    id: string;
    domain: string;
  };
  enterprise: null;
  is_enterprise_install: boolean;
  channel: {
    id: string;
    name: string;
  };
  state: {
    values: unknown;
  };
  response_url: string;
  actions: {
    action_id: string;
    block_id: string;
    text: TextBlock;
    value: unknown;
    type: string;
    action_ts: string;
  }[];
}

export interface User {
  id: string;
  username: string;
  name: string;
  team_id: string;
}
