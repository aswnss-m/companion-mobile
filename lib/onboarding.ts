import * as SecureStore from "expo-secure-store";

// Sign-up sets this; Home takes it once and opens the "About you" screen as the onboarding step.
let pending = false;
export const startOnboarding = (on = true) => { pending = on; };
export const takeOnboarding = () => { const p = pending; pending = false; return p; };

// The one-time "Companion should know you too" dialog for accounts made before user traits existed.
const INTRO = "companion_traits_intro";
export const introSeen = () => { try { return SecureStore.getItem(INTRO) !== null; } catch { return true; } };
export const markIntroSeen = () => { try { SecureStore.setItem(INTRO, "1"); } catch { /* best effort: it shows once more */ } };
