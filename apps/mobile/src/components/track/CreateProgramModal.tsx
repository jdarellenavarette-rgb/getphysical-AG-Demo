import React, { useState } from "react";
import { View, Text, StyleSheet, Modal, ScrollView, TextInput, TouchableOpacity, Alert } from "react-native";
import { X, Plus, Trash2, Dumbbell, Calendar, Check } from "lucide-react-native";
import { useThemeStore } from "../../theme/theme";
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
    if (days.length <= 1) return Alert.alert("Requirement", "A program must contain at least 1 day.");
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
          Alert.alert("Requirement", "Each day must have at least 1 exercise.");
          return d;
        }
        return { ...d, exercises: d.exercises.filter((_, idx) => idx !== exIdx) };
      })
    );
  };

  const updateExercise = (dayIdx: number, exIdx: number, field: keyof ProgramExercise, val: any) => {
    setDays((prev) =>
      prev.map((d, i) => (i !== dayIdx ? d : { ...d, exercises: d.exercises.map((ex, eIdx) => (eIdx === exIdx ? { ...ex, [field]: val } : ex)) }))
    );
  };

  const handleSave = () => {
    if (!title.trim()) return Alert.alert("Title Missing", "Please enter a title for your program.");
    const newProg: TrainingProgram = {
      id: `prog_${Date.now()}`,
      title: title.trim(),
      description: description.trim() || "Custom athletic program",
      days,
    };
    saveProgram(newProg);
    Alert.alert("Program Saved!", `"${title}" has been added to your Training Vault.`);
    setTitle("");
    setDescription("");
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: colors.bgScreen }]}>
        <View style={[styles.navHeader, { borderBottomColor: colors.borderColor }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}><X size={22} color={colors.textPrimary} /></TouchableOpacity>
          <View style={styles.headerTitleWrap}>
            <Dumbbell size={18} color="#E11D48" />
            <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Create Program</Text>
          </View>
          <TouchableOpacity onPress={handleSave} style={styles.saveHeaderBtn}>
            <Check size={16} color="#FFFFFF" strokeWidth={3} />
            <Text style={styles.saveHeaderText}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.scrollInner} keyboardShouldPersistTaps="handled">
          <Text style={[styles.label, { color: colors.textMuted }]}>PROGRAM TITLE</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.bgCard, color: colors.textPrimary, borderColor: colors.borderColor }]}
            placeholder="e.g. 5-Day Power & Hypertrophy"
            placeholderTextColor={colors.textMuted}
            value={title}
            onChangeText={setTitle}
          />
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
              <Plus size={14} color="#E11D48" />
              <Text style={styles.addDayText}>Add Day</Text>
            </TouchableOpacity>
          </View>

          {days.map((day, dIdx) => (
            <View key={day.id} style={[styles.dayCard, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
              <View style={styles.dayCardHeader}>
                <View style={styles.dayTitleRow}>
                  <Calendar size={15} color="#E11D48" />
                  <TextInput style={[styles.dayNameInput, { color: colors.textPrimary }]} value={day.dayName} onChangeText={(val) => updateDayName(dIdx, val)} />
                </View>
                <TouchableOpacity onPress={() => removeDay(dIdx)} style={styles.iconBtn}><Trash2 size={16} color={colors.textMuted} /></TouchableOpacity>
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
                    <TouchableOpacity onPress={() => removeExercise(dIdx, eIdx)} style={styles.delExBtn}>
                      <Trash2 size={14} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              <TouchableOpacity onPress={() => addExercise(dIdx)} style={styles.addExRowBtn}>
                <Plus size={14} color="#10B981" />
                <Text style={styles.addExRowText}>Add Exercise to {day.dayName.split(":")[0]}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  navHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingTop: 50, paddingBottom: 12, borderBottomWidth: 1 },
  closeBtn: { padding: 6 },
  headerTitleWrap: { flexDirection: "row", alignItems: "center", gap: 6 },
  headerTitle: { fontSize: 16, fontWeight: "800" },
  saveHeaderBtn: { backgroundColor: "#E11D48", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, flexDirection: "row", alignItems: "center", gap: 4 },
  saveHeaderText: { color: "#FFFFFF", fontWeight: "800", fontSize: 13 },
  content: { flex: 1, padding: 16 },
  scrollInner: { paddingBottom: 60 },
  label: { fontSize: 11, fontWeight: "800", marginBottom: 6, letterSpacing: 0.5 },
  input: { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 14, fontWeight: "600" },
  textArea: { height: 60, textAlignVertical: "top" },
  daysHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 20, marginBottom: 10 },
  sectionTitle: { fontSize: 16, fontWeight: "800" },
  addDayBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, backgroundColor: "rgba(225,29,72,0.1)" },
  addDayText: { color: "#E11D48", fontSize: 12, fontWeight: "800" },
  dayCard: { borderWidth: 1, borderRadius: 14, padding: 14, marginBottom: 14 },
  dayCardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  dayTitleRow: { flexDirection: "row", alignItems: "center", gap: 6, flex: 1 },
  dayNameInput: { fontSize: 14, fontWeight: "800", flex: 1, paddingVertical: 2 },
  iconBtn: { padding: 4 },
  exerciseRow: { borderRadius: 10, padding: 10, marginBottom: 8 },
  exerciseInput: { fontSize: 13, fontWeight: "700", marginBottom: 8 },
  exControlsRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  metricInputWrap: { flex: 1, alignItems: "center" },
  metricLabel: { fontSize: 9, fontWeight: "700", marginBottom: 2 },
  metricInput: { borderWidth: 1, borderColor: "rgba(150,150,150,0.3)", borderRadius: 6, width: "100%", textAlign: "center", paddingVertical: 3, fontSize: 12, fontWeight: "800" },
  delExBtn: { padding: 6, marginLeft: 2 },
  addExRowBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4, paddingVertical: 8, marginTop: 4 },
  addExRowText: { color: "#10B981", fontSize: 12, fontWeight: "800" },
});
