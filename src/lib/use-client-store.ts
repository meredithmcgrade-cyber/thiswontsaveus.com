"use client";

import { useSyncExternalStore } from "react";

const EVENT = "twsu:store";

/** Broadcast that a client-side value (localStorage, data attribute) changed. */
export function notifyClientStore() {
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

/**
 * Reads a browser-only value without a setState-in-effect. On the server and
 * during hydration it returns `serverValue`, then the real value on the client.
 */
export function useClientValue<T>(read: () => T, serverValue: T): T {
  return useSyncExternalStore(subscribe, read, () => serverValue);
}
