import assert from 'node:assert/strict';
import { allWords, gameReducer, isSetupValid, nextPoint, rankStandings, teamScoresOf } from '../src/game/reducer.ts';
import { pickRandomWord } from '../src/game/randomWord.ts';
import { WORD_BANK } from '../src/game/wordBank.ts';
import type { GameState } from '../src/game/types.ts';
import { initialGameState } from '../src/game/types.ts';

let failures = 0;
function check(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  ok  ${name}`);
  } catch (error) {
    failures += 1;
    console.log(`FAIL  ${name}\n      ${error instanceof Error ? error.message.split('\n').slice(0, 6).join('\n      ') : String(error)}`);
  }
}

function seededSetup() {
  let state = gameReducer(initialGameState, { type: 'ADD_TEAM', name: 'Team A' });
  state = gameReducer(state, { type: 'ADD_TEAM', name: 'Team B' });
  for (const teamId of state.teams.map((t) => t.id)) {
    state = gameReducer(state, { type: 'ADD_PLAYER', teamId, name: 'A-speler' });
    state = gameReducer(state, { type: 'ADD_PLAYER', teamId, name: 'B-speler' });
  }
  state = gameReducer(state, { type: 'ADD_TEAM', name: 'Team C' });
  const c = state.teams[2].id;
  state = gameReducer(state, { type: 'ADD_PLAYER', teamId: c, name: 'C1' });
  state = gameReducer(state, { type: 'ADD_PLAYER', teamId: c, name: 'C2' });
  state = gameReducer(state, { type: 'ADD_PLAYER', teamId: c, name: 'C3' });
  return state;
}

function withWords(state: ReturnType<typeof seededSetup>) {
  let next = gameReducer(state, { type: 'START_WORD_ENTRY' });
  const roster = next.teams.flatMap((t) => t.players.map((p) => ({ teamId: t.id, playerId: p.id })));
  roster.forEach((r, i) => {
    next = gameReducer(next, { type: 'SET_PLAYER_WORDS', teamId: r.teamId, playerId: r.playerId, words: [`w${i}a`, `w${i}b`] });
  });
  return next;
}

/** One player guesses every word that is still in the pot. */
function guessWholePot(state: GameState) {
  const remaining = state.pot.length;
  let next = gameReducer(state, { type: 'START_TURN' });
  for (let i = 0; i < remaining; i++) next = gameReducer(next, { type: 'CORRECT_GUESS' });
  return next;
}

/** Closes the current round, shows the rules screen and starts the next round. */
function toRound(state: GameState, round: number) {
  let next = gameReducer(state, { type: 'END_ROUND' });
  next = gameReducer(next, { type: 'NEXT_ROUND' });
  if (round <= 3) next = gameReducer(next, { type: 'START_ROUND', round });
  return next;
}

console.log('\nsetup');
check('start met lege teams is ongeldig', () => {
  assert.equal(isSetupValid(initialGameState), false);
});
check('1 team is ongeldig', () => {
  let s = gameReducer(initialGameState, { type: 'ADD_TEAM', name: 'A' });
  s = gameReducer(s, { type: 'ADD_PLAYER', teamId: s.teams[0].id, name: 'x' });
  s = gameReducer(s, { type: 'ADD_PLAYER', teamId: s.teams[0].id, name: 'y' });
  assert.equal(isSetupValid(s), false);
});
check('2 teams met 1 speler is ongeldig', () => {
  let s = seededSetup();
  s = gameReducer(s, { type: 'REMOVE_PLAYER', teamId: s.teams[0].id, playerId: s.teams[0].players[1].id });
  assert.equal(isSetupValid(s), false);
});
check('2 teams met 2 spelers is geldig', () => {
  let s = gameReducer(initialGameState, { type: 'ADD_TEAM', name: 'A' });
  s = gameReducer(s, { type: 'ADD_TEAM', name: 'B' });
  s.teams.forEach((t) => {
    s = gameReducer(s, { type: 'ADD_PLAYER', teamId: t.id, name: 'p1' });
    s = gameReducer(s, { type: 'ADD_PLAYER', teamId: t.id, name: 'p2' });
  });
  assert.equal(isSetupValid(s), true);
});
check('START_WORD_ENTRY genegeert ongeldige setup', () => {
  const s = gameReducer(initialGameState, { type: 'START_WORD_ENTRY' });
  assert.equal(s.phase, 'setup');
});
check('timer wordt geklemd', () => {
  assert.equal(gameReducer(initialGameState, { type: 'SET_TURN_SECONDS', seconds: 5 }).turnSeconds, 15);
  assert.equal(gameReducer(initialGameState, { type: 'SET_TURN_SECONDS', seconds: 9999 }).turnSeconds, 300);
  assert.equal(gameReducer(initialGameState, { type: 'SET_TURN_SECONDS', seconds: 45 }).turnSeconds, 45);
});
check('team verwijderen wist de score', () => {
  let s = seededSetup();
  const id = s.teams[2].id;
  s = gameReducer(s, { type: 'REMOVE_TEAM', teamId: id });
  assert.equal(s.teams.length, 2);
  assert.equal(id in s.scores, false);
});

check('ENSURE_DEFAULT_TEAMS vult twee teams met standaardnamen', () => {
  const s = gameReducer(initialGameState, { type: 'ENSURE_DEFAULT_TEAMS' });
  assert.deepEqual(s.teams.map((t) => t.name), ['Team 1', 'Team 2']);
  assert.deepEqual(s.teams.map((t) => t.players.map((p) => p.name)), [
    ['Speler 1', 'Speler 2'],
    ['Speler 3', 'Speler 4'],
  ]);
  assert.equal(isSetupValid(s), true, 'de wizard start direct in een geldige opstelling');
  assert.deepEqual(Object.values(s.scores), [0, 0]);
});
check('ENSURE_DEFAULT_TEAMS raakt bestaande teams niet', () => {
  const once = gameReducer(initialGameState, { type: 'ENSURE_DEFAULT_TEAMS' });
  const twice = gameReducer(once, { type: 'ENSURE_DEFAULT_TEAMS' });
  assert.equal(twice, once, 'tweede aanroep doet niets');
});
check('team- en spelernamen zijn aan te passen', () => {
  let s = gameReducer(initialGameState, { type: 'ENSURE_DEFAULT_TEAMS' });
  const teamId = s.teams[0].id;
  const playerId = s.teams[0].players[0].id;
  s = gameReducer(s, { type: 'RENAME_TEAM', teamId, name: 'De Boksers' });
  s = gameReducer(s, { type: 'RENAME_PLAYER', teamId, playerId, name: 'Sanne' });
  assert.equal(s.teams[0].name, 'De Boksers');
  assert.equal(s.teams[0].players[0].name, 'Sanne');
  const same = gameReducer(s, { type: 'RENAME_PLAYER', teamId, playerId, name: '   ' });
  assert.equal(same.teams[0].players[0].name, 'Sanne', 'lege naam wordt genegeerd');
});
check('woorden per speler is instelbaar en begrensd', () => {
  assert.equal(gameReducer(initialGameState, { type: 'SET_WORDS_PER_PLAYER', count: 3 }).wordsPerPlayer, 3);
  assert.equal(gameReducer(initialGameState, { type: 'SET_WORDS_PER_PLAYER', count: 0 }).wordsPerPlayer, 1);
  assert.equal(gameReducer(initialGameState, { type: 'SET_WORDS_PER_PLAYER', count: 99 }).wordsPerPlayer, 10);
});
check('instelling bepaalt hoeveel woorden worden bewaard', () => {
  let s = gameReducer(gameReducer(initialGameState, { type: 'ENSURE_DEFAULT_TEAMS' }), { type: 'SET_WORDS_PER_PLAYER', count: 2 });
  s = gameReducer(s, { type: 'START_WORD_ENTRY' });
  const t = s.teams[0];
  s = gameReducer(s, { type: 'SET_PLAYER_WORDS', teamId: t.id, playerId: t.players[0].id, words: ['a', 'b', 'c', 'd'] });
  assert.equal(s.wordEntries.length, 2);
});

console.log('\nwoorden');
check('woorden worden opgeslagen en geknipt op 5', () => {
  let s = gameReducer(seededSetup(), { type: 'START_WORD_ENTRY' });
  const t = s.teams[0];
  s = gameReducer(s, { type: 'SET_PLAYER_WORDS', teamId: t.id, playerId: t.players[0].id, words: ['1', '2', '3', '4', '5', '6', '7'] });
  assert.equal(s.wordEntries.length, 5);
});
check('tussenopslaan kan later worden overschreven', () => {
  let s = gameReducer(seededSetup(), { type: 'START_WORD_ENTRY' });
  const t = s.teams[0];
  const p = t.players[0];
  s = gameReducer(s, { type: 'SET_PLAYER_WORDS', teamId: t.id, playerId: p.id, words: ['a'] });
  assert.equal(s.wordEntries.length, 1);
  s = gameReducer(s, { type: 'SET_PLAYER_WORDS', teamId: t.id, playerId: p.id, words: ['a', 'b'] });
  assert.equal(s.wordEntries.length, 2, 'geen duplicaten bij opnieuw opslaan');
});
check('START_GAME zonder woorden doet niets', () => {
  const s = gameReducer(seededSetup(), { type: 'START_WORD_ENTRY' });
  assert.equal(gameReducer(s, { type: 'START_GAME' }).phase, 'wordEntry');
});
check('pot bevat elk woord precies eenmaal', () => {
  const s = gameReducer(withWords(seededSetup()), { type: 'START_GAME' });
  const r = gameReducer(s, { type: 'START_ROUND', round: 1 });
  assert.equal(s.phase, 'roundIntro');
  assert.equal(s.currentRound, 1);
  assert.equal(s.pot.length, 0, 'pot blijft leeg tot de ronde echt start');
  assert.equal(new Set(r.pot).size, allWords(r).length);
  assert.equal(r.currentWord, r.pot[r.pot.length - 1]);
});

console.log('\nbeurten en rotatie');
check('beurten wisselen altijd van team', () => {
  let s = gameReducer(withWords(seededSetup()), { type: 'START_GAME' });
  s = gameReducer(s, { type: 'START_ROUND', round: 1 });
  const order: string[] = [];
  for (let i = 0; i < 12; i++) {
    order.push(`${s.currentTeamIndex}/${s.currentPlayerIndex}`);
    s = gameReducer(s, { type: 'START_TURN' });
    s = gameReducer(s, { type: 'END_TURN' });
    assert.equal(s.currentTeamIndex, (i + 1) % 3, `verwacht team ${(i + 1) % 3} op beurt ${i + 1}`);
  }
  for (let teamIndex = 0; teamIndex < 3; teamIndex++) {
    const size = seededSetup().teams[teamIndex].players.length;
    const players = new Set(order.filter((o) => o.startsWith(`${teamIndex}/`)).map((o) => o.split('/')[1]));
    assert.deepEqual([...players].sort(), [...Array(size).keys()].map(String).sort(), `team ${teamIndex} komt elke speler aan bod`);
  }
});
check('twee teams: A1 B1 A2 B2 ...', () => {
  let s = gameReducer(initialGameState, { type: 'ADD_TEAM', name: 'A' });
  s = gameReducer(s, { type: 'ADD_TEAM', name: 'B' });
  const teamIds = s.teams.map((t) => t.id);
  teamIds.forEach((teamId) => {
    s = gameReducer(s, { type: 'ADD_PLAYER', teamId, name: '1' });
    s = gameReducer(s, { type: 'ADD_PLAYER', teamId, name: '2' });
  });
  s = gameReducer(s, { type: 'START_WORD_ENTRY' });
  s.teams.forEach((team) =>
    team.players.forEach((player) => {
      s = gameReducer(s, { type: 'SET_PLAYER_WORDS', teamId: team.id, playerId: player.id, words: [`${team.name}-${player.name}`] });
    })
  );
  s = gameReducer(s, { type: 'START_GAME' });
  s = gameReducer(s, { type: 'START_ROUND', round: 1 });
  const order: string[] = [];
  for (let i = 0; i < 6; i++) {
    const team = s.teams[s.currentTeamIndex];
    order.push(`${team.name}${team.players[s.currentPlayerIndex].name}`);
    s = gameReducer(s, { type: 'START_TURN' });
    s = gameReducer(s, { type: 'END_TURN' });
  }
  assert.equal(order.join(' '), 'A1 B1 A2 B2 A1 B1');
});
check('ongelijke teamgroottes blijven wisselen', () => {
  let s = withWords(seededSetup());
  s = gameReducer(s, { type: 'START_GAME' });
  s = gameReducer(s, { type: 'START_ROUND', round: 1 });
  const teams = new Set<number>();
  for (let i = 0; i < 9; i++) {
    teams.add(s.currentTeamIndex);
    s = gameReducer(s, { type: 'START_TURN' });
    s = gameReducer(s, { type: 'END_TURN' });
  }
  assert.deepEqual([...teams].sort(), [0, 1, 2]);
});
check('nextPoint houdt rekening met lege teams', () => {
  const s = initialGameState;
  assert.deepEqual(nextPoint(s), { teamIndex: 0, playerIndex: 0 });
});

console.log('\nscoren');
check('goed gokken telt voor het juiste team', () => {
  let s = gameReducer(withWords(seededSetup()), { type: 'START_GAME' });
  s = gameReducer(s, { type: 'START_ROUND', round: 1 });
  s = gameReducer(s, { type: 'START_TURN' });
  const teamId = s.teams[s.currentTeamIndex].id;
  const openWord = s.currentWord;
  s = gameReducer(s, { type: 'CORRECT_GUESS' });
  assert.equal(s.scores[teamId], 1);
  assert.equal(s.turnPoints, 1);
  assert.equal(s.totalWords, 1);
  assert.equal(s.pot.includes(openWord!), false, 'geraden woord verdwijnt uit de pot');
  assert.equal(s.currentWord, s.pot[s.pot.length - 1]);
});
check('pas geeft geen punt en houdt het woord in de pot', () => {
  let s = gameReducer(withWords(seededSetup()), { type: 'START_GAME' });
  s = gameReducer(s, { type: 'START_ROUND', round: 1 });
  s = gameReducer(s, { type: 'START_TURN' });
  const teamId = s.teams[s.currentTeamIndex].id;
  const size = s.pot.length;
  s = gameReducer(s, { type: 'PASS_GUESS' });
  assert.equal(s.scores[teamId], 0);
  assert.equal(s.turnPasses, 1);
  assert.equal(s.pot.length, size);
  assert.equal(s.pot.includes(s.currentWord!), true);
});
check('tijdverloop rekent af en wisselt van beurt', () => {
  let s = gameReducer(withWords(seededSetup()), { type: 'START_GAME' });
  s = gameReducer(s, { type: 'SET_TURN_SECONDS', seconds: 30 });
  s = gameReducer(s, { type: 'START_ROUND', round: 1 });
  s = gameReducer(s, { type: 'START_TURN' });
  const start = s.timerStartedAt!;
  s = gameReducer(s, { type: 'TICK', now: start + 10_000 });
  assert.equal(s.timerRemaining, 20);
  const before = `${s.currentTeamIndex}/${s.currentPlayerIndex}`;
  s = gameReducer(s, { type: 'TICK', now: start + 30_000 });
  assert.equal(s.timerRemaining, 30, 'timer reset bij 0');
  assert.equal(s.phase, 'handoff');
  assert.notEqual(`${s.currentTeamIndex}/${s.currentPlayerIndex}`, before);
});
check('TICK doet niets als de klok niet loopt', () => {
  const s = gameReducer(withWords(seededSetup()), { type: 'START_GAME' });
  assert.equal(gameReducer(s, { type: 'TICK', now: Date.now() }).timerRemaining, s.timerRemaining);
});
check('pot leeg sluit de ronde af', () => {
  let s = gameReducer(withWords(seededSetup()), { type: 'START_GAME' });
  s = gameReducer(s, { type: 'START_ROUND', round: 1 });
  const total = s.pot.length;
  s = guessWholePot(s);
  assert.equal(s.pot.length, 0);
  assert.equal(s.currentWord, null);
  assert.equal(s.phase, 'roundReview');
  assert.equal(s.totalWords, total);
});

console.log('\nrondes');
check('ronde 1 -> review -> intro ronde 2 met pot refill', () => {
  let s = gameReducer(withWords(seededSetup()), { type: 'START_GAME' });
  s = gameReducer(s, { type: 'START_ROUND', round: 1 });
  const total = s.pot.length;
  s = guessWholePot(s);
  s = gameReducer(s, { type: 'END_ROUND' });
  assert.equal(s.phase, 'roundReview');
  assert.deepEqual(s.roundResults, [{ round: 1, completed: true }]);
  s = gameReducer(s, { type: 'NEXT_ROUND' });
  assert.equal(s.phase, 'roundIntro', 'regelscherm wordt getoond voor ronde 2');
  assert.equal(s.currentRound, 2);
  s = gameReducer(s, { type: 'START_ROUND', round: 2 });
  assert.equal(s.phase, 'handoff');
  assert.equal(s.pot.length, total, 'pot is weer vol met alle woorden');
  assert.deepEqual(s.roundResults, [{ round: 1, completed: true }, { round: 2, completed: false }]);
  assert.equal(s.turnsThisRound, 0);
});
check('score en totaal blijven cumuleren over rondes', () => {
  let s = gameReducer(withWords(seededSetup()), { type: 'START_GAME' });
  s = gameReducer(s, { type: 'START_ROUND', round: 1 });
  const perRound = s.pot.length;
  s = guessWholePot(s);
  s = toRound(s, 2);
  assert.equal(Object.values(s.scores).reduce((a, b) => a + b, 0), perRound);
  assert.equal(s.totalWords, perRound);
  s = gameReducer(s, { type: 'START_TURN' });
  s = gameReducer(s, { type: 'CORRECT_GUESS' });
  assert.equal(s.totalWords, perRound + 1, 'totaal over de hele partij blijft oplopen');
  assert.equal(Object.values(s.scores).reduce((a, b) => a + b, 0), perRound + 1);
});
check('ronde 3 eindigt op de samenvatting met winnaars', () => {
  let s = gameReducer(withWords(seededSetup()), { type: 'START_GAME' });
  s = gameReducer(s, { type: 'START_ROUND', round: 1 });
  s = guessWholePot(s);
  for (const round of [2, 3] as const) {
    s = toRound(s, round);
    s = gameReducer(s, { type: 'END_TURN' });
    s = guessWholePot(s);
  }
  s = gameReducer(s, { type: 'END_ROUND' });
  assert.equal(s.phase, 'summary');
  const best = Math.max(...s.teams.map((t) => s.scores[t.id] ?? 0));
  assert.deepEqual(s.winners, s.teams.filter((t) => s.scores[t.id] === best).map((t) => t.id));
  assert.equal(s.winners.length, 1, 'het team dat het langst speelde wint');
  assert.equal(s.winners[0], s.teams[1].id);
  assert.deepEqual(s.roundResults, [
    { round: 1, completed: true },
    { round: 2, completed: true },
    { round: 3, completed: true },
  ]);
});
check('gelijkspel geeft meerdere winnaars', () => {
  const base = gameReducer(withWords(seededSetup()), { type: 'START_GAME' });
  const tieState: GameState = {
    ...base,
    phase: 'roundReview',
    currentRound: 3,
    scores: Object.fromEntries(base.teams.map((t) => [t.id, 4])),
  };
  const s = gameReducer(tieState, { type: 'END_ROUND' });
  assert.equal(s.phase, 'summary');
  assert.equal(s.winners.length, base.teams.length, 'alle teams winnen bij gelijkspel');
});
check('NEXT_ROND blijft binnen de drie rondes', () => {
  let s = gameReducer(withWords(seededSetup()), { type: 'START_GAME' });
  s = gameReducer(s, { type: 'NEXT_ROUND' });
  s = gameReducer(s, { type: 'NEXT_ROUND' });
  s = gameReducer(s, { type: 'NEXT_ROUND' });
  s = gameReducer(s, { type: 'NEXT_ROUND' });
  assert.equal(s.currentRound, 3);
});
check('RESET wist alles behalve de instellingen', () => {
  let s = gameReducer(withWords(seededSetup()), { type: 'START_GAME' });
  s = gameReducer(s, { type: 'SET_TURN_SECONDS', seconds: 90 });
  s = gameReducer(s, { type: 'START_ROUND', round: 1 });
  s = gameReducer(s, { type: 'RESET' });
  assert.equal(s.phase, 'setup');
  assert.equal(s.teams.length, 0);
  assert.equal(s.scores && Object.keys(s.scores).length, 0);
  assert.equal(s.turnSeconds, 90);
  s = gameReducer(s, { type: 'SET_WORDS_PER_PLAYER', count: 8 });
  s = gameReducer(s, { type: 'RESET' });
  assert.equal(s.wordsPerPlayer, 8, 'woorden per speler blijft staan voor het volgende spel');
});
check('NEW_GAME houdt teams, wist de woorden', () => {
  const seeded = withWords(seededSetup());
  let s = gameReducer(seeded, { type: 'START_GAME' });
  s = gameReducer(s, { type: 'START_ROUND', round: 1 });
  s = guessWholePot(s);
  s = gameReducer(s, { type: 'NEW_GAME' });
  assert.equal(s.phase, 'setup');
  assert.deepEqual(s.teams, seeded.teams, 'alle teams, spelers, namen en kleuren blijven staan');
  assert.equal(s.wordEntries.length, 0, 'woorden worden opnieuw gekozen');
  assert.equal(s.totalWords, 0);
  assert.equal(Object.keys(s.scores).length, 0);
  assert.equal(s.winners.length, 0);
  assert.equal(s.roundResults.length, 0);
});

console.log('\nrandomizer');
check('woordenbank bevat alleen bruikbare woorden', () => {
  assert.ok(WORD_BANK.length > 250, `verwacht een volle woordenbank, kreeg ${WORD_BANK.length}`);
  assert.equal(new Set(WORD_BANK).size, WORD_BANK.length, 'geen dubbele woorden');
  for (const word of WORD_BANK) {
    assert.equal(word, word.trim().toLowerCase(), `"${word}" moet schoon en zonder hoofdletters zijn`);
  }
});
check('rollen levert een woord uit de bank', () => {
  const word = pickRandomWord();
  assert.ok(WORD_BANK.includes(word), `"${word}" staat niet in de woordenbank`);
});
check('rollen slaat gebruikte woorden over', () => {
  const used = WORD_BANK.slice(0, 40);
  for (let i = 0; i < 60; i++) {
    const word = pickRandomWord(used);
    assert.ok(!used.includes(word), `"${word}" was al in gebruik`);
    assert.ok(WORD_BANK.includes(word));
  }
});
check('opnieuw rollen levert een ander woord op', () => {
  const used = ['aardappel', 'aardbei', 'accordeon', 'agenda', 'alarm'];
  const results = new Set(Array.from({ length: 40 }, () => pickRandomWord(used)));
  assert.ok(results.size > 1, 'herhaald rollen levert verschillende woorden op');
  for (const word of results) assert.ok(!used.includes(word));
});

console.log('\nstandings');
check('rangschikking deelt gelijke scores', () => {
  const rows = [
    { teamId: 'a', name: 'A', color: '#fff', score: 5 },
    { teamId: 'b', name: 'B', color: '#fff', score: 3 },
    { teamId: 'c', name: 'C', color: '#fff', score: 3 },
    { teamId: 'd', name: 'D', color: '#fff', score: 0 },
  ];
  const ranked = rankStandings(rows);
  assert.deepEqual(ranked.map((r) => `${r.rank}:${r.name}`), ['1:A', '2:B', '2:C', '4:D']);
  assert.deepEqual(ranked.filter((r) => r.isWinner).map((r) => r.name), ['A']);
});
check('teamScoresOf gebruikt teamkleuren en scores', () => {
  const s = seededSetup();
  const rows = teamScoresOf(s.teams, { [s.teams[0].id]: 7, [s.teams[1].id]: 2 });
  assert.equal(rows[0].score, 7);
  assert.equal(rows[1].score, 2);
  assert.equal(rows[2].score, 0, 'ontbrekende score telt als 0');
  assert.equal(rows[0].color, '#60A5FA');
  assert.equal(rows[1].color, '#FB923C');
});

console.log(failures === 0 ? '\nAlles slaagt\n' : `\n${failures} test(s) gefaald\n`);
process.exit(failures === 0 ? 0 : 1);
