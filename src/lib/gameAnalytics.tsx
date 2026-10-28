import { useEffect, useRef } from 'react';
import { useGameContext } from '@/game/GameProvider';
import type { GameState } from '@/game/types';
import { logAnalyticsEvent } from './analytics';

function totalPlayers(state: GameState): number {
  return state.teams.reduce((sum, team) => sum + team.players.length, 0);
}

/**
 * Vertaalt fase-overgangen in de reducer naar analytics-events.
 *
 * De reducer blijft puur en weet niets van analytics; deze bridge kijkt naar de
 * vorige en huidige state en stuurt op basis van de overgang de juiste events.
 * UI-events die niet uit state volgen (wizard openen, woord rollen,
 * instellingen, uitleg) worden direct in het scherm zelf gelogd.
 */
export function GameAnalyticsBridge() {
  const { state } = useGameContext();
  const previous = useRef<GameState | null>(null);
  /** Wanneer de huidige ronde begon, om de rondeduur te meten. */
  const roundStartedAt = useRef<number | null>(null);

  useEffect(() => {
    const prev = previous.current;
    previous.current = state;

    if (state.phase === 'handoff' && (prev == null || prev.phase === 'roundIntro')) {
      roundStartedAt.current = Date.now();
    }

    if (prev == null) return;

    // Spel begint echt zodra alle woorden zijn ingevuld (wordEntry -> roundIntro).
    if (prev.phase === 'wordEntry' && state.phase === 'roundIntro') {
      logAnalyticsEvent('game_started', {
        player_count: totalPlayers(state),
        team_count: state.teams.length,
        turn_seconds: state.turnSeconds,
        words_per_player: state.wordsPerPlayer,
      });
    }

    // Nieuwe beurt: handoff -> playing.
    if (state.phase === 'playing' && prev.phase !== 'playing') {
      logAnalyticsEvent('turn_started', { round_number: state.currentRound });
    }

    // Een goed geraden woord telt totalWords op.
    if (state.totalWords > prev.totalWords) {
      logAnalyticsEvent('guess_action', {
        action_type: 'correct',
        round_number: state.currentRound,
        time_remaining_seconds: prev.timerRemaining,
      });
    }

    // Een pass telt turnPasses op en laat totalWords gelijk.
    if (state.turnPasses > prev.turnPasses) {
      logAnalyticsEvent('guess_action', {
        action_type: 'pass',
        round_number: state.currentRound,
        time_remaining_seconds: prev.timerRemaining,
      });
    }

    // Beurt stopt: playing -> handoff (nog woorden) of direct naar de ronde-uitslag.
    if (prev.phase === 'playing' && state.phase !== 'playing') {
      const elapsed = prev.timerStartedAt != null ? (Date.now() - prev.timerStartedAt) / 1000 : 0;
      const timedOut = prev.timerStartedAt != null && elapsed >= prev.turnSeconds;
      logAnalyticsEvent('turn_ended', {
        reason: timedOut ? 'time_up' : 'manual_stop',
        correct_count_this_turn: prev.turnPoints,
        pass_count_this_turn: prev.turnPasses,
      });
    }

    // Ronde klaar: de pot is leeg en we gaan naar de tussenstand.
    if (state.phase === 'roundReview' && prev.phase !== 'roundReview') {
      const startedAt = roundStartedAt.current ?? Date.now();
      logAnalyticsEvent('round_completed', {
        round_number: state.currentRound,
        duration_seconds: Math.max(0, Math.round((Date.now() - startedAt) / 1000)),
      });
    }

    // Eindstand bereikt.
    if (state.phase === 'summary' && prev.phase !== 'summary') {
      const scores = state.teams.map((team) => state.scores[team.id] ?? 0);
      logAnalyticsEvent('game_completed', {
        total_rounds_played: state.roundResults.filter((round) => round.completed).length,
        winning_score: scores.length > 0 ? Math.max(...scores) : 0,
        is_draw: state.winners.length > 1,
      });
    }
  }, [state]);

  return null;
}
