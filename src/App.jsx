import { useState } from 'react';
import CharacterCard from './components/CharacterCard.jsx';
import './App.css';

// Create the 24 characters (1.jpg to 24.jpg in public/characters/)
const CHARACTERS = Array.from({ length: 16 }, (_, i) => ({
  id: i + 1,
  name: `Character ${i + 1}`,
  image: `/characters/${i + 1}.jpg`,
}));

function App() {
  // Tracks which screen we are on: 'welcome', 'secret', 'handoff', 'play', or 'gameover'
  const [screen, setScreen] = useState('welcome');

  // Tracks whose turn it is (1 or 2)
  const [player, setPlayer] = useState(1);

  // Stores the secret character ID chosen by each player
  const [secrets, setSecrets] = useState({ 1: null, 2: null });
  const [tempSecret, setTempSecret] = useState(null);

  // Stores an array of eliminated character IDs for each player separately
  const [eliminated, setEliminated] = useState({ 1: [], 2: [] });

  // Guessing mode state
  const [isGuessing, setIsGuessing] = useState(false);
  const [guessId, setGuessId] = useState(null);

  // Tracks where the handoff screen should go next ('secret' or 'play')
  const [nextScreen, setNextScreen] = useState('secret');

  // Stores the final result when someone makes a guess
  const [result, setResult] = useState(null);

  const opponent = player === 1 ? 2 : 1;

  // Save a player's secret character and go to the handoff screen
  function confirmSecret() {
    if (!tempSecret) return;

    setSecrets({ ...secrets, [player]: tempSecret });
    setTempSecret(null);

    if (player === 1) {
      // Pass to Player 2 so they can pick their secret
      setPlayer(2);
      setNextScreen('secret');
      setScreen('handoff');
    } else {
      // Both players picked secrets, pass back to Player 1 to start the game
      setPlayer(1);
      setNextScreen('play');
      setScreen('handoff');
    }
  }

  // Handle clicking a character card during a turn
  function handleCardClick(id) {
    // In guessing mode, clicking a card just selects it as the guess
    if (isGuessing) {
      setGuessId(id);
      return;
    }

    // In normal mode, add or remove the character ID from the current player's eliminated list
    const myList = eliminated[player];
    const updatedList = myList.includes(id)
      ? myList.filter((item) => item !== id)
      : [...myList, id];

    setEliminated({ ...eliminated, [player]: updatedList });
  }

  // Check if the player's final guess matches the opponent's secret character
  function confirmGuess() {
    if (!guessId) return;

    const isCorrect = guessId === secrets[opponent];
    setResult({
      winner: isCorrect ? player : opponent,
      guesser: player,
      guessedId: guessId,
      isCorrect,
    });
    setScreen('gameover');
  }

  // End the current turn and show the privacy screen for the next player
  function endTurn() {
    setIsGuessing(false);
    setGuessId(null);
    setPlayer(opponent);
    setNextScreen('play');
    setScreen('handoff');
  }

  // Reset everything for a new game
  function resetGame() {
    setScreen('welcome');
    setPlayer(1);
    setSecrets({ 1: null, 2: null });
    setTempSecret(null);
    setEliminated({ 1: [], 2: [] });
    setIsGuessing(false);
    setGuessId(null);
    setResult(null);
  }

 // 1. Welcome Screen
  if (screen === 'welcome') {
    return (
      <div className="app">
        <div className="box center-box">
          <h1>Guess Who?</h1>
          <p>A two-player pass-and-play game on one device.</p>

          <ol className="rules">
            <li>Each player secretly picks a character.</li>
            <li>Take turns asking yes-or-no questions out loud.</li>
            <li>Tap characters on your board to cross them out.</li>
            <li>Guess your opponent's secret character to win!</li>
          </ol>

          <button className="btn primary" onClick={() => setScreen('secret')}>
            Start Game
          </button>
        </div>
      </div>
    );
  }

  // 2. Handoff / Privacy Screen
  if (screen === 'handoff') {
    return (
      <div className="app">
        <div className="box center-box">
          <h2>Pass the device to Player {player}</h2>
          <p>Make sure Player {opponent} isn't looking at the screen.</p>
          <button className="btn primary" onClick={() => setScreen(nextScreen)}>
            Player {player} Ready
          </button>
        </div>
      </div>
    );
  }

  // 3. Secret Character Selection Screen
  if (screen === 'secret') {
    return (
      <div className="app">
        <div className="top-bar">
          <h2>Player {player}: Pick Your Secret Character</h2>
          <p>Player {opponent} will try to guess this character.</p>
          <button
            className="btn accent"
            disabled={!tempSecret}
            onClick={confirmSecret}
          >
            Confirm Secret Character {tempSecret ? `(#${tempSecret})` : ''}
          </button>
        </div>

        <div className="grid">
          {CHARACTERS.map((char) => (
            <CharacterCard
              key={char.id}
              character={char}
              isEliminated={false}
              isSelected={tempSecret === char.id}
              onClick={setTempSecret}
            />
          ))}
        </div>
      </div>
    );
  }

  // 4. Main Gameplay Screen
  if (screen === 'play') {
    const myEliminated = eliminated[player];

    return (
      <div className="app">
        <div className="top-bar">
          <div>
            <h2>Player {player}'s Turn</h2>
            <p>
              {isGuessing
                ? `Tap the character you think is Player ${opponent}'s secret.`
                : `Ask Player ${opponent} a yes/no question, then tap characters to cross them out.`}
            </p>
          </div>

          {!isGuessing && (
            <div className="button-group">
              <button className="btn accent" onClick={() => setIsGuessing(true)}>
                Guess a Character
              </button>
              <button className="btn primary" onClick={endTurn}>
                End Turn & Pass Device
              </button>
            </div>
          )}
        </div>

        {/* Show confirmation box when the player is making a final guess */}
        {isGuessing && (
          <div className="guess-box">
            <p>
              <strong>
                {guessId
                  ? `Selected Guess: Character #${guessId}`
                  : 'Tap a card below to pick your guess.'}
              </strong>
              <br />
              Warning: An incorrect guess ends the game and gives Player {opponent} the win!
            </p>
            <div className="button-group">
              <button
                className="btn accent"
                disabled={!guessId}
                onClick={confirmGuess}
              >
                Confirm Guess
              </button>
              <button
                className="btn"
                onClick={() => {
                  setIsGuessing(false);
                  setGuessId(null);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="legend">
          <span>Remaining: {24 - myEliminated.length}</span>
          <span>Eliminated (X): {myEliminated.length} (tap again to undo)</span>
        </div>

        <div className="grid">
          {CHARACTERS.map((char) => (
            <CharacterCard
              key={char.id}
              character={char}
              isEliminated={myEliminated.includes(char.id)}
              isSelected={isGuessing && guessId === char.id}
              onClick={handleCardClick}
            />
          ))}
        </div>
      </div>
    );
  }

  // 5. Game Over Screen
  const p1Secret = CHARACTERS.find((c) => c.id === secrets[1]);
  const p2Secret = CHARACTERS.find((c) => c.id === secrets[2]);

  return (
    <div className="app">
      <div className="box center-box">
        <h1>Player {result.winner} Wins!</h1>
        <p>
          {result.isCorrect
            ? `Player ${result.guesser} correctly guessed Character #${result.guessedId}!`
            : `Player ${result.guesser} guessed Character #${result.guessedId}, which was wrong.`}
        </p>

        <div className="reveal-row">
          <div>
            <p><strong>Player 1's Secret</strong></p>
            <CharacterCard character={p1Secret} disabled />
          </div>
          <div>
            <p><strong>Player 2's Secret</strong></p>
            <CharacterCard character={p2Secret} disabled />
          </div>
        </div>

        <button className="btn primary" onClick={resetGame}>
          Play Again
        </button>
      </div>
    </div>
  );
}

export default App;