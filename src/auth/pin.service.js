import { state } from "../core/state.js";
import { hashPin } from "../utils/hash.js";
import { welcome } from "../ui/welcome.js";

export async function checkPin(input){
  const ok = await hashPin(input) === state.pinHash;

  if (ok) {
    state.attempts = 0;
    welcome();
    return true;
  }

  state.attempts++;
  return false;
}
