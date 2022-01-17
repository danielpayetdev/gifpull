import * as functions from "firebase-functions";
import https = require("https");
import { TenorResult } from "./tenor-result";

const TENOR_KEY = functions.config().tenor.key;
export const GIF_PER_PAGE = 3;

export const getGifFromTenor = (text: string, pos: number): Promise<TenorResult> => {
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
