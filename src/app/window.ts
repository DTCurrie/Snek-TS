import { App } from 'app';

declare global {
  interface Window { App: App }
}

export function nativeWindow(): Window {
  return window;
}
