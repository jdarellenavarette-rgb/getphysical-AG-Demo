import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView, Image } from "react-native";
import { X, User, Home, Compass, Dumbbell, CreditCard, RefreshCw, Database, Settings as SettingsIcon, ChevronRight } from "lucide-react-native";
import { useEcosystemStore } from "../../store/ecosystemStore";

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
  const { profile, currentRole, loadDemoData, resetToEmpty } = useEcosystemStore();

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.drawerContainer}>
          {/* TOP DRAWER HEADER */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>NAVIGATION & MENU</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color="#FAFAFA" />
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
              style={styles.userCard}
            >
              <Image
                source={{ uri: profile.avatar_url ?? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80" }}
                style={styles.avatar}
              />
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{profile.name ?? "Adam Arête"}</Text>
                <Text style={styles.userHandle}>@{profile.username} • View Profile</Text>
                <View style={styles.activeRoleBadge}>
                  <Text style={styles.activeRoleText}>ATHLETE PROFILE</Text>
                </View>
              </View>
              <ChevronRight size={18} color="#FAFAFA" />
            </TouchableOpacity>

            {/* 2. CORE APP NAVIGATION */}
            <Text style={styles.sectionHeader}>APP HUBS</Text>

            <TouchableOpacity
              onPress={() => {
                onSelectFeed?.();
                onClose();
              }}
              style={styles.navItem}
            >
              <View style={styles.navIconWrap}>
                <Home size={18} color="#FAFAFA" />
              </View>
              <View style={styles.navTextWrap}>
                <Text style={styles.navTitle}>Community Feed</Text>
                <Text style={styles.navSubtitle}>Daily Hustle, stories & workouts</Text>
              </View>
              <ChevronRight size={16} color="#71717A" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                onSelectDiscover?.();
                onClose();
              }}
              style={styles.navItem}
            >
              <View style={styles.navIconWrap}>
                <Compass size={18} color="#FAFAFA" />
              </View>
              <View style={styles.navTextWrap}>
                <Text style={styles.navTitle}>Venues & Coaches</Text>
                <Text style={styles.navSubtitle}>GPS radar, pickleball & gym drop-in</Text>
              </View>
              <ChevronRight size={16} color="#71717A" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                onSelectTrack?.();
                onClose();
              }}
              style={styles.navItem}
            >
              <View style={styles.navIconWrap}>
                <Dumbbell size={18} color="#FAFAFA" />
              </View>
              <View style={styles.navTextWrap}>
                <Text style={styles.navTitle}>Activity & Nutrition</Text>
                <Text style={styles.navSubtitle}>Lift, GPS Move, Macros & Journey</Text>
              </View>
              <ChevronRight size={16} color="#71717A" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                onSelectCards?.();
                onClose();
              }}
              style={styles.navItem}
            >
              <View style={styles.navIconWrap}>
                <CreditCard size={18} color="#FAFAFA" />
              </View>
              <View style={styles.navTextWrap}>
                <Text style={styles.navTitle}>Passes & VIP Wallet</Text>
                <Text style={styles.navSubtitle}>Turnstile TOTP, SOA ledger & billing</Text>
              </View>
              <ChevronRight size={16} color="#71717A" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                onClose();
                onOpenSettings();
              }}
              style={styles.navItem}
            >
              <View style={[styles.navIconWrap, { backgroundColor: "#27272A" }]}>
                <SettingsIcon size={18} color="#A1A1AA" />
              </View>
              <View style={styles.navTextWrap}>
                <Text style={styles.navTitle}>Settings & Preferences</Text>
                <Text style={styles.navSubtitle}>Sensors, security & operator roles</Text>
              </View>
              <ChevronRight size={16} color="#71717A" />
            </TouchableOpacity>

            {/* 3. QA STATE TESTING TOOLS */}
            <Text style={styles.sectionHeader}>QA & DEMO CONTROLS</Text>

            <TouchableOpacity
              onPress={() => {
                resetToEmpty();
                onClose();
              }}
              style={styles.toolBtn}
            >
              <RefreshCw size={16} color="#EC4899" />
              <View style={styles.toolTextWrap}>
                <Text style={styles.toolTitle}>Reset to Empty State</Text>
                <Text style={styles.toolDesc}>Clear active passes, workouts & posts</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                loadDemoData();
                onClose();
              }}
              style={styles.toolBtn}
            >
              <Database size={16} color="#3B82F6" />
              <View style={styles.toolTextWrap}>
                <Text style={styles.toolTitle}>Load Demo Seed Data</Text>
                <Text style={styles.toolDesc}>Populate 3 feed posts & BGC passes</Text>
              </View>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.75)", flexDirection: "row" },
  drawerContainer: { width: "82%", backgroundColor: "#141418", height: "100%", paddingHorizontal: 16, paddingTop: 48, borderRightWidth: 1, borderRightColor: "#27272A" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottomWidth: 1, borderBottomColor: "#27272A", paddingBottom: 14, marginBottom: 12 },
  headerTitle: { color: "#71717A", fontSize: 11, fontWeight: "800", letterSpacing: 0.8 },
  closeBtn: { minWidth: 40, minHeight: 40, alignItems: "center", justifyContent: "center" },
  scrollContent: { paddingBottom: 40 },
  userCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#1C1C22", padding: 12, borderRadius: 16, marginBottom: 20, borderWidth: 1, borderColor: "rgba(225,29,72,0.3)" },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  userInfo: { flex: 1, marginLeft: 12 },
  userName: { color: "#FAFAFA", fontSize: 15, fontWeight: "800" },
  userHandle: { color: "#A1A1AA", fontSize: 11, marginTop: 1 },
  activeRoleBadge: { backgroundColor: "rgba(225, 29, 72, 0.15)", alignSelf: "flex-start", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginTop: 4 },
  activeRoleText: { color: "#E11D48", fontSize: 9, fontWeight: "800" },
  sectionHeader: { color: "#71717A", fontSize: 10, fontWeight: "800", letterSpacing: 0.8, marginBottom: 8, marginTop: 10 },
  navItem: { flexDirection: "row", alignItems: "center", backgroundColor: "#18181B", borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" },
  navIconWrap: { width: 34, height: 34, borderRadius: 17, backgroundColor: "#27272A", alignItems: "center", justifyContent: "center" },
  navTextWrap: { flex: 1, marginLeft: 10 },
  navTitle: { color: "#FAFAFA", fontSize: 13, fontWeight: "700" },
  navSubtitle: { color: "#71717A", fontSize: 10, marginTop: 1 },
  toolBtn: { flexDirection: "row", alignItems: "center", backgroundColor: "#18181B", borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: "#27272A" },
  toolTextWrap: { flex: 1, marginLeft: 10 },
  toolTitle: { color: "#FAFAFA", fontSize: 12, fontWeight: "700" },
  toolDesc: { color: "#71717A", fontSize: 10, marginTop: 1 },
});
