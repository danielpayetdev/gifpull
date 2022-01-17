import * as functions from "firebase-functions";
import { createHmac } from "crypto";

const SIGNATURE_HEADER = "X-Slack-Signature";
const TIMESTAMP_HEADER = "X-Slack-Request-Timestamp";
const VERSION = "v0";

export const checkSignature = (request: functions.https.Request): void => {
  const timestamp = request.get(TIMESTAMP_HEADER);
  const signature = request.get(SIGNATURE_HEADER);
  if (timestamp === undefined || signature === undefined) {
    throw new functions.https.HttpsError("invalid-argument", "Missing timestamp or signature");
  }
  const body = request.rawBody;
  const digest = buildDigest(timestamp, body);
  if (digest !== signature) {
    throw new functions.https.HttpsError("permission-denied", "Digest mismatch");
  }
};

const buildDigest = (timestamp: string, body: Buffer): string => {
  const hmac = createHmac("sha256", functions.config().slack.signing_secret);
  hmac.update(`${VERSION}:${timestamp}:${body}`);
  return VERSION + "=" + hmac.digest("hex");
};
