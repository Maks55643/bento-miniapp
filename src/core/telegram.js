export let tg = null;

export function initTelegram(){
  if (!window.Telegram?.WebApp) {
    throw new Error("Telegram WebApp not found");
  }

  tg = window.Telegram.WebApp;

  tg.ready();
  tg.expand();
  tg.disableVerticalSwipes();
  tg.setHeaderColor("#0e0f14");
  tg.setBackgroundColor("#0e0f14");
}
