import { api } from "../core/api.js";
import { tg } from "../core/telegram.js";

export async function authTelegram(){
  return api("/auth/telegram", {
    method: "POST",
    body: JSON.stringify({ initData: tg.initData })
  });
}
