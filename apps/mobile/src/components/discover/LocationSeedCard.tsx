import React, { useState } from "react";
import { ActivityIndicator, Linking, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MapPinOff, Search } from "lucide-react-native";
import { MIN_TOUCH_TARGET, RADII, SPACING, TYPE_SCALE } from "sodia-core";
import { useColors } from "../../theme/theme";
import { geocodeLocationSeed, locationSeedSchema, type UserCoordinates } from "../../services/locationService";

const formSchema = z.object({ seed: locationSeedSchema });
type SeedForm = z.infer<typeof formSchema>;

interface LocationSeedCardProps {
  onSeed: (coords: UserCoordinates) => void;
  /** Overlay mode renders over the (scrimmed) map; inline mode sits in the list header. */
  variant: "overlay" | "inline";
}

/** Spec 3.6 Location Denied Fallback: enable location or seed by City / ZIP. */
export function LocationSeedCard({ onSeed, variant }: LocationSeedCardProps) {
  const colors = useColors();
  const [busy, setBusy] = useState(false);
  const { control, handleSubmit, setError, formState } = useForm<SeedForm>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: { seed: "" },
  });
  const fieldError = formState.errors.seed?.message;

  const submit = handleSubmit(async ({ seed }) => {
    setBusy(true);
    const coords = await geocodeLocationSeed(seed);
    setBusy(false);
    if (coords) onSeed(coords);
    else setError("seed", { message: `We couldn't find "${seed}". Try a nearby city.` });
  });

  return (
    <View style={[styles.card, variant === "overlay" && styles.overlayCard, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
      <View style={styles.headRow}>
        <MapPinOff size={22} color={colors.warning} />
        <Text style={[styles.title, { color: colors.textPrimary }]}>We need your location to find nearby clubs and challenges</Text>
      </View>
      <TouchableOpacity
        onPress={() => Linking.openSettings().catch(() => undefined)}
        style={[styles.primary, { backgroundColor: colors.accent }]}
        accessibilityRole="button"
      >
        <Text style={[styles.primaryText, { color: colors.textOnAccent }]}>Enable Location Services</Text>
      </TouchableOpacity>
      <Text style={[styles.or, { color: colors.textMuted }]}>or search by City or ZIP code</Text>
      <View style={styles.inputRow}>
        <Controller
          control={control}
          name="seed"
          render={({ field }) => (
            <TextInput
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              onSubmitEditing={() => { submit().catch(() => undefined); }}
              returnKeyType="search"
              placeholder="e.g. Makati or 1634"
              placeholderTextColor={colors.textMuted}
              accessibilityLabel="City or ZIP code"
              style={[styles.input, { backgroundColor: colors.bgInput, color: colors.textPrimary, borderColor: fieldError ? colors.danger : colors.borderColor }]}
            />
          )}
        />
        <TouchableOpacity
          onPress={() => { submit().catch(() => undefined); }}
          disabled={busy}
          style={[styles.go, { backgroundColor: colors.bgCardTertiary, borderColor: colors.borderColor }]}
          accessibilityRole="button"
          accessibilityLabel="Search this location"
        >
          {busy ? <ActivityIndicator color={colors.textPrimary} /> : <Search size={18} color={colors.textPrimary} />}
        </TouchableOpacity>
      </View>
      {fieldError ? (
        <Text style={[styles.error, { color: colors.danger }]} accessibilityLiveRegion="polite">
          {fieldError}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: RADII.xl, borderWidth: 1, padding: SPACING.lg, marginHorizontal: SPACING.lg, marginBottom: SPACING.md },
  overlayCard: { shadowColor: "#000000", shadowOpacity: 0.25, shadowRadius: 20, elevation: 12 },
  headRow: { flexDirection: "row", gap: SPACING.md, alignItems: "center" },
  title: { ...TYPE_SCALE.body, fontWeight: "700", flex: 1 },
  primary: { minHeight: MIN_TOUCH_TARGET, borderRadius: RADII.md, alignItems: "center", justifyContent: "center", marginTop: SPACING.md },
  primaryText: { ...TYPE_SCALE.body, fontWeight: "800" },
  or: { ...TYPE_SCALE.footnote, textAlign: "center", marginVertical: SPACING.sm },
  inputRow: { flexDirection: "row", gap: SPACING.sm },
  input: { flex: 1, minHeight: MIN_TOUCH_TARGET, borderRadius: RADII.md, borderWidth: 1, paddingHorizontal: SPACING.md, fontSize: 14 },
  go: { width: MIN_TOUCH_TARGET, height: MIN_TOUCH_TARGET, borderRadius: RADII.md, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  error: { ...TYPE_SCALE.footnote, marginTop: SPACING.xs },
});
