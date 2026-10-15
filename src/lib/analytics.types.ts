/**
 * Every analytics event the app may send, with the exact properties each event
 * carries. Both the native (Firebase) and the web (no-op) implementation share
 * these types, so call sites are checked against a single contract.
 *
 * Privacy by design: no event ever carries names, ids or the words themselves.
 */
export type AnalyticsEventParams = {
  game_setup_started: undefined;
  game_started: {
    player_count: number;
    team_count: number;
    turn_seconds: number;
    words_per_player: number;
  };
  word_rolled_random: undefined;
  turn_started: {
    round_number: number;
  };
  guess_action: {
    action_type: 'correct' | 'pass';
    round_number: number;
    time_remaining_seconds: number;
  };
  turn_ended: {
    reason: 'time_up' | 'manual_stop';
    correct_count_this_turn: number;
    pass_count_this_turn: number;
  };
  round_completed: {
    round_number: number;
    duration_seconds: number;
  };
  game_completed: {
    total_rounds_played: number;
    winning_score: number;
    is_draw: boolean;
  };
  settings_changed:
    | { setting: 'sound_enabled'; enabled: boolean }
    | { setting: 'volume'; volume: number }
    | { setting: 'sound_muted'; sound: string; muted: boolean }
    | { setting: 'haptics_enabled'; enabled: boolean };
  how_to_play_opened: undefined;
  analytics_test: { source: 'settings_button' };
};

export type AnalyticsEvent = keyof AnalyticsEventParams;

/** Events without properties may be logged without a second argument. */
export type LogAnalyticsEventArgs<E extends AnalyticsEvent> = AnalyticsEventParams[E] extends undefined
  ? []
  : [params: AnalyticsEventParams[E]];
