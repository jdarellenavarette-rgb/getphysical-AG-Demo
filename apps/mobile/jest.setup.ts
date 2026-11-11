// Native views that ship inside Expo Go but are not simulated by jest-expo.
jest.mock("react-native-webview", () => {
  const { View } = jest.requireActual<typeof import("react-native")>("react-native");
  return { __esModule: true, WebView: View, default: View };
});
jest.mock("react-native-maps", () => {
  const { View } = jest.requireActual<typeof import("react-native")>("react-native");
  return { __esModule: true, default: View, Marker: View, Polyline: View, PROVIDER_GOOGLE: "google" };
});
