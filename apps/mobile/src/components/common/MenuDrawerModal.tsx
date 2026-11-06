import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from "react-native";
import { AppModal } from "./AppModal";
import { X, Home, Compass, Dumbbell, CreditCard, RefreshCw, Database, Settings as SettingsIcon, ChevronRight } from "lucide-react-native";
import { useEcosystemStore } from "../../store/ecosystemStore";
import { useThemeStore } from "../../theme/theme";
import { DARELLE_AVATAR } from "../../constants/darelleAssets";

interface MenuDrawerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectFeed?: () => void;
  onSelectDiscover?: () => void;
  onSelectTrack?: () => void;
  onSelectCards?: () => void;
  onSelectProfile?: () => void;
  onOpenSettings: () => void;
}

export function MenuDrawerModal({
  visible,
  onClose,
  onSelectFeed,
  onSelectDiscover,
  onSelectTrack,
  onSelectCards,
  onSelectProfile,
  onOpenSettings,
}: MenuDrawerModalProps) {
  const { profile, loadDemoData, resetToEmpty } = useEcosystemStore();
  const { colors } = useThemeStore();

  return (
    <AppModal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.drawerContainer, { backgroundColor: colors.bgCard, borderRightColor: colors.borderColor }]}>
          {/* TOP DRAWER HEADER */}
          <View style={[styles.header, { borderBottomColor: colors.borderColor }]}>
            <Text style={[styles.headerTitle, { color: colors.textMuted }]}>NAVIGATION & MENU</Text>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Close menu" onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* 1. TOP ATHLETE PROFILE CARD (ROUTED TO PROFILE HUB) */}
            <TouchableOpacity
              onPress={() => {
                onClose();
                onSelectProfile?.();
              }}
              activeOpacity={0.8}
              style={[styles.userCard, { backgroundColor: colors.bgCardSecondary, borderColor: colors.borderColor }]}
            >
              <Image
                source={{ uri: profile.avatar_url ?? DARELLE_AVATAR }}
                style={styles.avatar}
              />
              <View style={styles.userInfo}>
                <Text style={[styles.userName, { color: colors.textPrimary }]}>{profile.name ?? "Darelle Navarette"}</Text>
                <Text style={[styles.userHandle, { color: colors.textMuted }]}>@{profile.username} • View Profile</Text>
                <View style={styles.activeRoleBadge}>
                  <Text style={styles.activeRoleText}>IFBB CPFT COACH</Text>
                </View>
              </View>
              <ChevronRight size={18} color={colors.textMuted} />
            </TouchableOpacity>

            {/* 2. CORE APP NAVIGATION */}
            <Text style={[styles.sectionHeader, { color: colors.textMuted }]}>APP HUBS</Text>

            <TouchableOpacity
              onPress={() => {
                onSelectFeed?.();
                onClose();
              }}
              style={[styles.navItem, { backgroundColor: colors.bgCardSecondary, borderColor: colors.borderColor }]}
            >
              <View style={[styles.navIconWrap, { backgroundColor: colors.bgInput }]}>
                <Home size={18} color={colors.textPrimary} />
              </View>
              <View style={styles.navTextWrap}>
                <Text style={[styles.navTitle, { color: colors.textPrimary }]}>Community Feed</Text>
                <Text style={[styles.navSubtitle, { color: colors.textMuted }]}>Daily Hustle, stories & workouts</Text>
              </View>
              <ChevronRight size={16} color={colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                onSelectDiscover?.();
                onClose();
              }}
              style={[styles.navItem, { backgroundColor: colors.bgCardSecondary, borderColor: colors.borderColor }]}
            >
              <View style={[styles.navIconWrap, { backgroundColor: colors.bgInput }]}>
                <Compass size={18} color={colors.textPrimary} />
              </View>
              <View style={styles.navTextWrap}>
                <Text style={[styles.navTitle, { color: colors.textPrimary }]}>Venues & Coaches</Text>
                <Text style={[styles.navSubtitle, { color: colors.textMuted }]}>GPS radar, pickleball & gym drop-in</Text>
              </View>
              <ChevronRight size={16} color={colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                onSelectTrack?.();
                onClose();
              }}
              style={[styles.navItem, { backgroundColor: colors.bgCardSecondary, borderColor: colors.borderColor }]}
            >
              <View style={[styles.navIconWrap, { backgroundColor: colors.bgInput }]}>
                <Dumbbell size={18} color={colors.textPrimary} />
              </View>
              <View style={styles.navTextWrap}>
                <Text style={[styles.navTitle, { color: colors.textPrimary }]}>Activity & Nutrition</Text>
                <Text style={[styles.navSubtitle, { color: colors.textMuted }]}>Lift, GPS Move, Macros & Journey</Text>
              </View>
              <ChevronRight size={16} color={colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                onSelectCards?.();
                onClose();
              }}
              style={[styles.navItem, { backgroundColor: colors.bgCardSecondary, borderColor: colors.borderColor }]}
            >
              <View style={[styles.navIconWrap, { backgroundColor: colors.bgInput }]}>
                <CreditCard size={18} color={colors.textPrimary} />
              </View>
              <View style={styles.navTextWrap}>
                <Text style={[styles.navTitle, { color: colors.textPrimary }]}>Passes & VIP Wallet</Text>
                <Text style={[styles.navSubtitle, { color: colors.textMuted }]}>Turnstile TOTP, SOA ledger & billing</Text>
              </View>
              <ChevronRight size={16} color={colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                onClose();
                onOpenSettings();
              }}
              style={[styles.navItem, { backgroundColor: colors.bgCardSecondary, borderColor: colors.borderColor }]}
            >
              <View style={[styles.navIconWrap, { backgroundColor: colors.bgInput }]}>
                <SettingsIcon size={18} color={colors.textPrimary} />
              </View>
              <View style={styles.navTextWrap}>
                <Text style={[styles.navTitle, { color: colors.textPrimary }]}>Settings & Preferences</Text>
                <Text style={[styles.navSubtitle, { color: colors.textMuted }]}>Appearance, sensors & roles</Text>
              </View>
              <ChevronRight size={16} color={colors.textMuted} />
            </TouchableOpacity>

            {/* 3. QA STATE TESTING TOOLS */}
            <Text style={[styles.sectionHeader, { color: colors.textMuted }]}>QA & DEMO CONTROLS</Text>

            <TouchableOpacity
              onPress={() => {
                resetToEmpty();
                onClose();
              }}
              style={[styles.toolBtn, { backgroundColor: colors.bgCardSecondary, borderColor: colors.borderColor }]}
            >
              <RefreshCw size={16} color={colors.accentText} />
              <View style={styles.toolTextWrap}>
                <Text style={[styles.toolTitle, { color: colors.textPrimary }]}>Reset to Empty State</Text>
                <Text style={[styles.toolDesc, { color: colors.textMuted }]}>Clear active passes, workouts & posts</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                loadDemoData();
                onClose();
              }}
              style={[styles.toolBtn, { backgroundColor: colors.bgCardSecondary, borderColor: colors.borderColor }]}
            >
              <Database size={16} color={colors.info} />
              <View style={styles.toolTextWrap}>
                <Text style={[styles.toolTitle, { color: colors.textPrimary }]}>Load Demo Seed Data</Text>
                <Text style={[styles.toolDesc, { color: colors.textMuted }]}>Populate 3 feed posts & BGC passes</Text>
              </View>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </AppModal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.65)", flexDirection: "row" },
  drawerContainer: { width: "82%", height: "100%", paddingHorizontal: 16, paddingTop: 48, borderRightWidth: 1 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottomWidth: 1, paddingBottom: 14, marginBottom: 12 },
  headerTitle: { fontSize: 11, fontWeight: "800", letterSpacing: 0.8 },
  closeBtn: { minWidth: 40, minHeight: 40, alignItems: "center", justifyContent: "center" },
  scrollContent: { paddingBottom: 40 },
  userCard: { flexDirection: "row", alignItems: "center", padding: 12, borderRadius: 16, marginBottom: 20, borderWidth: 1 },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  userInfo: { flex: 1, marginLeft: 12 },
  userName: { fontSize: 15, fontWeight: "800" },
  userHandle: { fontSize: 11, marginTop: 1 },
  activeRoleBadge: { backgroundColor: "rgba(225, 29, 72, 0.15)", alignSelf: "flex-start", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginTop: 4 },
  activeRoleText: { color: "#E11D48", fontSize: 11, fontWeight: "800" },
  sectionHeader: { fontSize: 11, fontWeight: "800", letterSpacing: 0.8, marginBottom: 8, marginTop: 10 },
  navItem: { flexDirection: "row", alignItems: "center", borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1 },
  navIconWrap: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  navTextWrap: { flex: 1, marginLeft: 10 },
  navTitle: { fontSize: 13, fontWeight: "700" },
  navSubtitle: { fontSize: 11, marginTop: 1 },
  toolBtn: { flexDirection: "row", alignItems: "center", borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1 },
  toolTextWrap: { flex: 1, marginLeft: 10 },
  toolTitle: { fontSize: 12, fontWeight: "700" },
  toolDesc: { fontSize: 11, marginTop: 1 },
});
