import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import type { AudioPlayer } from 'expo-audio';
import { setHapticsEnabled } from '@/lib/haptics';
import type { SoundKey } from './sounds';
import { SOUNDS } from './sounds';

const STORAGE_KEY = '@sla-bakken/feedback';

/**
 * Per geluid een vaste kleine pool spelers, allemaal al vanaf het starten
 * geladen. Eén speler kan maar één geluid tegelijk afspelen; bij snel achter
 * elkaar drukken wordt per tik een volgende speler uit de pool gepakt
 * (round-robin), zodat twee tikken vlak na elkaar elk een eigen speler krijgen
 * en allebei hoorbaar zijn. Spelers worden niet op het laatste moment aangemaakt:
 * een nieuw gemaakte speler heeft zijn buffer dan nog niet geladen en het eerste
 * `play()` zou stilletjes niets doen.
 */
const MAX_PLAYERS_PER_SOUND = 3;

export type FeedbackSettings = {
  /** Schakelaar voor alle geluiden. */
  soundEnabled: boolean;
  /** 0 .. 1 */
  volume: number;
  /** Per geluid uit te zetten, onafhankelijk van de schakelaar bovenin. */
  muted: Partial<Record<SoundKey, boolean>>;
  hapticsEnabled: boolean;
};

const DEFAULTS: FeedbackSettings = {
  soundEnabled: true,
  volume: 1,
  muted: {},
  hapticsEnabled: true,
};

type FeedbackContextValue = {
  settings: FeedbackSettings;
  /**
   * Speelt een geluid af als het aan staat en niet individueel uitgezet is.
   * `volumeRatio` schaalt het ingestelde volume voor deze ene opdracht
   * (bijv. 0.4 voor een zachte tik boven de 10 seconden).
   */
  play: (key: SoundKey, volumeRatio?: number) => void;
  /**
   * Start (of hervat) een loopend geluid. Bij elke aanroep wordt het volume
   * bijgesteld op `settings.volume * volumeRatio`, zodat je het lineair kunt
   * laten oplopen. Gebruik `stopLoop` om het weer te stoppen.
   */
  playLoop: (key: SoundKey, volumeRatio?: number) => void;
  /** Stopt een met `playLoop` gestart geluid. */
  stopLoop: (key: SoundKey) => void;
  /** Speelt een geluid af ongeacht de schakelaars — bedoeld als testknopje. */
  preview: (key: SoundKey) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setVolume: (volume: number) => void;
  toggleMuted: (key: SoundKey) => void;
  setHaptics: (enabled: boolean) => void;
};

const FeedbackContext = createContext<FeedbackContextValue | null>(null);

function mergeSettings(raw: string | null): FeedbackSettings {
  if (!raw) return DEFAULTS;
  try {
    const parsed = JSON.parse(raw) as Partial<FeedbackSettings>;
    return {
      soundEnabled: parsed.soundEnabled ?? DEFAULTS.soundEnabled,
      volume: typeof parsed.volume === 'number' ? Math.max(0, Math.min(1, parsed.volume)) : DEFAULTS.volume,
      muted: parsed.muted ?? {},
      hapticsEnabled: parsed.hapticsEnabled ?? DEFAULTS.hapticsEnabled,
    };
  } catch {
    return DEFAULTS;
  }
}

function makePlayer(source: number, volume: number): AudioPlayer | null {
  try {
    const player = createAudioPlayer(source);
    player.volume = volume;
    return player;
  } catch {
    // Een kapot of niet-ondersteund bestand mag de app niet laten crashen.
    return null;
  }
}

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<FeedbackSettings>(DEFAULTS);
  const pools = useRef<Partial<Record<SoundKey, AudioPlayer[]>>>({});
  const cursors = useRef<Partial<Record<SoundKey, number>>>({});
  /** Aparte, langdurige spelers voor `playLoop`, los van de eenmalige pool. */
  const loopPlayers = useRef<Partial<Record<SoundKey, AudioPlayer>>>({});
  const loopActive = useRef<Partial<Record<SoundKey, boolean>>>({});

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => setSettings(mergeSettings(raw)))
      .catch(() => {});
    // 'mixWithOthers' laat korte effectjes door elkaar klinken (geluid is een
    // bijklank, geen exclusief kanaal): meerdere spelers die tegelijk spelen
    // worden door elkaar gemengd in plaats van elkaar te onderbreken.
    setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: false, interruptionMode: 'mixWithOthers' }).catch(() => {});

    // Elke sound krijgt meteen zijn volledige pool, allemaal klaar met geladen
    // buffer, zodat ook snel op elkaar drukken op een vrije speler terechtkomt.
    for (const sound of SOUNDS) {
      const players: AudioPlayer[] = [];
      for (let i = 0; i < MAX_PLAYERS_PER_SOUND; i += 1) {
        const player = makePlayer(sound.source, DEFAULTS.volume);
        if (player) players.push(player);
      }
      if (players.length > 0) pools.current[sound.key] = players;

      // Aparte loopende speler, ook al klaar met geladen buffer, zodat het
      // aftellen meteen hoorbaar is zodra de laatste tien seconden ingaan.
      const loopPlayer = makePlayer(sound.source, 0);
      if (loopPlayer) {
        try {
          loopPlayer.loop = true;
        } catch {
          // loop niet ondersteund: dan speelt het geluid gewoon één keer
        }
        loopPlayers.current[sound.key] = loopPlayer;
      }
    }
    return () => {
      for (const sound of SOUNDS) {
        for (const player of pools.current[sound.key] ?? []) {
          try {
            player.remove();
          } catch {
            // speler is al weg
          }
        }
        const loopPlayer = loopPlayers.current[sound.key];
        if (loopPlayer) {
          try {
            loopPlayer.remove();
          } catch {
            // speler is al weg
          }
        }
      }
      pools.current = {};
      cursors.current = {};
      loopPlayers.current = {};
      loopActive.current = {};
    };
  }, []);

  const persist = useCallback((next: FeedbackSettings) => {
    setSettings(next);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  useEffect(() => {
    setHapticsEnabled(settings.hapticsEnabled);
  }, [settings.hapticsEnabled]);

  /**
   * Pakt de volgende speler in de pool (round-robin). We vertrouwen hier niet op
   * `player.playing`: die is op native async en kan na een `play()` nog momenten
   * `false` zijn, waardoor bij snel drukken dezelfde speler gepakt en opnieuw
   * gestart zou worden. Door rond te draaien krijgt elke druk een eigen speler.
   */
  const acquire = useCallback((key: SoundKey): AudioPlayer | null => {
    const pool = pools.current[key] ?? [];
    if (pool.length === 0) return null;
    const cursor = (cursors.current[key] ?? -1) + 1;
    cursors.current[key] = cursor;
    return pool[cursor % pool.length];
  }, []);

  const trigger = useCallback(
    (key: SoundKey, force: boolean, volumeRatio = 1) => {
      if (!force && !settings.soundEnabled) return;
      if (!force && settings.muted[key]) return;
      const player = acquire(key);
      if (!player) return;
      try {
        player.volume = settings.volume * volumeRatio;
        // seekTo is asynchroon: pas afspelen ná de seek, anders start een
        // herbruikte speler vanaf de vorige eindpositie en klinkt er niks.
        player
          .seekTo(0)
          .then(() => {
            try {
              player.play();
            } catch {
              // stille failure: geluid is nice-to-have
            }
          })
          .catch(() => {});
      } catch {
        // stille failure: geluid is nice-to-have
      }
    },
    [settings, acquire]
  );

  const getLoopPlayer = useCallback((key: SoundKey): AudioPlayer | null => {
    const existing = loopPlayers.current[key];
    if (existing) return existing;
    const meta = SOUNDS.find((sound) => sound.key === key);
    if (!meta) return null;
    const player = makePlayer(meta.source, 0);
    if (!player) return null;
    try {
      player.loop = true;
    } catch {
      // loop niet ondersteund: dan speelt het geluid gewoon één keer
    }
    loopPlayers.current[key] = player;
    return player;
  }, []);

  /**
   * Houdt één loopende speler aan de gang en stelt zijn volume bij. De speler
   * wordt alleen écht gestart bij de eerste aanroep; daarna volstaat volume
   * zetten, zodat het geluid niet telkens opnieuw begint (geen losse tikjes).
   */
  const playLoop = useCallback(
    (key: SoundKey, volumeRatio = 1) => {
      const player = getLoopPlayer(key);
      if (!player) return;
      const audible = settings.soundEnabled && !settings.muted[key];
      try {
        player.volume = Math.max(0, Math.min(1, settings.volume * volumeRatio)) * (audible ? 1 : 0);
      } catch {
        return;
      }
      if (!audible) return;
      if (!loopActive.current[key]) {
        loopActive.current[key] = true;
        player
          .seekTo(0)
          .then(() => {
            try {
              player.play();
            } catch {
              loopActive.current[key] = false;
            }
          })
          .catch(() => {
            loopActive.current[key] = false;
          });
      }
    },
    [settings, getLoopPlayer]
  );

  const stopLoop = useCallback((key: SoundKey) => {
    const player = loopPlayers.current[key];
    loopActive.current[key] = false;
    if (!player) return;
    try {
      player.pause();
      player.seekTo(0).catch(() => {});
    } catch {
      // stille failure: geluid is nice-to-have
    }
  }, []);

  const value = useMemo<FeedbackContextValue>(
    () => ({
      settings,
      play: (key, volumeRatio) => trigger(key, false, volumeRatio),
      playLoop,
      stopLoop,
      preview: (key) => trigger(key, true),
      setSoundEnabled: (soundEnabled) => persist({ ...settings, soundEnabled }),
      setVolume: (volume) => persist({ ...settings, volume: Math.max(0, Math.min(1, volume)) }),
      toggleMuted: (key) => persist({ ...settings, muted: { ...settings.muted, [key]: !settings.muted[key] } }),
      setHaptics: (hapticsEnabled) => persist({ ...settings, hapticsEnabled }),
    }),
    [settings, persist, trigger, playLoop, stopLoop]
  );

  return <FeedbackContext.Provider value={value}>{children}</FeedbackContext.Provider>;
}

export function useFeedback(): FeedbackContextValue {
  const value = useContext(FeedbackContext);
  if (!value) throw new Error('useFeedback must be used inside <FeedbackProvider>');
  return value;
}