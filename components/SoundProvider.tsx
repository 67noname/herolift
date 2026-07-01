'use client';

import { useEffect, useRef } from 'react';

type SoundMode = 'on' | 'off';

const SOUND_KEY = 'soundMode';

export default function SoundProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const audioContextRef = useRef<AudioContext | null>(null);

  const getSoundMode = (): SoundMode => {
    if (typeof window === 'undefined') return 'on';

    const saved = localStorage.getItem(SOUND_KEY);

    if (saved === 'off') return 'off';

    return 'on';
  };

  const playClickSound = () => {
    if (getSoundMode() === 'off') return;

    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as typeof window & {
          webkitAudioContext?: typeof AudioContext;
        }).webkitAudioContext;

      if (!AudioContextClass) return;

      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContextClass();
      }

      const audioContext = audioContextRef.current;

      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }

      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(620, audioContext.currentTime);

      gain.gain.setValueAtTime(0, audioContext.currentTime);
      gain.gain.linearRampToValueAtTime(0.06, audioContext.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        audioContext.currentTime + 0.09
      );

      oscillator.connect(gain);
      gain.connect(audioContext.destination);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch {
      // звук просто не проиграется, приложение не сломается
    }
  };

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;

      if (!target) return;

      const clickable = target.closest(
        'button, a, [role="button"], input[type="button"], input[type="submit"]'
      ) as HTMLElement | null;

      if (!clickable) return;

      if (
        clickable.hasAttribute('disabled') ||
        clickable.getAttribute('aria-disabled') === 'true'
      ) {
        return;
      }

      playClickSound();
    };

    document.addEventListener('click', handleClick, true);

    return () => {
      document.removeEventListener('click', handleClick, true);
    };
  }, []);

  return <>{children}</>;
}
