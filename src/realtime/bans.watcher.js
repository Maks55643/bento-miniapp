import { api } from "../core/api.js";
import { tg } from "../core/telegram.js";

export function startBanWatcher(tg_id){
  setInterval(async () => {
    try {
      await api(`/auth/status/${tg_id}`);
    } catch (e) {
      if (e.status === 403) {
        alert("🚫 Вы заблокированы");
        tg.close();
      }
    }
  }, 1000);
}
