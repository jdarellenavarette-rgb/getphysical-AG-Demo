import React, { memo, useMemo } from "react";
import { View } from "react-native";
import { encodeQr, type QrEcc } from "sodia-core";

interface QrCodeViewProps {
  value: string;
  size: number;
  ecc?: QrEcc;
  color?: string;
  background?: string;
  accessibilityLabel?: string;
}

/**
 * Renders a QR code with plain Views (no SVG, no native module). Each row is
 * drawn as runs of same-colour modules to keep the view count low.
 */
export const QrCodeView = memo(function QrCodeView({
  value,
  size,
  ecc = "M",
  color = "#09090B",
  background = "#FFFFFF",
  accessibilityLabel,
}: QrCodeViewProps) {
  const qr = useMemo(() => encodeQr(value, { ecc }), [value, ecc]);
  const quiet = 4; // quiet-zone modules required by the spec
  const modulesAcross = qr.size + quiet * 2;
  const cell = size / modulesAcross;

  const rows = useMemo(
    () =>
      qr.modules.map((row) => {
        const runs: { dark: boolean; length: number }[] = [];
        for (const dark of row) {
          const last = runs[runs.length - 1];
          if (last && last.dark === dark) last.length++;
          else runs.push({ dark, length: 1 });
        }
        return runs;
      }),
    [qr]
  );

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel ?? "QR code"}
      style={{ width: size, height: size, backgroundColor: background, padding: cell * quiet }}
    >
      {rows.map((runs, y) => (
        <View key={y} style={{ flexDirection: "row", height: cell }}>
          {runs.map((run, i) => (
            <View key={i} style={{ width: cell * run.length, height: cell, backgroundColor: run.dark ? color : background }} />
          ))}
        </View>
      ))}
    </View>
  );
});
