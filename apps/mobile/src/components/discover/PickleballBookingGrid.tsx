import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { Check, Clock, ShieldCheck, AlertCircle } from "lucide-react-native";
import { useThemeStore } from "../../theme/theme";

export interface SelectedSlot {
  courtId: string;
  courtName: string;
  timeSlot: string;
  pricePhp: number;
}

interface PickleballBookingGridProps {
  hourlyRate?: number;
  onConfirmBooking?: (slot: SelectedSlot) => void;
}

const COURTS = [
  { id: "C1", name: "Court 1", type: "Indoor AC" },
  { id: "C2", name: "Court 2", type: "Pro Plexi" },
  { id: "C3", name: "Court 3", type: "Covered" },
];

const TIME_SLOTS = [
  "08:00 - 09:00",
  "09:00 - 10:00",
  "10:00 - 11:00",
  "16:00 - 17:00",
  "17:00 - 18:00",
  "18:00 - 19:00",
  "19:00 - 20:00",
];

// Initial pre-booked slots for realistic simulation
const INITIAL_BOOKED: Record<string, string> = {
  "C1_09:00 - 10:00": "Metro League",
  "C2_10:00 - 11:00": "Coach Rafael",
  "C3_17:00 - 18:00": "DUPR Heat",
  "C1_19:00 - 20:00": "Corporate Cup",
};

export function PickleballBookingGrid({
  hourlyRate = 200,
  onConfirmBooking,
}: PickleballBookingGridProps) {
  const { colors } = useThemeStore();
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null);
  const [bookedMap, setBookedMap] = useState<Record<string, string>>(INITIAL_BOOKED);
  const [confirmedNotice, setConfirmedNotice] = useState<string | null>(null);

  const handleTilePress = (courtId: string, courtName: string, timeSlot: string) => {
    const key = `${courtId}_${timeSlot}`;
    if (bookedMap[key]) return; // Occupied, non-clickable

    setConfirmedNotice(null);
    if (selectedSlot?.courtId === courtId && selectedSlot?.timeSlot === timeSlot) {
      setSelectedSlot(null); // Toggle off
    } else {
      setSelectedSlot({ courtId, courtName, timeSlot, pricePhp: hourlyRate });
    }
  };

  const handleBook = () => {
    if (!selectedSlot) return;
    const key = `${selectedSlot.courtId}_${selectedSlot.timeSlot}`;
    setBookedMap((prev) => ({ ...prev, [key]: "You (Confirmed)" }));
    setConfirmedNotice(
      `${selectedSlot.courtName} reserved for ${selectedSlot.timeSlot}! Pass loaded.`
    );
    onConfirmBooking?.(selectedSlot);
    setSelectedSlot(null);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bgCardSecondary, borderColor: colors.borderColor }]}>
      <View style={styles.headerRow}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Clock size={14} color={colors.accent} />
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>PICKLEBALL COURT GRID</Text>
        </View>
        <Text style={[styles.rateBadge, { color: colors.accentGreen }]}>₱{hourlyRate}/hr</Text>
      </View>

      {confirmedNotice && (
        <View style={styles.noticeBanner}>
          <ShieldCheck size={14} color="#059669" />
          <Text style={styles.noticeText}>{confirmedNotice}</Text>
        </View>
      )}

      {/* Grid Table */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View>
          {/* Court Column Headers */}
          <View style={styles.row}>
            <View style={[styles.timeHeaderCell, { borderColor: colors.borderColor }]}>
              <Text style={[styles.columnLabel, { color: colors.textMuted }]}>TIME</Text>
            </View>
            {COURTS.map((c) => (
              <View key={c.id} style={[styles.courtHeaderCell, { borderColor: colors.borderColor }]}>
                <Text style={[styles.courtName, { color: colors.textPrimary }]}>{c.name}</Text>
                <Text style={[styles.courtType, { color: colors.textMuted }]}>{c.type}</Text>
              </View>
            ))}
          </View>

          {/* Time Slot Rows */}
          {TIME_SLOTS.map((slot) => (
            <View key={slot} style={styles.row}>
              <View style={[styles.timeHeaderCell, { borderColor: colors.borderColor }]}>
                <Text style={[styles.timeLabel, { color: colors.textSecondary }]}>{slot}</Text>
              </View>

              {COURTS.map((court) => {
                const key = `${court.id}_${slot}`;
                const bookedLabel = bookedMap[key];
                const isSelected = selectedSlot?.courtId === court.id && selectedSlot?.timeSlot === slot;
                const isBooked = !!bookedLabel;

                return (
                  <TouchableOpacity
                    key={court.id}
                    disabled={isBooked}
                    onPress={() => handleTilePress(court.id, `${court.name} (${court.type})`, slot)}
                    style={[
                      styles.tile,
                      { borderColor: colors.borderColor, backgroundColor: colors.bgCard },
                      isBooked && [styles.tileBooked, { backgroundColor: colors.borderColor }],
                      isSelected && styles.tileSelected,
                    ]}
                  >
                    {isSelected ? (
                      <View style={styles.selectedContent}>
                        <Check size={13} color="#FFFFFF" strokeWidth={3} />
                        <Text style={styles.selectedText}>SELECTED</Text>
                      </View>
                    ) : isBooked ? (
                      <View style={styles.bookedContent}>
                        <Text style={[styles.bookedTag, { color: colors.textMuted }]}>BOOKED</Text>
                        <Text style={[styles.bookedUser, { color: colors.textMuted }]} numberOfLines={1}>{bookedLabel}</Text>
                      </View>
                    ) : (
                      <View style={styles.availableContent}>
                        <Text style={[styles.openTag, { color: colors.accentGreen }]}>OPEN</Text>
                        <Text style={[styles.priceTag, { color: colors.textPrimary }]}>₱{hourlyRate}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Selected Slot Sticky Bar */}
      {selectedSlot && (
        <View style={[styles.bookActionRow, { borderTopColor: colors.borderColor }]}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.bookCourtTitle, { color: colors.textPrimary }]}>{selectedSlot.courtName}</Text>
            <Text style={[styles.bookCourtTime, { color: colors.textMuted }]}>{selectedSlot.timeSlot}</Text>
          </View>
          <TouchableOpacity onPress={handleBook} style={styles.confirmBtn}>
            <Text style={styles.confirmBtnText}>Book Slot (₱{selectedSlot.pricePhp})</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { borderRadius: 16, borderWidth: 1, padding: 14, marginTop: 14, overflow: "hidden" },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  headerTitle: { fontSize: 11, fontWeight: "900", letterSpacing: 0.6 },
  rateBadge: { fontSize: 11, fontWeight: "900" },
  noticeBanner: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(5,150,105,0.12)", padding: 8, borderRadius: 8, marginBottom: 10 },
  noticeText: { color: "#059669", fontSize: 11, fontWeight: "700", flex: 1 },
  scrollContent: { paddingBottom: 4 },
  row: { flexDirection: "row", alignItems: "center" },
  timeHeaderCell: { width: 92, paddingVertical: 8, justifyContent: "center" },
  timeLabel: { fontSize: 11, fontWeight: "700" },
  columnLabel: { fontSize: 11, fontWeight: "800", letterSpacing: 0.5 },
  courtHeaderCell: { width: 96, paddingVertical: 6, alignItems: "center", borderBottomWidth: 1 },
  courtName: { fontSize: 11, fontWeight: "900" },
  courtType: { fontSize: 11, fontWeight: "600" },
  tile: { width: 92, height: 46, margin: 2, borderRadius: 8, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  tileBooked: { opacity: 0.55 },
  tileSelected: { backgroundColor: "#E11D48", borderColor: "#E11D48" },
  availableContent: { alignItems: "center" },
  openTag: { fontSize: 11, fontWeight: "900", letterSpacing: 0.5 },
  priceTag: { fontSize: 11, fontWeight: "800" },
  bookedContent: { alignItems: "center", paddingHorizontal: 2 },
  bookedTag: { fontSize: 11, fontWeight: "800" },
  bookedUser: { fontSize: 11, fontWeight: "600" },
  selectedContent: { alignItems: "center", gap: 1 },
  selectedText: { color: "#FFFFFF", fontSize: 11, fontWeight: "900", letterSpacing: 0.5 },
  bookActionRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 12, paddingTop: 12, borderTopWidth: 1 },
  bookCourtTitle: { fontSize: 12, fontWeight: "800" },
  bookCourtTime: { fontSize: 11, fontWeight: "600", marginTop: 2 },
  confirmBtn: { backgroundColor: "#E11D48", paddingHorizontal: 14, paddingVertical: 9, borderRadius: 10 },
  confirmBtnText: { color: "#FFFFFF", fontSize: 11, fontWeight: "900" },
});
