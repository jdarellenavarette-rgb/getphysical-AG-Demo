import { useMemo, useRef } from "react";
import { Animated, PanResponder, type GestureResponderHandlers } from "react-native";

/** How far (pt) or how fast a drag must go before it counts as "close this". */
const DISMISS_DISTANCE = 110;
const DISMISS_VELOCITY = 0.9;

interface SwipeDown {
  /** Spread on the sheet's grab area (the handle and header), not on scrolling content. */
  panHandlers: GestureResponderHandlers;
  /** Apply to the sheet container so it follows the finger. */
  sheetStyle: { transform: { translateY: Animated.Value }[] };
}

/**
 * Drag a bottom sheet down to close it. The sheet follows the finger and
 * springs back if the drag was too short.
 */
export function useSwipeDownToClose(onClose: () => void): SwipeDown {
  const translateY = useRef(new Animated.Value(0)).current;
  const close = useRef(onClose);
  close.current = onClose;

  const responder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_e, g) => g.dy > 6 && Math.abs(g.dy) > Math.abs(g.dx),
        onPanResponderMove: (_e, g) => translateY.setValue(Math.max(0, g.dy)),
        onPanResponderRelease: (_e, g) => {
          if (g.dy > DISMISS_DISTANCE || g.vy > DISMISS_VELOCITY) {
            close.current();
            // Reset after the modal has gone so the next open starts in place.
            setTimeout(() => translateY.setValue(0), 250);
          } else {
            Animated.spring(translateY, { toValue: 0, useNativeDriver: true, bounciness: 4 }).start();
          }
        },
        onPanResponderTerminate: () => {
          Animated.spring(translateY, { toValue: 0, useNativeDriver: true }).start();
        },
      }),
    [translateY],
  );

  return { panHandlers: responder.panHandlers, sheetStyle: { transform: [{ translateY }] } };
}

/** Width of the strip along the left edge where a back-swipe may begin. */
const EDGE_WIDTH = 28;
const BACK_DISTANCE = 70;

/**
 * Swipe right from the left edge to go back, as on any iOS screen. Spread the
 * returned handlers on a full-screen page's root view.
 */
export function useEdgeSwipeBack(onBack: () => void): GestureResponderHandlers {
  const back = useRef(onBack);
  back.current = onBack;

  return useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponderCapture: (_e, g) =>
          g.x0 <= EDGE_WIDTH && g.dx > 12 && Math.abs(g.dx) > Math.abs(g.dy) * 1.5,
        onPanResponderRelease: (_e, g) => {
          if (g.dx > BACK_DISTANCE || g.vx > DISMISS_VELOCITY) back.current();
        },
      }).panHandlers,
    [],
  );
}

/** Swipe down anywhere to close: used by full-bleed viewers such as stories and photos. */
export function useSwipeDownAnywhere(onClose: () => void): GestureResponderHandlers {
  const close = useRef(onClose);
  close.current = onClose;

  return useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponderCapture: (_e, g) => g.dy > 14 && Math.abs(g.dy) > Math.abs(g.dx) * 1.5,
        onPanResponderRelease: (_e, g) => {
          if (g.dy > DISMISS_DISTANCE || g.vy > DISMISS_VELOCITY) close.current();
        },
      }).panHandlers,
    [],
  );
}
