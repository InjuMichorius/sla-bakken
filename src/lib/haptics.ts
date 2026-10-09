import * as Haptics from 'expo-haptics';

/**
 * Staatsvrij trilmodule: de schakelaar in de instellingen zet dit vlaggetje,
 * zodat er niet overal `haptics`-aanroepen doorheen gefilterd hoeft te worden.
 */
let enabled = true;

export function setHapticsEnabled(value: boolean) {
  enabled = value;
}

function safe(run: () => Promise<void>) {
  if (!enabled) return;
  run().catch(() => {});
}

export const haptics = {
  light: () => safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),
  medium: () => safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)),
  heavy: () => safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)),
  success: () => safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
  warning: () => safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)),
  selection: () => safe(() => Haptics.selectionAsync()),
  /** Een paar medium stoten achter elkaar — opvallender dan één enkele tik. */
  sustained: () =>
    safe(async () => {
      for (let i = 0; i < 3; i += 1) {
        if (!enabled) return;
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
        await new Promise<void>((resolve) => setTimeout(resolve, 160));
      }
    }),
  /** Heftigste tril bij tijd op — zware impact met korte herhalingen. */
  timeUp: () =>
    safe(async () => {
      for (let i = 0; i < 4; i += 1) {
        if (!enabled) return;
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
        await new Promise<void>((resolve) => setTimeout(resolve, 100));
      }
    }),
};
