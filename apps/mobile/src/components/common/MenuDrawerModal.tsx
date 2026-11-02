import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView, Image } from "react-native";
import { X, User, Briefcase, UserCheck, Calendar, RefreshCw, Database, Settings as SettingsIcon, ChevronRight } from "lucide-react-native";
import { useEcosystemStore } from "../../store/ecosystemStore";

interface MenuDrawerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectFeed?: () => void;
  onOpenStaffDash: () => void;
  onOpenCoachDash: () => void;
  onOpenOrganizer: () => void;
  onOpenSettings: () => void;
}

export function MenuDrawerModal({
  visible,
  onClose,
  onSelectFeed,
  onOpenStaffDash,
  onOpenCoachDash,
  onOpenOrganizer,
  onOpenSettings,
}: MenuDrawerModalProps) {
  const { profile, currentRole, setRole, loadDemoData, resetToEmpty } = useEcosystemStore();

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.drawerContainer}>
          {/* TOP DRAWER HEADER */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>NAVIGATION & ROLES</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color="#FAFAFA" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* USER MINI PROFILE */}
            <View style={styles.userCard}>
              <Image
                source={{ uri: profile.avatar_url ?? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80" }}
                style={styles.avatar}
              />
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{profile.name ?? "Adam Arête"}</Text>
                <Text style={styles.userHandle}>@{profile.username}</Text>
                <View style={styles.activeRoleBadge}>
                  <Text style={styles.activeRoleText}>ROLE: {currentRole.toUpperCase()}</Text>
                </View>
              </View>
            </View>

            {/* ROLE SWITCHING SECTION */}
            <Text style={styles.sectionHeader}>SWITCH APP WORKSPACE</Text>

            <TouchableOpacity
              onPress={() => {
                setRole("individual");
                onSelectFeed?.();
                onClose();
              }}
              style={[styles.roleItem, currentRole === "individual" && styles.roleItemActive]}
            >
              <View style={styles.roleIconWrap}>
                <User size={18} color="#FAFAFA" />
              </View>
              <View style={styles.roleTextWrap}>
                <Text style={styles.roleTitle}>Athlete Mode</Text>
                <Text style={styles.roleSubtitle}>Sodia Feed, Passes, Track Hub & Locker</Text>
              </View>
              <ChevronRight size={16} color="#71717A" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                onClose();
                onOpenStaffDash();
              }}
              style={styles.roleItem}
            >
              <View style={[styles.roleIconWrap, { backgroundColor: "rgba(16, 185, 129, 0.15)" }]}>
                <Briefcase size={18} color="#10B981" />
              </View>
              <View style={styles.roleTextWrap}>
                <Text style={styles.roleTitle}>Staff Turnstile Scanner</Text>
                <Text style={styles.roleSubtitle}>Front Desk GymDash DTR & gate verification</Text>
              </View>
              <ChevronRight size={16} color="#71717A" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                onClose();
                onOpenCoachDash();
              }}
              style={styles.roleItem}
            >
              <View style={[styles.roleIconWrap, { backgroundColor: "rgba(59, 130, 246, 0.15)" }]}>
                <UserCheck size={18} color="#3B82F6" />
              </View>
              <View style={styles.roleTextWrap}>
                <Text style={styles.roleTitle}>Coach Floor Roster</Text>
                <Text style={styles.roleSubtitle}>Live clients on floor & auto-split fees</Text>
              </View>
              <ChevronRight size={16} color="#71717A" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                onClose();
                onOpenOrganizer();
              }}
              style={styles.roleItem}
            >
              <View style={[styles.roleIconWrap, { backgroundColor: "rgba(245, 158, 11, 0.15)" }]}>
                <Calendar size={18} color="#F59E0B" />
              </View>
              <View style={styles.roleTextWrap}>
                <Text style={styles.roleTitle}>Tournament Organizer Pro</Text>
                <Text style={styles.roleSubtitle}>Clubdash meets, waitlist & split ledger</Text>
              </View>
              <ChevronRight size={16} color="#71717A" />
            </TouchableOpacity>

            {/* QA STATE TESTING TOOLS */}
            <Text style={styles.sectionHeader}>QA & STATE ENVELOPE TOOLS</Text>

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
                <Text style={styles.toolDesc}>Clear all active passes, workouts & posts</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                loadDemoData();
                onClose();
              }}
              style={styles.toolBtn}
            >
              <Database size={16} color="#10B981" />
              <View style={styles.toolTextWrap}>
                <Text style={styles.toolTitle}>Load Seeded Demo Data</Text>
                <Text style={styles.toolDesc}>Populate feed posts, passes & challenges</Text>
              </View>
            </TouchableOpacity>

            {/* APP SETTINGS */}
            <TouchableOpacity
              onPress={() => {
                onClose();
                onOpenSettings();
              }}
              style={[styles.toolBtn, { marginTop: 8 }]}
            >
              <SettingsIcon size={16} color="#FAFAFA" />
              <View style={styles.toolTextWrap}>
                <Text style={styles.toolTitle}>App Settings & Wearables</Text>
                <Text style={styles.toolDesc}>Manage Apple Health, FaceID & permissions</Text>
              </View>
              <ChevronRight size={16} color="#71717A" />
            </TouchableOpacity>
          </ScrollView>

          {/* FOOTER CLOSE BUTTON */}
          <View style={styles.footer}>
            <TouchableOpacity onPress={onClose} style={styles.footerCloseBtn}>
              <Text style={styles.footerCloseText}>Back to App</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.75)", justifyContent: "flex-end" },
  drawerContainer: { backgroundColor: "#121215", borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: "90%", minHeight: "65%", borderWidth: 1, borderColor: "#27272A" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingTop: 14, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: "#1E1E24" },
  headerTitle: { color: "#FAFAFA", fontSize: 12, fontWeight: "900", letterSpacing: 1 },
  closeBtn: { minWidth: 44, minHeight: 44, justifyContent: "center", alignItems: "center" },
  scrollContent: { padding: 16 },
  userCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#18181B", borderRadius: 14, padding: 14, marginBottom: 18, borderWidth: 1, borderColor: "#27272A" },
  avatar: { width: 50, height: 50, borderRadius: 25, borderWidth: 2, borderColor: "#E11D48" },
  userInfo: { marginLeft: 12, flex: 1 },
  userName: { color: "#FAFAFA", fontSize: 16, fontWeight: "800" },
  userHandle: { color: "#A1A1AA", fontSize: 12 },
  activeRoleBadge: { alignSelf: "flex-start", backgroundColor: "rgba(225, 29, 72, 0.2)", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginTop: 4 },
  activeRoleText: { color: "#E11D48", fontSize: 10, fontWeight: "800" },
  sectionHeader: { color: "#71717A", fontSize: 11, fontWeight: "800", letterSpacing: 0.8, marginBottom: 8, marginTop: 10 },
  roleItem: { flexDirection: "row", alignItems: "center", backgroundColor: "#18181B", borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: "#27272A" },
  roleItemActive: { borderColor: "#E11D48", backgroundColor: "rgba(225, 29, 72, 0.08)" },
  roleIconWrap: { width: 36, height: 36, borderRadius: 8, backgroundColor: "#27272A", alignItems: "center", justifyContent: "center" },
  roleTextWrap: { flex: 1, marginLeft: 12 },
  roleTitle: { color: "#FAFAFA", fontSize: 13, fontWeight: "700" },
  roleSubtitle: { color: "#71717A", fontSize: 11, marginTop: 1 },
  toolBtn: { flexDirection: "row", alignItems: "center", backgroundColor: "#18181B", borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: "#27272A" },
  toolTextWrap: { flex: 1, marginLeft: 12 },
  toolTitle: { color: "#FAFAFA", fontSize: 13, fontWeight: "700" },
  toolDesc: { color: "#71717A", fontSize: 11, marginTop: 1 },
  footer: { padding: 16, borderTopWidth: 1, borderTopColor: "#1E1E24" },
  footerCloseBtn: { backgroundColor: "#27272A", paddingVertical: 12, borderRadius: 10, alignItems: "center" },
  footerCloseText: { color: "#FAFAFA", fontSize: 13, fontWeight: "700" },
});