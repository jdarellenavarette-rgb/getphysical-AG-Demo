import React, { useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { BottomSheetScrollView, BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Controller, useForm, type Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useColors } from "../../../theme/theme";
import { AppBottomSheet } from "../../sheets/AppBottomSheet";

const num = (label: string, max: number) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .refine((v) => /^\d+(\.\d+)?$/.test(v), `${label} must be a number`)
    .refine((v) => Number(v) <= max, `${label} looks too high`);

const manualFoodSchema = z.object({
  name: z.string().trim().min(1, "Food name required").max(60, "Keep it under 60 characters"),
  calories: num("Calories", 5000),
  protein: num("Protein", 500),
  carbs: num("Carbs", 1000),
  fat: num("Fat", 500),
});
type ManualFoodForm = z.infer<typeof manualFoodSchema>;
type FieldName = keyof ManualFoodForm;

export interface ManualFoodEntry {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface ManualFoodSheetProps {
  visible: boolean;
  initialName: string;
  onClose: () => void;
  onSave: (entry: ManualFoodEntry) => void;
}

const FIELDS: readonly { name: FieldName; label: string; numeric: boolean }[] = [
  { name: "name", label: "Food", numeric: false },
  { name: "calories", label: "Calories (kcal)", numeric: true },
  { name: "protein", label: "Protein (g)", numeric: true },
  { name: "carbs", label: "Carbs (g)", numeric: true },
  { name: "fat", label: "Fat (g)", numeric: true },
];

function Field({ control, name, label, numeric }: { control: Control<ManualFoodForm>; name: FieldName; label: string; numeric: boolean }) {
  const colors = useColors();
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
          <BottomSheetTextInput
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            keyboardType={numeric ? "decimal-pad" : "default"}
            accessibilityLabel={label}
            style={[styles.input, { backgroundColor: colors.bgInput, color: colors.textPrimary, borderColor: fieldState.error ? colors.danger : colors.borderColor }]}
          />
          {fieldState.error ? <Text style={[styles.error, { color: colors.danger }]}>{fieldState.error.message}</Text> : null}
        </View>
      )}
    />
  );
}

/** `no_search_results` fallback for Food: log macros by hand (react-hook-form + zod). */
export function ManualFoodSheet({ visible, initialName, onClose, onSave }: ManualFoodSheetProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { control, handleSubmit, reset } = useForm<ManualFoodForm>({
    resolver: zodResolver(manualFoodSchema),
    mode: "onChange",
    defaultValues: { name: initialName, calories: "", protein: "", carbs: "", fat: "" },
  });

  useEffect(() => {
    if (visible) reset({ name: initialName, calories: "", protein: "", carbs: "", fat: "" });
  }, [visible, initialName, reset]);

  const submit = handleSubmit((v) =>
    onSave({ name: v.name.trim(), calories: Number(v.calories), protein: Number(v.protein), carbs: Number(v.carbs), fat: Number(v.fat) })
  );

  return (
    <AppBottomSheet visible={visible} onClose={onClose} snapPoints={["80%"]} accessibilityLabel="Add food manually">
      <BottomSheetScrollView contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + 24 }]} keyboardShouldPersistTaps="handled">
        <Text style={[styles.title, { color: colors.textPrimary }]} accessibilityRole="header">Add it manually</Text>
        {FIELDS.map((f) => (
          <Field key={f.name} control={control} name={f.name} label={f.label} numeric={f.numeric} />
        ))}
        <TouchableOpacity onPress={() => { submit().catch(() => undefined); }} style={[styles.save, { backgroundColor: colors.accent }]} accessibilityRole="button">
          <Text style={[styles.saveText, { color: colors.textOnAccent }]}>Log food</Text>
        </TouchableOpacity>
      </BottomSheetScrollView>
    </AppBottomSheet>
  );
}

const styles = StyleSheet.create({
  body: { paddingHorizontal: 20 },
  title: { fontSize: 20, fontWeight: "900", marginBottom: 12 },
  field: { marginBottom: 12 },
  label: { fontSize: 13, fontWeight: "700", marginBottom: 6 },
  input: { minHeight: 44, borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, fontSize: 15 },
  error: { fontSize: 12, marginTop: 4 },
  save: { minHeight: 52, borderRadius: 14, alignItems: "center", justifyContent: "center", marginTop: 8 },
  saveText: { fontSize: 15, fontWeight: "800" },
});
