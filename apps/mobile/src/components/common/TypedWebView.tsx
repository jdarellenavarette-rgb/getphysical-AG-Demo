import type React from "react";
import { WebView as RNWebView, type WebViewMessageEvent, type WebViewProps } from "react-native-webview";

/** Imperative surface we use on the native WebView. */
export interface WebViewHandle {
  postMessage: (message: string) => void;
  injectJavaScript: (script: string) => void;
  reload: () => void;
}

/**
 * react-native-webview ships its component as a class whose declared props
 * resolve to `never` under @types/react 19.3. This re-types the same runtime
 * component as a function component with its documented props + ref handle.
 */
export const WebView = RNWebView as unknown as React.ComponentType<WebViewProps & React.RefAttributes<WebViewHandle>>;

export type { WebViewMessageEvent, WebViewProps };

/** Parses a `{ type: string, ... }` message posted from inside a WebView. */
export function parseWebViewMessage(event: WebViewMessageEvent): Record<string, unknown> | null {
  try {
    const data: unknown = JSON.parse(event.nativeEvent.data);
    return typeof data === "object" && data !== null && !Array.isArray(data) ? (data as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}
