import { useEffect } from 'react';

export function useKeyboardShortcut(key: string, callback: () => void, ctrlOrCmd = false) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const modifierMatch = ctrlOrCmd ? (event.ctrlKey || event.metaKey) : true;
      if (modifierMatch && event.key.toLowerCase() === key.toLowerCase()) {
        event.preventDefault();
        callback();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [key, callback, ctrlOrCmd]);
}
