import React, { memo } from "react";
import { Text, View } from "react-native";
import { Radio, Tag } from "lucide-react-native";
import type { CrmChatMessage } from "sodia-core";
import { useThemeStore } from "../../../theme/theme";
import { chatStyles as styles } from "../DMChatView.styles";
import { ATHLETE_ID } from "../../../services/crmTransport";

function MessageBubbleImpl({ msg }: { msg: CrmChatMessage }) {
  const { colors, themeMode } = useThemeStore();

  if (msg.isCrmBroadcast && msg.broadcastData) {
    const bc = msg.broadcastData;
    return (
      <View style={[styles.broadcastCard, { backgroundColor: colors.bgCard, borderColor: colors.accent }]} accessible accessibilityLabel={`Facility broadcast: ${bc.title}. ${bc.body}`}>
        <View style={styles.broadcastHeader}>
          <View style={[styles.broadcastTag, { backgroundColor: colors.accent }]}>
            <Radio size={11} color={colors.textOnAccent} />
            <Text style={[styles.broadcastTagText, { color: colors.textOnAccent }]}>OFFICIAL FACILITY BROADCAST</Text>
          </View>
          <Text style={[styles.broadcastTime, { color: colors.textMuted }]}>{msg.time}</Text>
        </View>
        <Text style={[styles.broadcastTitle, { color: colors.textPrimary }]}>{bc.title}</Text>
        <Text style={[styles.broadcastBody, { color: colors.textSecondary }]}>{bc.body}</Text>
        {bc.promoCode ? (
          <View style={[styles.promoCodePill, { backgroundColor: colors.accentMuted }]}>
            <View style={styles.promoRow}>
              <Tag size={12} color={colors.accentText} />
              <Text style={[styles.promoCodeLabel, { color: colors.accentText }]}>VOUCHER CODE</Text>
            </View>
            <Text selectable style={[styles.promoCodeVal, { color: colors.textPrimary }]}>{bc.promoCode}</Text>
          </View>
        ) : null}
      </View>
    );
  }

  const outgoing = msg.senderId === ATHLETE_ID;
  const outgoingBg = themeMode === "light" ? colors.accent : colors.bgCardTertiary;
  return (
    <View
      style={[
        outgoing ? styles.outgoingBubble : styles.incomingBubble,
        { backgroundColor: outgoing ? outgoingBg : colors.bgCard },
        !outgoing && { borderColor: colors.borderColor, borderWidth: 1 },
      ]}
      accessible
      accessibilityLabel={`${outgoing ? "You" : msg.senderName}: ${msg.text}. ${msg.time}`}
    >
      <Text style={[styles.bubbleText, { color: outgoing ? colors.textOnAccent : colors.textPrimary }]}>{msg.text}</Text>
      <Text style={[styles.bubbleTime, { color: outgoing ? colors.textOnAccent : colors.textMuted, opacity: outgoing ? 0.8 : 1 }]}>{msg.time}</Text>
    </View>
  );
}

export const MessageBubble = memo(MessageBubbleImpl);
