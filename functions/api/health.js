import { jsonResponse, optionsResponse } from "./_lib/store.js";

export const onRequestOptions = async () => optionsResponse();

export const onRequestGet = async () => {
  return jsonResponse({ status: "ok" });
};
