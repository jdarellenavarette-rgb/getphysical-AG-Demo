'use client';

import { useEffect, useRef } from 'react';

function isTypingTarget(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  return el.isContentEditable || el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT';
}

interface KeyboardHandlers {
  onNext: () => void;
  onPrev: () => void;
  onFocusSearch: () => void;
  onFocusReply: () => void;
}

/**
 * Intercom/Front-style shortcuts: j / k next & previous thread, / focus search,
 * r focus reply. Ignored while typing or while a modal dialog is open.
 */
export function useInboxKeyboard(handlers: KeyboardHandlers) {
  const ref = useRef(handlers);
  ref.current = handlers;

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
      if (isTypingTarget(e.target)) return;
      if (document.querySelector('[aria-modal="true"]')) return;
      switch (e.key) {
        case 'j':
          e.preventDefault();
          ref.current.onNext();
          break;
        case 'k':
          e.preventDefault();
          ref.current.onPrev();
          break;
        case '/':
          e.preventDefault();
          ref.current.onFocusSearch();
          break;
        case 'r':
          e.preventDefault();
          ref.current.onFocusReply();
          break;
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);
}
