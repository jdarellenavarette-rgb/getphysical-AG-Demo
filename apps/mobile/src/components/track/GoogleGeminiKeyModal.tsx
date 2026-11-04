import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Modal, Alert } from "react-native";
import { useThemeStore } from "../../theme/theme";
import { styles } from "./FoodTrackerView.styles";

interface GoogleGeminiKeyModalProps {
  visible: boolean;
  apiKey: string;
  onSave: (key: string) => void;
  onClose: () => void;
}

export function GoogleGeminiKeyModal({
  visible,
  apiKey,
  onSave,
  onClose,
}: GoogleGeminiKeyModalProps) {
  const { colors } = useThemeStore();
  const [tempKey, setTempKey] = useState(apiKey);

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.keyModalOverlay}>
        <View style={[styles.keyModalCard, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
          <Text style={[styles.keyModalTitle, { color: colors.textPrimary }]}>Google Gemini API</Text>
          <Text style={[styles.keyModalDesc, { color: colors.textSecondary }]}>
            Power Oracle with Google's latest Gemini 2.0 Flash AI. Get a free API key at{" "}
            <Text style={{ color: "#3B82F6", fontWeight: "700" }}>aistudio.google.com/apikey</Text> (no credit card required).
          </Text>
          <TextInput
            style={[styles.keyInput, { backgroundColor: colors.bgCardSecondary, color: colors.textPrimary, borderColor: colors.borderColor }]}
            placeholder="Paste AIzaSy... key here"
            placeholderTextColor={colors.textMuted}
            value={tempKey}
            onChangeText={setTempKey}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <View style={styles.keyModalBtns}>
            <TouchableOpacity onPress={onClose} style={[styles.keyCancelBtn, { borderColor: colors.borderColor }]}>
              <Text style={{ color: colors.textSecondary, fontWeight: "700" }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                onSave(tempKey);
                onClose();
                Alert.alert("Google Gemini Connected", "Oracle is now powered live by Google Gemini AI!");
              }}
              style={styles.keySaveBtn}
            >
              <Text style={styles.keySaveText}>Save Key</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
