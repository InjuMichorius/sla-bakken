/**
 * Centrale vertalingenset. Elke sleutel heeft een Nederlandse en een Engelse
 * zin. `{placeholder}`-stukken in een zin worden ingevuld door `t(key, {...})`.
 * Titels die puur merk zijn ('Sla Bakken') of door spelers ingevoerd worden
 * (team-/spelersnamen, woorden) vertalen bewust niet mee.
 */
export type Language = 'nl' | 'en' | 'de' | 'fr';

export type TranslationEntry = { nl: string; en: string; de: string; fr: string };

export const STRINGS = {
  /* Algemene begrippen */
  'common.back': { nl: 'Terug', en: 'Back', de: 'Zurück', fr: 'Retour' },
  'common.cancel': { nl: 'Annuleren', en: 'Cancel', de: 'Abbrechen', fr: 'Annuler' },
  'common.save': { nl: 'Opslaan', en: 'Save', de: 'Speichern', fr: 'Enregistrer' },
  'common.taken': { nl: 'bezet', en: 'taken', de: 'belegt', fr: 'pris' },
  'common.unknown': { nl: 'Onbekend', en: 'Unknown', de: 'Unbekannt', fr: 'Inconnu' },

  /* Hoofdmenu */
  'menu.start': { nl: 'Spel starten', en: 'Start game', de: 'Spiel starten', fr: 'Commencer le jeu' },
  'menu.settings': { nl: 'Instellingen', en: 'Settings', de: 'Einstellungen', fr: 'Paramètres' },
  'menu.rules': { nl: 'Speluitleg', en: 'How to play', de: 'Spielanleitung', fr: 'Comment jouer' },
  'menu.languages': { nl: 'Talen', en: 'Languages', de: 'Sprachen', fr: 'Langues' },
  'menu.taglineRounds': { nl: '3 rondes', en: '3 rounds', de: '3 Runden', fr: '3 manches' },
  'menu.taglineTeams': { nl: '2 teams', en: '2 teams', de: '2 Teams', fr: '2 équipes' },
  'menu.taglinePhone': { nl: '1 telefoon', en: '1 phone', de: '1 Telefon', fr: '1 téléphone' },

  /* Instellingen */
  'settings.title': { nl: 'Instellingen', en: 'Settings', de: 'Einstellungen', fr: 'Paramètres' },
  'settings.soundsSection': { nl: 'Geluiden', en: 'Sounds', de: 'Töne', fr: 'Sons' },
  'settings.soundsOn': { nl: 'Geluiden aan', en: 'Sounds on', de: 'Sounds an', fr: 'Sons activés' },
  'settings.soundsOnHint': { nl: 'Schakelaar voor alle geluiden in de app', en: 'Switch for all sounds in the app', de: 'Schalter für alle Geräusche in der App', fr: 'Commutateur pour tous les sons dans l\'app' },
  'settings.volume': { nl: 'Volume', en: 'Volume', de: 'Lautstärke', fr: 'Volume' },
  'settings.volumeHint': { nl: 'Hardheid van alle geluiden', en: 'Loudness of all sounds', de: 'Lautstärke aller Geräusche', fr: 'Volume de tous les sons' },
  'settings.playLabel': { nl: '{label} afspelen', en: 'Play {label}', de: '{label} abspielen', fr: 'Jouer {label}' },
  'settings.soundEnable': { nl: '{label} aanzetten', en: 'Enable {label}', de: '{label} aktivieren', fr: 'Activer {label}' },
  'settings.soundDisable': { nl: '{label} uitzetten', en: 'Disable {label}', de: '{label} deaktivieren', fr: 'Désactiver {label}' },
  'settings.hapticsSection': { nl: 'Trillingen', en: 'Vibration', de: 'Vibration', fr: 'Vibration' },
  'settings.hapticsOn': { nl: 'Trillingen aan', en: 'Vibrations on', de: 'Vibration an', fr: 'Vibrations activées' },
  'settings.hapticsOnHint': { nl: 'Voelbare feedback bij knoppen en gebeurtenissen', en: 'Tangible feedback on buttons and events', de: 'Haptisches Feedback bei Tasten und Ereignissen', fr: 'Retour haptique sur les boutons et les événements' },

  /* Geluid ingangen (labels/hints per toon) */
  'sound.accept.label': { nl: 'Doorgaan', en: 'Continue', de: 'Weiter', fr: 'Continuer' },
  'sound.accept.hint': { nl: 'Bij verder gaan of iets positiefs', en: 'When moving forward or doing something positive', de: 'Wenn du weitermachst oder etwas Positives passiert', fr: 'Lorsque vous avancez ou faites quelque chose de positif' },
  'sound.decline.label': { nl: 'Terug/annuleren', en: 'Back/cancel', de: 'Zurück/Abbrechen', fr: 'Retour/Annuler' },
  'sound.decline.hint': { nl: 'Bij teruggaan, stoppen of annuleren', en: 'When going back, stopping or cancelling', de: 'Beim Zurückgehen, Stoppen oder Abbrechen', fr: 'Lorsque vous retournez, arrêtez ou annulez' },
  'sound.swap.label': { nl: 'Random woord', en: 'Random word', de: 'Zufälliges Wort', fr: 'Mot aléatoire' },
  'sound.swap.hint': { nl: 'Op de random-woordknop bij het invullen', en: 'On the random word button while entering words', de: 'Auf dem Zufallswort-Button bei der Eingabe', fr: 'Sur le bouton mot aléatoire lors de la saisie' },
  'sound.correct.label': { nl: 'Goed geraden', en: 'Correct guess', de: 'Richtig geraten', fr: 'Bonne réponse' },
  'sound.correct.hint': { nl: 'Vrolijke korte ja-toon op de "Goed"-knop', en: 'Cheerful short yes-tone on the "Good" button', de: 'Fröhlicher kurzer Ja-Ton auf dem "Richtig"-Button', fr: 'Ton joyeux et court sur le bouton "Bon"' },
  'sound.turnStart.label': { nl: 'Beurt starten', en: 'Start of turn', de: 'Zug starten', fr: 'Début du tour' },
  'sound.turnStart.hint': { nl: 'Piep wanneer de beurt begint', en: 'Beep when the turn starts', de: 'Piepton wenn der Zug beginnt', fr: 'Bip lorsque le tour commence' },
  'sound.ticking.label': { nl: 'Aftellen', en: 'Countdown', de: 'Countdown', fr: 'Compte à rebours' },
  'sound.ticking.hint': { nl: 'Tikt in de laatste 5 seconden, van zacht naar steeds harder', en: 'Ticks in the final 5 seconds, from soft to steadily louder', de: 'Tickt in den letzten 5 Sekunden, von leise bis immer lauter', fr: 'Tic dans les 5 dernières secondes, du doux au plus fort' },
  'sound.timeUp.label': { nl: 'Tijd op', en: "Time's up", de: 'Zeit abgelaufen', fr: 'Temps écoulé' },
  'sound.timeUp.hint': { nl: 'Als de timer op nul staat', en: 'When the clock hits zero', de: 'Wenn der Timer auf Null steht', fr: 'Quand le minuteur atteint zéro' },
  'sound.victory.label': { nl: 'Winnaar', en: 'Winner', de: 'Gewinner', fr: 'Gagnant' },
  'sound.victory.hint': { nl: 'Op het eindstandscherm', en: 'On the final results screen', de: 'Auf dem Endergebnis-Bildschirm', fr: 'Sur l\'écran des résultats finaux' },

  /* Spelinstellingenkaart */
  'gamecard.wordsPerPlayer': { nl: 'Woorden per speler', en: 'Words per player', de: 'Wörter pro Spieler', fr: 'Mots par joueur' },
  'gamecard.oneLess': { nl: 'Eén woord minder', en: 'One word fewer', de: 'Ein Wort weniger', fr: 'Un mot de moins' },
  'gamecard.oneMore': { nl: 'Eén woord meer', en: 'One word more', de: 'Ein Wort mehr', fr: 'Un mot de plus' },
  'gamecard.turnSeconds': { nl: 'Tijd per beurt', en: 'Seconds per turn', de: 'Sekunden pro Zug', fr: 'Secondes par tour' },
  'gamecard.theRounds': { nl: 'De drie rondes', en: 'The three rounds', de: 'Die drei Runden', fr: 'Les trois manches' },

  /* Rondes */
  'rounds.describe.title': { nl: 'Omschrijven', en: 'Describe', de: 'Beschreiben', fr: 'Décrire' },
  'rounds.describe.verb': { nl: 'Omschrijf het woord', en: 'Describe the word', de: 'Beschreibe das Wort', fr: 'Décris le mot' },
  'rounds.describe.tagline': { nl: 'Verboden woord', en: 'Forbidden word', de: 'Verbotenes Wort', fr: 'Mot interdit' },
  'rounds.describe.rule1': { nl: 'Omschrijf het woord zo dat je team het kan raden.', en: 'Describe the word so your team can guess it.', de: 'Beschreibe das Wort, damit dein Team es erraten kann.', fr: 'Décris le mot pour que ton équipe le devine.' },
  'rounds.describe.rule2': { nl: 'Zeg nooit het woord zelf, ook niet deels of per letter.', en: 'Never say the word itself, not partially or letter by letter.', de: 'Sag niemals das Wort selbst, auch nicht teilweise oder Buchstabe für Buchstabe.', fr: 'Ne dis jamais le mot lui-même, même partiellement ou lettre par lettre.' },
  'rounds.describe.rule3': { nl: 'Geen vertalingen of een andere taal gebruiken.', en: 'No translations or other languages.', de: 'Keine Übersetzungen oder andere Sprachen verwenden.', fr: 'Pas de traductions ni d\'autres langues.' },
  'rounds.describe.rule4': { nl: 'Geen directe synoniemen of woorden die het meteen weggeven.', en: 'No direct synonyms or words that give it away instantly.', de: 'Keine direkten Synonyme oder Wörter, die es sofort verraten.', fr: 'Pas de synonymes directs ou de mots qui le donnent immédiatement.' },
  'rounds.describe.rule5': { nl: 'Moeilijke woorden mag je gerust overslaan met "Pas".', en: 'Feel free to skip hard words with "Pass".', de: 'Schwere Wörter kannst du gerne mit "Passen" überspringen.', fr: 'N\'hésite pas à passer les mots difficiles avec "Passer".' },
  'rounds.act.title': { nl: 'Uitbeelden', en: 'Act it out', de: 'Darstellen', fr: 'Mimer' },
  'rounds.act.verb': { nl: 'Beeld het woord uit', en: 'Act out the word', de: 'Stelle das Wort dar', fr: 'Mime le mot' },
  'rounds.act.tagline': { nl: 'Hints & mime', en: 'Hints & mime', de: 'Hinweise & Mimik', fr: 'Indices & mime' },
  'rounds.act.rule1': { nl: 'Beeld het woord uit met handen, gezicht en lichaam.', en: 'Act the word out with your hands, face and body.', de: 'Stelle das Wort mit Händen, Gesicht und Körper dar.', fr: 'Mime le mot avec tes mains, ton visage et ton corps.' },
  'rounds.act.rule2': { nl: 'Praten, mompelen en geluiden maken is niet toegestaan.', en: 'No talking, mumbling or making sounds.', de: 'Sprechen, Murmeln oder Geräusche machen ist nicht erlaubt.', fr: 'Il est interdit de parler, de marmonner ou de faire des sons.' },
  'rounds.act.rule3': { nl: 'Schrijven mag ook niet — alleen gebaren.', en: 'Writing is also not allowed — gestures only.', de: 'Schreiben ist ebenfalls nicht erlaubt — nur Gesten.', fr: 'L\'écriture n\'est pas autorisée — uniquement des gestes.' },
  'rounds.act.rule4': { nl: 'Je team lacht vandaag hardop, dus wees duidelijk.', en: 'Your team will laugh out loud, so be clear.', de: 'Dein Team wird heute laut lachen, also sei deutlich.', fr: 'Ton équipe rira fort aujourd\'hui, alors sois clair.' },
  'rounds.oneword.title': { nl: 'Eén Woord', en: 'One Word', de: 'Ein Wort', fr: 'Un mot' },
  'rounds.oneword.verb': { nl: 'Zeg precies één woord', en: 'Say exactly one word', de: 'Sag genau ein Wort', fr: 'Dis exactement un mot' },
  'rounds.oneword.tagline': { nl: 'Hint', en: 'Hint', de: 'Hinweis', fr: 'Indice' },
  'rounds.oneword.rule1': { nl: 'Zeg als hint exact één enkel woord.', en: 'Say exactly one word as a hint.', de: 'Sag als Hinweis genau ein einziges Wort.', fr: 'Dis exactement un mot comme indice.' },
  'rounds.oneword.rule2': { nl: 'Geen zinnen, geen uitleg, geen tweede woord.', en: 'No sentences, no explanations, no second word.', de: 'Keine Sätze, keine Erklärungen, kein zweites Wort.', fr: 'Pas de phrases, pas d\'explications, pas de deuxième mot.' },
  'rounds.oneword.rule3': { nl: 'Het woord zelf mag uiteraard niet gezegd worden.', en: 'The word itself may of course not be said.', de: 'Das Wort selbst darf natürlich nicht gesagt werden.', fr: 'Le mot lui-même ne peut bien sûr pas être dit.' },
  'rounds.oneword.rule4': { nl: 'Dit is de laatste ronde — geef je beste schot.', en: 'This is the final round — give it your best shot.', de: 'Dies ist die letzte Runde — gib dein Bestes.', fr: 'C\'est la dernière manche — fais de ton mieux.' },

  /* Speluitleg */
  'howto.hey': { nl: 'Het idee', en: 'The idea', de: 'Die Idee', fr: 'L\'idée' },
  'howto.idea': {
    nl: 'Jullie spelen met één gedeelde telefoon. Twee teams nemen om de beurt een beurt, waarin de speler aan de beurt zo veel mogelijk woorden probeert te raden binnen de tijd. Na drie rondes met een eigen opdracht telt alleen het totaal aantal geraden woorden.',
    en: 'You play with one shared phone. Two teams take turns, and the player up tries to guess as many words as they can within the time. After three rounds with their own assignment, only the total number of correctly guessed words counts.',
    de: 'Ihr spielt mit einem gemeinsamen Telefon. Zwei Teams spielen abwechselnd, wobei der Spieler an der Reihe so viele Wörter wie möglich innerhalb der Zeit erraten muss. Nach drei Runden mit jeweils eigener Aufgabe zählt nur die Gesamtzahl der richtig erratenen Wörter.',
    fr: 'Vous jouez avec un seul téléphone partagé. Deux équipes jouent à tour de rôle et le joueur actif essaie de deviner autant de mots que possible dans le temps imparti. Après trois manches avec leur propre consigne, seul le nombre total de mots devinés correctement compte.',
  },
  'howto.sectionSteps': { nl: 'Zo speel je', en: 'How to play', de: 'So spielst du', fr: 'Comment jouer' },
  'howto.step1.title': { nl: 'Teams instellen', en: 'Set up teams', de: 'Teams einrichten', fr: 'Configurer les équipes' },
  'howto.step1.body': { nl: 'Maak twee teams, geef ze een naam en een kleur en voeg minimaal twee spelers per team toe.', en: 'Create two teams, give them a name and a colour, and add at least two players per team.', de: 'Erstelle zwei Teams, gib ihnen einen Namen und eine Farbe und füge mindestens zwei Spieler pro Team hinzu.', fr: 'Créez deux équipes, donnez-leur un nom et une couleur, et ajoutez au moins deux joueurs par équipe.' },
  'howto.step2.title': { nl: 'Woorden invoeren', en: 'Enter words', de: 'Wörter eingeben', fr: 'Entrer des mots' },
  'howto.step2.body': { nl: 'Iedere speler vult in het geheim woorden in voor zijn of haar eigen team. De telefoon gaat daarbij rond, zodat niemand andermans woorden ziet.', en: 'Every player secretly enters words for their own team. The phone is handed around so nobody sees anyone else\'s words.', de: 'Jeder Spieler gibt heimlich Wörter für sein eigenes Team ein. Das Telefon wird herumgereicht, damit niemand die Wörter anderer sieht.', fr: 'Chaque joueur entre secrètement des mots pour son propre équipe. Le téléphone est passé autour pour que personne ne voie les mots des autres.' },
  'howto.step3.title': { nl: 'Drie rondes spelen', en: 'Play three rounds', de: 'Drei Runden spielen', fr: 'Jouer trois manches' },
  'howto.step3.body': { nl: 'Elke ronde gebruikt alle woorden opnieuw. Per beurt draait het om één woord en een timer.', en: 'Each round reuses all the words. Per turn it revolves around one word and a timer.', de: 'Jede Runde verwendet alle Wörter erneut. Pro Zug geht es um ein Wort und einen Timer.', fr: 'Chaque manche réutilise tous les mots. Par tour, il s\'agit d\'un mot et d\'un minuteur.' },
  'howto.step4.title': { nl: 'Winnaar bepalen', en: 'Find the winner', de: 'Gewinner ermitteln', fr: 'Déterminer le gagnant' },
  'howto.step4.body': { nl: 'Na de derde ronde wint het team met de meeste punten. Bij gelijkspel winnen alle teams met de hoogste score.', en: 'After the third round the team with the most points wins. In a tie, all top-scoring teams win.', de: 'Nach der dritten Runde gewinnt das Team mit den meisten Punkten. Bei Gleichstand gewinnen alle Teams mit der höchsten Punktzahl.', fr: 'Après la troisième manche, l\'équipe avec le plus de points gagne. En cas d\'égalité, toutes les équipes avec le score le plus élevé gagnent.' },
  'howto.sectionRounds': { nl: 'De drie rondes', en: 'The three rounds', de: 'Die drei Runden', fr: 'Les trois manches' },
  'howto.sectionTurn': { nl: 'Een beurt', en: 'A turn', de: 'Ein Zug', fr: 'Un tour' },
  'howto.turnIntro': {
    nl: 'Eerst zie je “Geef de telefoon aan”. Pas als de speler op Start beurt drukt, gaat de timer lopen. Het woord staat groot in beeld; in de laatste tien seconden tikt de timer en bij nul stopt de beurt vanzelf.',
    en: 'First you will see “Give the phone to…”. The timer only starts when the player taps Start turn. The word is shown big; in the final ten seconds the timer ticks and at zero the turn stops by itself.',
    de: 'Zuerst siehst du "Gib das Telefon an...". Der Timer startet erst, wenn der Spieler auf "Zug starten" tippt. Das Wort wird groß angezeigt; in den letzten zehn Sekunden tickt der Timer und bei Null stoppt der Zug automatisch.',
    fr: 'Vous verrez d\'abord "Passe le téléphone à...". Le minuteur ne démarre que lorsque le joueur appuie sur "Commencer le tour". Le mot s\'affiche en grand; dans les dix dernières secondes, le minuteur cliquette et à zéro, le tour s\'arrête automatiquement.',
  },
  'howto.goedBody': { nl: 'Het woord is geraden: +1 punt. Het volgende woord verschijnt meteen.', en: 'The word was guessed: +1 point. The next word appears instantly.', de: 'Das Wort wurde erraten: +1 Punkt. Das nächste Wort erscheint sofort.', fr: 'Le mot a été deviné: +1 point. Le mot suivant apparaît immédiatement.' },
  'howto.pasBody': { nl: 'Niet geraden? Het woord gaat terug in de pot en de timer loopt door.', en: 'Not guessed? The word goes back into the pot and the timer keeps running.', de: 'Nicht erraten? Das Wort geht zurück in den Topf und der Timer läuft weiter.', fr: 'Pas deviné? Le mot retourne dans le pot et le minuteur continue.' },
  'howto.stopBody': { nl: 'De beurt eindigt vroeg; het open woord gaat terug in de pot.', en: 'The turn ends early; the open word goes back into the pot.', de: 'Der Zug endet früh; das offene Wort geht zurück in den Topf.', fr: 'Le tour se termine tôt; le mot ouvert retourne dans le pot.' },
  'howto.sectionPoints': { nl: 'Punten', en: 'Points', de: 'Punkte', fr: 'Points' },
  'howto.points': {
    nl: 'Elk goed geraden woord levert het team exact één punt op. Er zijn geen bonussen voor snelheid en “Pas” kost geen punt. De scores lopen door over de rondes heen: na elke ronde zie je de tussenstand, na ronde 3 de eindstand.',
    en: 'Every correctly guessed word earns the team exactly one point. There are no speed bonuses and “Pass” costs nothing. Scores carry over across rounds: after each round you see the standings, after round 3 the final results.',
    de: 'Jedes richtig erratene Wort bringt dem Team genau einen Punkt. Es gibt keine Geschwindigkeitsboni und "Passen" kostet nichts. Die Punkte werden über die Runden hinweg übertragen: Nach jeder Runde siehst du den Zwischenstand, nach Runde 3 das Endergebnis.',
    fr: 'Chaque mot correctement deviné rapporte à l\'équipe exactement un point. Il n\'y a pas de bonus de vitesse et "Passer" ne coûte rien. Les scores sont cumulés sur les manches: après chaque manche, vous voyez le classement, après la manche 3, les résultats finaux.',
  },

  /* Setup-wizard */
  'setup.heading': { nl: 'Instellingen', en: 'Settings', de: 'Einstellungen', fr: 'Paramètres' },
  'setup.next': { nl: 'Volgende', en: 'Next', de: 'Weiter', fr: 'Suivant' },
  'setup.startGame': { nl: 'Start het spel', en: 'Start the game', de: 'Spiel starten', fr: 'Commencer le jeu' },
  'setup.editTeamName': { nl: 'Teamnaam {name} aanpassen', en: 'Edit team name {name}', de: 'Teamname {name} bearbeiten', fr: 'Modifier le nom de l\'équipe {name}' },
  'setup.teamColorTaken': { nl: 'Teamkleur {name}, al gekozen door {taken}', en: 'Team colour {name}, already chosen by {taken}', de: 'Teamfarbe {name}, bereits gewählt von {taken}', fr: 'Couleur d\'équipe {name}, déjà choisie par {taken}' },
  'setup.teamColorFree': { nl: 'Teamkleur {name}', en: 'Team colour {name}', de: 'Teamfarbe {name}', fr: 'Couleur d\'équipe {name}' },
  'setup.editPlayerName': { nl: 'Naam van {name} aanpassen', en: 'Edit name of {name}', de: 'Name von {name} bearbeiten', fr: 'Modifier le nom de {name}' },
  'setup.removePlayer': { nl: '{name} verwijderen', en: 'Remove {name}', de: '{name} entfernen', fr: 'Supprimer {name}' },
  'setup.addPlayer': { nl: 'Speler toevoegen', en: 'Add player', de: 'Spieler hinzufügen', fr: 'Ajouter un joueur' },
  'setup.addPlayerTo': { nl: 'Speler toevoegen aan {team}', en: 'Add player to {team}', de: 'Spieler zu {team} hinzufügen', fr: 'Ajouter un joueur à {team}' },
  'setup.playerDefault': { nl: 'Speler {n}', en: 'Player {n}', de: 'Spieler {n}', fr: 'Joueur {n}' },

  /* Woorden invullen */
  'words.done': { nl: 'Iedereen heeft zijn woorden ingevoerd.', en: 'Everyone has entered their words.', de: 'Alle haben ihre Wörter eingegeben.', fr: 'Tout le monde a entré ses mots.' },
  'words.toRules': { nl: 'Naar de regels', en: 'Go to the rules', de: 'Zu den Regeln', fr: 'Aller aux règles' },
  'words.iHavePhone': { nl: 'Ik heb de telefoon', en: 'I have the phone', de: 'Ich habe das Telefon', fr: 'J\'ai le téléphone' },
  'words.handoffHint': { nl: '{name} moet op deze knop klikken', en: '{name} should tap this button', de: '{name} sollte auf diesen Button tippen', fr: '{name} doit appuyer sur ce bouton' },
  'words.givePhone': { nl: 'Geef de telefoon aan', en: 'Give the phone to…', de: 'Gib das Telefon an', fr: 'Passe le téléphone à…' },
  'words.turnOf': { nl: 'Aan de beurt', en: "Turn of", de: 'Am Zug', fr: 'Au tour de' },
  'words.instructions': { nl: 'Bedenk {n} willekeurige woorden. Je team gaat ze straks proberen te raden.', en: 'Think up {n} random words. Your team will try to guess them later.', de: 'Denk dir {n} zufällige Wörter aus. Dein Team wird sie später erraten.', fr: 'Invente {n} mots aléatoires. Ton équipe essaiera de les deviner plus tard.' },
  'words.placeholder': { nl: 'Geheim woord {n}', en: 'Secret word {n}', de: 'Geheimes Wort {n}', fr: 'Mot secret {n}' },
  'words.saveNext': { nl: 'Opslaan & volgende speler', en: 'Save & next player', de: 'Speichern & nächster Spieler', fr: 'Enregistrer & joueur suivant' },
  'words.saveRules': { nl: 'Opslaan & naar de regels', en: 'Save & go to the rules', de: 'Speichern & zu den Regeln', fr: 'Enregistrer & aller aux règles' },
  'words.footerComplete': { nl: 'Alles ingevuld, je kunt doorgaan.', en: 'All filled in, you can continue.', de: 'Alles ausgefüllt, du kannst weitermachen.', fr: 'Tout est rempli, vous pouvez continuer.' },
  'words.footerMissing': { nl: 'Nog {n} woord of woorden te gaan (minimaal 1 woord nodig).', en: '{n} word(s) left (at least 1 word needed).', de: 'Noch {n} Wort/Wörter übrig (mindestens 1 Wort nötig).', fr: 'Il reste {n} mot(s) (au moins 1 mot requis).' },
  'words.confirmWord': { nl: 'Woord {n} bevestigen', en: 'Confirm word {n}', de: 'Wort {n} bestätigen', fr: 'Confirmer le mot {n}' },
  'words.confirmHint': { nl: 'Slaat dit woord op en gaat naar het volgende veld', en: 'Saves this word and moves to the next field', de: 'Speichert dieses Wort und geht zum nächsten Feld', fr: 'Enregistre ce mot et passe au champ suivant' },
  'words.rollHint': { nl: 'Vult dit veld met een willekeurig woord uit de woordenbank', en: 'Fills this field with a random word from the word bank', de: 'Füllt dieses Feld mit einem zufälligen Wort aus der Wortbank', fr: 'Remplit ce champ avec un mot aléatoire de la banque de mots' },
  'words.rollAgain': { nl: 'Opnieuw rollen voor woord {n}', en: 'Re-roll word {n}', de: 'Wort {n} neu würfeln', fr: 'Relancer le mot {n}' },
  'words.rollRandom': { nl: 'Random woord voor veld {n}', en: 'Random word for field {n}', de: 'Zufälliges Wort für Feld {n}', fr: 'Mot aléatoire pour le champ {n}' },
  'words.playerXofY': { nl: 'Speler {x} van {y}', en: 'Player {x} of {y}', de: 'Spieler {x} von {y}', fr: 'Joueur {x} sur {y}' },

  /* Ronde-intro */
  'round.start': { nl: 'Start ronde {n}', en: 'Start round {n}', de: 'Runde {n} starten', fr: 'Commencer la manche {n}' },
  'round.wordsInPot': { nl: '{n} woorden in de pot', en: '{n} words in the pot', de: '{n} Wörter im Topf', fr: '{n} mots dans le pot' },
  'round.previousTitle': { nl: 'Ronde {n} afgelopen — tussenstand', en: 'Round {n} finished — standings', de: 'Runde {n} beendet — Zwischenstand', fr: 'Manche {n} terminée — classement' },

  /* Spelen */
  'play.round': { nl: 'Ronde', en: 'Round', de: 'Runde', fr: 'Manche' },
  'play.startTurn': { nl: 'Start beurt', en: 'Start turn', de: 'Zug starten', fr: 'Commencer le tour' },
  'play.seconds': { nl: 'seconden', en: 'seconds', de: 'Sekunden', fr: 'secondes' },
  'play.wordLabel': { nl: 'TE RADEN WOORD', en: 'WORD TO GUESS', de: 'ZU ERRATENDES WORT', fr: 'MOT À DEVINER' },
  'play.good': { nl: 'Goed', en: 'Good', de: 'Richtig', fr: 'Bon' },
  'play.pass': { nl: 'Pas', en: 'Pass', de: 'Passen', fr: 'Passer' },
  'play.endTurn': { nl: 'Beurt stoppen', en: 'End turn', de: 'Zug beenden', fr: 'Terminer le tour' },
  'play.guessed': { nl: 'geraden', en: 'guessed', de: 'erraten', fr: 'deviné' },
  'play.viewResults': { nl: 'Eindstand bekijken', en: 'View final results', de: 'Endergebnis ansehen', fr: 'Voir les résultats finaux' },
  'play.toRound': { nl: 'Naar ronde {n}', en: 'To round {n}', de: 'Zu Runde {n}', fr: 'À la manche {n}' },
  'play.roundFinished': { nl: 'Ronde {n} afgelopen', en: 'Round {n} finished', de: 'Runde {n} beendet', fr: 'Manche {n} terminée' },
  'play.finishedLast': { nl: 'Alle drie de rondes zijn gespeeld. Dit is de eindstand.', en: 'All three rounds have been played. This is the final results.', de: 'Alle drei Runden wurden gespielt. Das ist das Endergebnis.', fr: 'Les trois manches ont été jouées. Voici les résultats finaux.' },
  'play.finishedNext': { nl: 'Alle {n} woorden zijn geraden. De pot wordt opnieuw gevuld voor ronde {n2}.', en: 'All {n} words were guessed. The pot is refilled for round {n2}.', de: 'Alle {n} Wörter wurden erraten. Der Topf wird für Runde {n2} neu gefüllt.', fr: 'Tous les {n} mots ont été devinés. Le pot est reconstitué pour la manche {n2}.' },
  'play.standingsAfter': { nl: 'Tussenstand na ronde {n}', en: 'Standings after round {n}', de: 'Zwischenstand nach Runde {n}', fr: 'Classement après la manche {n}' },
  'play.nextRound': { nl: 'Volgende ronde:', en: 'Next round:', de: 'Nächste Runde:', fr: 'Prochaine manche:' },

  /* Eindstand */
  'summary.newGame': { nl: 'Nieuw spel', en: 'New game', de: 'Neues Spiel', fr: 'Nouvelle partie' },
  'summary.eyebrow': { nl: 'Eindstand na 3 rondes', en: 'Final results after 3 rounds', de: 'Endergebnis nach 3 Runden', fr: 'Résultats finaux après 3 manches' },
  'summary.everyone': { nl: 'Iedereen', en: 'Everyone', de: 'Alle', fr: 'Tout le monde' },
  'summary.tie': { nl: 'Gewonnen met gelijkspel', en: 'Won by a tie', de: 'Unentschieden gewonnen', fr: 'Gagnant par égalité' },
  'summary.wins': { nl: 'wint met {n} punten', en: 'wins with {n} points', de: 'gewinnt mit {n} Punkten', fr: 'gagne avec {n} points' },
  'summary.fastest': { nl: 'Snelst geraden', en: 'Fastest guess', de: 'Schnellste Antwort', fr: 'Devine le plus vite' },
  'summary.fastestWith': { nl: 'Snelst geraden ({s}s)', en: 'Fastest guess ({s}s)', de: 'Schnellste Antwort ({s}s)', fr: 'Devine le plus vite ({s}s)' },
  'summary.avg': { nl: 'Gemiddeld per woord', en: 'Average per word', de: 'Durchschnitt pro Wort', fr: 'Moyenne par mot' },
  'summary.streak': { nl: 'Langste reeks', en: 'Longest streak', de: 'Längste Serie', fr: 'Série la plus longue' },

  /* Spel afsluiten */
  'quit.title': { nl: 'Spel verlaten?', en: 'Leave game?', de: 'Spiel verlassen?', fr: 'Quitter la partie?' },
  'quit.message': { nl: 'De woorden en scores van dit spel verdwijnen; je teams en spelers blijven bewaard. Je gaat terug naar het hoofdmenu.', en: 'The words and scores of this game disappear; your teams and players are kept. You return to the main menu.', de: 'Die Wörter und Punkte dieses Spiels gehen verloren; deine Teams und Spieler bleiben erhalten. Du kommst zurück zum Hauptmenü.', fr: 'Les mots et les scores de cette partie disparaissent; vos équipes et joueurs sont conservés. Vous revenez au menu principal.' },
  'quit.confirm': { nl: 'Spel verlaten', en: 'Leave game', de: 'Spiel verlassen', fr: 'Quitter la partie' },
  'quit.a11y': { nl: 'Spel verlaten', en: 'Leave game', de: 'Spiel verlassen', fr: 'Quitter la partie' },
  'quit.a11yHint': { nl: 'Stopt het huidige spel en gaat terug naar het begin', en: 'Stops the current game and returns to the beginning', de: 'Beendet das aktuelle Spiel und kehrt zum Anfang zurück', fr: 'Arrête la partie en cours et revient au début' },

  /* Talenpaneel */
  'languages.title': { nl: 'Talen', en: 'Languages', de: 'Sprachen', fr: 'Langues' },
  'languages.hint': { nl: 'Kies de taal van de app en het spel', en: 'Choose the language of the app and the game', de: 'Wähle die Sprache für App und Spiel', fr: 'Choisissez la langue de l\'application et du jeu' },
  'languages.appLanguage': { nl: 'App taal', en: 'App language', de: 'App-Sprache', fr: 'Langue de l\'application' },
  'languages.nl': { nl: 'Nederlands', en: 'Dutch', de: 'Niederländisch', fr: 'Néerlandais' },
  'languages.nlHint': { nl: 'Woorden, knoppen en uitleg in het Nederlands', en: 'Words, buttons and rules in Dutch', de: 'Wörter, Buttons und Regeln auf Niederländisch', fr: 'Mots, boutons et règles en néerlandais' },
  'languages.en': { nl: 'Engels', en: 'English', de: 'Englisch', fr: 'Anglais' },
  'languages.enHint': { nl: 'Woorden, knoppen en uitleg in het Engels', en: 'Words, buttons and rules in English', de: 'Wörter, Buttons und Regeln auf Englisch', fr: 'Mots, boutons et règles en anglais' },
  'languages.de': { nl: 'Duits', en: 'German', de: 'Deutsch', fr: 'Allemand' },
  'languages.deHint': { nl: 'Woorden, knoppen en uitleg in het Duits', en: 'Words, buttons and rules in German', de: 'Wörter, Buttons und Regeln auf Deutsch', fr: 'Mots, boutons et règles en allemand' },
  'languages.fr': { nl: 'Frans', en: 'French', de: 'Französisch', fr: 'Français' },
  'languages.frHint': { nl: 'Woorden, knoppen en uitleg in het Frans', en: 'Words, buttons and rules in French', de: 'Wörter, Buttons und Regeln auf Französisch', fr: 'Mots, boutons et règles en français' },
} satisfies Record<string, TranslationEntry>;

export type TranslationKey = keyof typeof STRINGS;