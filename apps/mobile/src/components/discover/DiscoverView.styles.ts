import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: { flex: 1 },
  searchHeader: { flexDirection: "row", paddingHorizontal: 16, paddingTop: 10, paddingBottom: 6, gap: 10 },
  searchBox: { flex: 1, flexDirection: "row", alignItems: "center", borderRadius: 12, paddingHorizontal: 12, height: 44, borderWidth: 1 },
  searchInput: { flex: 1, fontSize: 14, marginLeft: 8, minHeight: 44 },
  viewToggleBtn: { width: 44, height: 44, borderRadius: 12, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  filterTriggerBtn: { width: 44, height: 44, borderRadius: 12, borderWidth: 1, alignItems: "center", justifyContent: "center", position: "relative" },
  filterBadgeDot: { position: "absolute", top: 8, right: 8, width: 8, height: 8, borderRadius: 4 },
  mapViewport: { flex: 1, position: "relative" },
});
