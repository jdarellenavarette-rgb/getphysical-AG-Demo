import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { BackHandler, StyleSheet } from "react-native";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  type BottomSheetBackdropProps,
  type BottomSheetFooterProps,
} from "@gorhom/bottom-sheet";
import { RADII } from "sodia-core";
import { useColors } from "../../theme/theme";

export interface AppBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  /** e.g. ["55%", "92%"]. Omit to size to content. */
  snapPoints?: readonly (string | number)[];
  /** Initial snap index (default 0). */
  initialIndex?: number;
  /** When true: no pan-to-close, backdrop taps & Android back are ignored (e.g. payment in flight). */
  locked?: boolean;
  /** Accessible name announced when the sheet opens. */
  accessibilityLabel: string;
  /** Sticky footer (wrap content in <BottomSheetFooter {...props}>). */
  footer?: (props: BottomSheetFooterProps) => React.ReactNode;
  children: React.ReactNode;
}

/**
 * Canonical sheet for facility / coach / challenge CTAs and comments
 * (AGENTS.md §5 Actionable-Object Principle). Backed by @gorhom/bottom-sheet so
 * drag, snap and backdrop animations run on the UI thread via Reanimated.
 */
export function AppBottomSheet({
  visible,
  onClose,
  snapPoints,
  initialIndex = 0,
  locked = false,
  accessibilityLabel,
  footer,
  children,
}: AppBottomSheetProps) {
  const ref = useRef<BottomSheetModal>(null);
  const colors = useColors();
  const points = useMemo(() => (snapPoints ? [...snapPoints] : undefined), [snapPoints]);
  const lockedRef = useRef(locked);
  lockedRef.current = locked;

  useEffect(() => {
    if (visible) ref.current?.present();
    else ref.current?.dismiss();
  }, [visible]);

  // Android hardware back closes the sheet (unless locked) before anything underneath.
  useEffect(() => {
    if (!visible) return undefined;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (!lockedRef.current) onClose();
      return true;
    });
    return () => sub.remove();
  }, [visible, onClose]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.6}
        pressBehavior={locked ? "none" : "close"}
      />
    ),
    [locked]
  );

  return (
    <BottomSheetModal
      ref={ref}
      index={initialIndex}
      snapPoints={points}
      enableDynamicSizing={!points}
      enablePanDownToClose={!locked}
      enableHandlePanningGesture={!locked}
      enableContentPanningGesture={!locked}
      backdropComponent={renderBackdrop}
      footerComponent={footer}
      onDismiss={onClose}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
      accessibilityLabel={accessibilityLabel}
      backgroundStyle={[styles.background, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}
      handleIndicatorStyle={{ backgroundColor: colors.textMuted, width: 40 }}
    >
      {children}
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  background: { borderTopLeftRadius: RADII.xl, borderTopRightRadius: RADII.xl, borderWidth: StyleSheet.hairlineWidth },
});
