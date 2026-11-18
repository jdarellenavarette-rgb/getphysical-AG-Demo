import React, { useEffect } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FlashList } from "@shopify/flash-list";
import { ArrowLeft, CloudOff, LogIn, MapPin } from "lucide-react-native";
import type { MyMembershipRow } from "sodia-core";
import { useEcosystemStore } from "../../store/ecosystemStore";
import { useMemberStore } from "../../store/memberStore";
import { useThemeStore } from "../../theme/theme";
import { useEdgeSwipeBack } from "../../hooks/useDismissGestures";
import { EmptyState } from "../common/EmptyState";
import { MyVenueRow } from "./MyVenueRow";

interface MyVenuesModalProps {
  visible: boolean;
  onClose: () => void;
  /** Takes the member to Discover to pick a venue. */
  onFindVenue: () => void;
}

/** The venues a member belongs to, with their standing at each and the controls that are theirs to use. */
export function MyVenuesModal({ visible, onClose, onFindVenue }: MyVenuesModalProps) {
  const insets = useSafeAreaInsets();
  const edgeBack = useEdgeSwipeBack(() => onClose());
  const { colors } = useThemeStore();
  const { isGuest, setIsGuest } = useEcosystemStore();
  const { memberships, membershipsSync, membershipsError, refreshMemberships } = useMemberStore();

  // Standing changes on the venue's side too (a pass granted or ended at the desk), so reload on every open.
  useEffect(() => {
    if (visible && !isGuest) void refreshMemberships();
  }, [visible, isGuest, refreshMemberships]);

  const signedOut = isGuest || membershipsSync === "signed_out";
  const hasRows = memberships.length > 0;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View {...edgeBack} style={[styles.container, { backgroundColor: colors.bgScreen }]}>
        <View
          style={[
            styles.topBar,
            { paddingTop: insets.top + 10, borderBottomColor: colors.borderColor, backgroundColor: colors.bgHeader },
          ]}
        >
          <TouchableOpacity onPress={onClose} style={styles.backBtn} accessibilityRole="button">
            <ArrowLeft size={20} color={colors.textPrimary} />
            <Text style={[styles.backBtnText, { color: colors.textPrimary }]}>Back</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>My venues</Text>
          <View style={{ width: 60 }} />
        </View>

        {signedOut ? (
          <EmptyState
            icon={LogIn}
            title="Sign in to see your venues"
            body="Your memberships are kept with your account."
            actionLabel="Sign in"
            onAction={() => {
              onClose();
              // Leaving guest mode returns to the sign-in screen.
              setIsGuest(false);
            }}
          />
        ) : hasRows ? (
          <>
            {membershipsSync === "error" ? (
              <Text style={[styles.staleNote, { color: colors.textMuted }]}>
                Couldn't refresh. This is the list as last loaded.
              </Text>
            ) : null}
            <FlashList<MyMembershipRow>
              data={memberships}
              keyExtractor={(row) => row.facility_id}
              renderItem={({ item }) => <MyVenueRow membership={item} />}
              contentContainerStyle={styles.listContent}
              onRefresh={() => void refreshMemberships()}
              refreshing={membershipsSync === "loading"}
            />
          </>
        ) : membershipsSync === "error" ? (
          <EmptyState
            icon={CloudOff}
            title="Couldn't load your venues"
            body={membershipsError ?? "Something went wrong. Please retry."}
            actionLabel="Retry"
            onAction={() => void refreshMemberships()}
          />
        ) : membershipsSync === "ready" ? (
          <EmptyState
            icon={MapPin}
            title="No venues yet"
            body="Join a venue or buy a pass and it shows up here."
            actionLabel="Find a venue"
            onAction={onFindVenue}
          />
        ) : (
          // Same outline as the loaded list, so nothing jumps when the venues arrive.
          <View accessibilityLabel="Loading your venues" style={styles.listContent}>
            {[0, 1, 2].map((row) => (
              <View key={row} style={[styles.skeleton, { backgroundColor: colors.bgCardSecondary }]} />
            ))}
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  backBtn: { flexDirection: "row", alignItems: "center", minWidth: 60, minHeight: 44 },
  backBtnText: { fontSize: 13, fontWeight: "700", marginLeft: 4 },
  headerTitle: { fontSize: 16, fontWeight: "800" },
  listContent: { padding: 16, paddingBottom: 60 },
  staleNote: { fontSize: 12, paddingHorizontal: 16, paddingTop: 12 },
  skeleton: { height: 150, borderRadius: 16, marginBottom: 12, opacity: 0.6 },
});
