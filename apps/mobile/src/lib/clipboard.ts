import { Platform, Share } from "react-native";

/** True where the text can be put straight on the clipboard (the web build). */
export const canCopyDirectly = Platform.OS === "web";

/**
 * Hands a short piece of text to the person to paste elsewhere.
 *
 * On the web it goes straight to the clipboard. On a phone the system share
 * sheet opens, which offers Copy alongside Messages and the rest; the app has
 * no clipboard module installed, and this needs no new dependency.
 *
 * Resolves "copied", "shared", or "failed" when neither was possible.
 */
export async function copyText(text: string): Promise<"copied" | "shared" | "failed"> {
  try {
    if (canCopyDirectly) {
      if (typeof navigator === "undefined" || !navigator.clipboard) return "failed";
      await navigator.clipboard.writeText(text);
      return "copied";
    }
    const result = await Share.share({ message: text });
    return result.action === Share.dismissedAction ? "failed" : "shared";
  } catch {
    return "failed";
  }
}
