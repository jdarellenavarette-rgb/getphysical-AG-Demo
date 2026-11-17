import type { ComponentType, Ref } from "react";
import { WebView as RNWebView, type WebViewProps } from "react-native-webview";

/**
 * react-native-webview's class typings don't line up with React Native 0.88's
 * JSX types (props resolve to `never`). This single, typed re-export restores
 * normal JSX + refs without resorting to `any` at each call site.
 */
export type WebViewHandle = Pick<RNWebView, "postMessage" | "injectJavaScript" | "reload">;

export const WebView = RNWebView as unknown as ComponentType<WebViewProps & { ref?: Ref<WebViewHandle> }>;
export type { WebViewMessageEvent } from "react-native-webview";
