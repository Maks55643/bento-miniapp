import { initTelegram } from "./core/telegram.js";
import { initSupabase } from "./core/supabase.js";
import { authTelegram } from "./auth/auth.service.js";
import { showLoader, hideLoader } from "./ui/loader.js";
import { deny } from "./ui/deny.js";
import { state } from "./core/state.js";
import { startBanWatcher } from "./realtime/bans.watcher.js";
import { welcome } from "./ui/welcome.js";
import { drawPin } from "./auth/pin.service.js";

(async function bootstrap(){
  try {
    showLoader();

    initTelegram();
    await initSupabase();

    const user = await authTelegram();
    state.user = user;

    hideLoader();
    startBanWatcher(user.id);

    if (user.role === "owner") {
      welcome();
    } else {
      drawPin();
    }

  } catch (e) {
    console.error("BOOT ERROR", e);
    deny("error");
  }
})();
