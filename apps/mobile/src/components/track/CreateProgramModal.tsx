import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";
import { AppModal } from "../common/AppModal";
import { X, Plus, Trash2, Dumbbell, Calendar, Check } from "lucide-react-native";
import { FlashList } from "@shopify/flash-list";
import { useThemeStore } from "../../theme/theme";
import { toast } from "../../feedback/toastStore";
import { styles } from "./CreateProgramModal.styles";
import { useTrackingStore, type TrainingProgram, type ProgramDay, type ProgramExercise } from "../../store/trackingStore";

interface CreateProgramModalProps {
  visible: boolean;
  onClose: () => void;
}

export function CreateProgramModal({ visible, onClose }: CreateProgramModalProps) {
  const { colors } = useThemeStore();
  const { saveProgram } = useTrackingStore();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [titleError, setTitleError] = useState<string | null>(null);
  const [days, setDays] = useState<ProgramDay[]>([
    {
      id: "day_1",
      dayName: "Day 1: Upper Push & Pull",
      exercises: [
        { name: "Barbell Bench Press", sets: 4, reps: 8, weightKg: 80 },
        { name: "Barbell Bent-Over Row", sets: 3, reps: 10, weightKg: 70 },
      ],
    },
    {
      id: "day_2",
      dayName: "Day 2: Lower & Core",
      exercises: [{ name: "Barbell Back Squat", sets: 4, reps: 6, weightKg: 120 }],
    },
  ]);

  const addDay = () => {
    setDays((prev) => [
      ...prev,
      { id: `day_${Date.now()}`, dayName: `Day ${prev.length + 1}: Split`, exercises: [{ name: "Overhead Press", sets: 3, reps: 10, weightKg: 40 }] },
    ]);
  };

  const removeDay = (dayIdx: number) => {
    if (days.length <= 1) {
      toast.warning("Keep at least one day", "A program needs at least 1 training day.");
      return;
    }
    setDays((prev) => prev.filter((_, idx) => idx !== dayIdx));
  };

  const updateDayName = (dayIdx: number, val: string) => {
    setDays((prev) => prev.map((d, i) => (i === dayIdx ? { ...d, dayName: val } : d)));
  };

  const addExercise = (dayIdx: number) => {
    setDays((prev) =>
      prev.map((d, i) => (i === dayIdx ? { ...d, exercises: [...d.exercises, { name: "New Exercise", sets: 3, reps: 10, weightKg: 50 }] } : d))
    );
  };

  const removeExercise = (dayIdx: number, exIdx: number) => {
    setDays((prev) =>
      prev.map((d, i) => {
        if (i !== dayIdx) return d;
        if (d.exercises.length <= 1) {
          toast.warning("Keep at least one exercise", "Each day needs at least 1 exercise.");
          return d;
        }
        return { ...d, exercises: d.exercises.filter((_, idx) => idx !== exIdx) };
      })
    );
  };

  const updateExercise = <K extends keyof ProgramExercise>(dayIdx: number, exIdx: number, field: K, val: ProgramExercise[K]) => {
    setDays((prev) =>
      prev.map((d, i) => (i !== dayIdx ? d : { ...d, exercises: d.exercises.map((ex, eIdx) => (eIdx === exIdx ? { ...ex, [field]: val } : ex)) }))
    );
  };

  const handleSave = () => {
    if (!title.trim()) {
      setTitleError("Give your program a title.");
      return;
    }
    const newProg: TrainingProgram = {
      id: `prog_${Date.now()}`,
      title: title.trim(),
      description: description.trim() || "Custom athletic program",
      days,
    };
    saveProgram(newProg);
    toast.success("Program saved", `"${title.trim()}" is in your Training Vault.`);
    setTitle("");
    setDescription("");
    onClose();
  };

  return (
    <AppModal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: colors.bgScreen }]}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={[styles.navHeader, { borderBottomColor: colors.borderColor }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} accessibilityRole="button" accessibilityLabel="Close"><X size={22} color={colors.textPrimary} /></TouchableOpacity>
          <View style={styles.headerTitleWrap}>
            <Dumbbell size={18} color={colors.accent} />
            <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Create Program</Text>
          </View>
          <TouchableOpacity onPress={handleSave} style={styles.saveHeaderBtn} accessibilityRole="button" accessibilityLabel="Save program">
            <Check size={16} color="#FFFFFF" strokeWidth={3} />
            <Text style={styles.saveHeaderText}>Save</Text>
          </TouchableOpacity>
        </View>

        <FlashList
          data={days}
          keyExtractor={(d) => d.id}
          style={styles.content}
          contentContainerStyle={styles.scrollInner}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            <View>
          <Text style={[styles.label, { color: colors.textMuted }]}>PROGRAM TITLE</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.bgCard, color: colors.textPrimary, borderColor: colors.borderColor }]}
            placeholder="e.g. 5-Day Power & Hypertrophy"
            placeholderTextColor={colors.textMuted}
            value={title}
            onChangeText={(v) => {
              setTitle(v);
              if (v.trim()) setTitleError(null);
            }}
            accessibilityLabel="Program title"
          />
          {titleError ? <Text style={{ color: colors.danger, fontSize: 12, marginTop: 4 }}>{titleError}</Text> : null}
          <Text style={[styles.label, { color: colors.textMuted, marginTop: 12 }]}>FOCUS & DESCRIPTION</Text>
          <TextInput
            style={[styles.input, styles.textArea, { backgroundColor: colors.bgCard, color: colors.textPrimary, borderColor: colors.borderColor }]}
            placeholder="e.g. Progressive overload split with target RPE 8-9."
            placeholderTextColor={colors.textMuted}
            value={description}
            onChangeText={setDescription}
            multiline
          />

          <View style={styles.daysHeaderRow}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Training Days ({days.length})</Text>
            <TouchableOpacity onPress={addDay} style={styles.addDayBtn}>
              <Plus size={14} color={colors.accent} />
              <Text style={styles.addDayText}>Add Day</Text>
            </TouchableOpacity>
          </View>

            </View>
          }
          renderItem={({ item: day, index: dIdx }) => (
            <View style={[styles.dayCard, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
              <View style={styles.dayCardHeader}>
                <View style={styles.dayTitleRow}>
                  <Calendar size={15} color={colors.accent} />
                  <TextInput style={[styles.dayNameInput, { color: colors.textPrimary }]} value={day.dayName} onChangeText={(val) => updateDayName(dIdx, val)} />
                </View>
                <TouchableOpacity onPress={() => removeDay(dIdx)} style={styles.iconBtn} accessibilityRole="button" accessibilityLabel={`Remove ${day.dayName}`}><Trash2 size={16} color={colors.textMuted} /></TouchableOpacity>
              </View>

              {day.exercises.map((ex, eIdx) => (
                <View key={eIdx} style={[styles.exerciseRow, { backgroundColor: colors.bgCardSecondary }]}>
                  <TextInput
                    style={[styles.exerciseInput, { color: colors.textPrimary }]}
                    value={ex.name}
                    onChangeText={(val) => updateExercise(dIdx, eIdx, "name", val)}
                    placeholder="Exercise name"
                    placeholderTextColor={colors.textMuted}
                  />
                  <View style={styles.exControlsRow}>
                    <View style={styles.metricInputWrap}>
                      <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Sets</Text>
                      <TextInput
                        style={[styles.metricInput, { color: colors.textPrimary }]}
                        keyboardType="numeric"
                        value={String(ex.sets)}
                        onChangeText={(v) => updateExercise(dIdx, eIdx, "sets", parseInt(v) || 1)}
                      />
                    </View>
                    <View style={styles.metricInputWrap}>
                      <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Reps</Text>
                      <TextInput
                        style={[styles.metricInput, { color: colors.textPrimary }]}
                        keyboardType="numeric"
                        value={String(ex.reps)}
                        onChangeText={(v) => updateExercise(dIdx, eIdx, "reps", parseInt(v) || 1)}
                      />
                    </View>
                    <View style={styles.metricInputWrap}>
                      <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Kg</Text>
                      <TextInput
                        style={[styles.metricInput, { color: colors.textPrimary }]}
                        keyboardType="numeric"
                        value={String(ex.weightKg)}
                        onChangeText={(v) => updateExercise(dIdx, eIdx, "weightKg", parseInt(v) || 0)}
                      />
                    </View>
                    <TouchableOpacity onPress={() => removeExercise(dIdx, eIdx)} style={styles.delExBtn} accessibilityRole="button" accessibilityLabel={`Remove ${ex.name}`}>
                      <Trash2 size={14} color={colors.danger} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              <TouchableOpacity onPress={() => addExercise(dIdx)} style={styles.addExRowBtn}>
                <Plus size={14} color={colors.accentGreen} />
                <Text style={styles.addExRowText}>Add Exercise to {day.dayName.split(":")[0]}</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      </KeyboardAvoidingView>
    </AppModal>
  );
}
