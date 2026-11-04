import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Award, Flame, Briefcase, CheckCircle2 } from "lucide-react-native";
import { chatStyles as styles } from "./DMChatView.styles";

interface PRStampBubbleProps {
  themeMode: "light" | "dark";
}

export function PRStampBubble({ themeMode }: PRStampBubbleProps) {
  const [hasCongratulated, setHasCongratulated] = useState(false);

  return (
    <View style={[styles.outgoingBubble, { backgroundColor: themeMode === "light" ? "#E11D48" : "#27272A" }]}>
      <View style={[styles.stampCard, { backgroundColor: themeMode === "light" ? "rgba(0,0,0,0.15)" : "#121215" }]}>
        <View style={styles.stampHeader}>
          <Award size={14} color="#10B981" />
          <Text style={styles.stampType}>LIFT STAMP • PR VERIFIED</Text>
        </View>
        <Text style={styles.stampMetric}>225 KG</Text>
        <Text style={[styles.stampDesc, themeMode === "light" && { color: "#FAFAFA" }]}>
          Conventional Deadlift • 1 Rep @ RPE 9.5
        </Text>
        <TouchableOpacity
          onPress={() => setHasCongratulated((p) => !p)}
          style={[styles.congratulateBtn, hasCongratulated && styles.congratulatedActive]}
        >
          <Flame size={14} color={hasCongratulated ? "#FFFFFF" : "#F97316"} />
          <Text style={[styles.congratulateText, hasCongratulated && styles.congratulateTextActive]}>
            {hasCongratulated ? "Fired Up! (1)" : "Congratulate"}
          </Text>
        </TouchableOpacity>
      </View>
      <Text style={[styles.bubbleTime, themeMode === "light" && { color: "rgba(255,255,255,0.7)" }]}>08:32 AM</Text>
    </View>
  );
}

interface CoachTelemetryBubbleProps {
  colors: any;
}

export function CoachTelemetryBubble({ colors }: CoachTelemetryBubbleProps) {
  const [showRawData, setShowRawData] = useState(false);

  return (
    <View style={[styles.incomingBubble, { backgroundColor: colors.bgCard, borderColor: colors.borderColor, borderWidth: 1 }]}>
      <Text style={[styles.bubbleText, { color: colors.textPrimary }]}>I reviewed your last set bar-speed curve.</Text>
      <TouchableOpacity
        onPress={() => setShowRawData((p) => !p)}
        style={[styles.rawDeepLinkBtn, { backgroundColor: colors.bgCardSecondary }]}
      >
        <Text style={styles.rawDeepLinkText}>
          {showRawData ? "📊 Hide Telemetry" : "📊 View Raw Data (Sets & RPE Breakdown)"}
        </Text>
      </TouchableOpacity>
      {showRawData && (
        <View style={{ marginTop: 8, padding: 8, backgroundColor: colors.bgCardSecondary, borderRadius: 8 }}>
          <Text style={{ color: "#10B981", fontSize: 11, fontWeight: "700" }}>Set 1: 140kg @ 0.62 m/s (RPE 7.0)</Text>
          <Text style={{ color: "#F59E0B", fontSize: 11, fontWeight: "700" }}>Set 2: 180kg @ 0.44 m/s (RPE 8.5)</Text>
          <Text style={{ color: "#E11D48", fontSize: 11, fontWeight: "700" }}>Set 3: 225kg @ 0.19 m/s (RPE 9.5 PR)</Text>
        </View>
      )}
      <Text style={[styles.bubbleTime, { color: colors.textMuted }]}>08:35 AM</Text>
    </View>
  );
}

interface B2BHandshakeCardProps {
  colors: any;
}

export function B2BHandshakeCard({ colors }: B2BHandshakeCardProps) {
  const [hasAcceptedHandshake, setHasAcceptedHandshake] = useState(false);

  return (
    <View style={[styles.handshakeCard, { backgroundColor: colors.bgCard }]}>
      <View style={styles.handshakeHeader}>
        <Briefcase size={16} color="#E11D48" />
        <Text style={styles.handshakeTitle}>OFFICIAL B2B STAFF INVITATION</Text>
      </View>
      <Text style={[styles.handshakeBody, { color: colors.textSecondary }]}>
        Metro Core Arena has invited you to join their frontline team as Front-Desk Staff & POS Operator.
      </Text>
      <TouchableOpacity
        onPress={() => setHasAcceptedHandshake(true)}
        disabled={hasAcceptedHandshake}
        style={[styles.handshakeBtn, hasAcceptedHandshake && styles.handshakeBtnSuccess]}
      >
        {hasAcceptedHandshake ? (
          <>
            <CheckCircle2 size={16} color="#10B981" />
            <Text style={styles.handshakeSuccessText}>Handshake Accepted • Role Added</Text>
          </>
        ) : (
          <Text style={styles.handshakeBtnText}>Review & Accept Role</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
