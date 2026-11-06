import React from "react";
import { Modal, type ModalProps } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ToastHost } from "../../feedback/ToastHost";

/**
 * Full-screen RN Modal that keeps toasts and gestures working inside it.
 * Native modals render in their own window, so the root ToastHost and
 * GestureHandlerRootView are not visible / active from within.
 */
export function AppModal({ children, ...rest }: ModalProps) {
  return (
    <Modal {...rest}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        {children}
        <ToastHost />
      </GestureHandlerRootView>
    </Modal>
  );
}
