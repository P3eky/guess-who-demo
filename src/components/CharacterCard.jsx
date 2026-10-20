import { useState } from 'react';

function CharacterCard({ character, isEliminated, isSelected, onClick, disabled }) {
  // If the jpg file isn't in public/characters/ yet, show a numbered box instead
  const [imgError, setImgError] = useState(false);

  let className = 'card';
  if (isEliminated) className += ' eliminated';
  if (isSelected) className += ' selected';

  return (
    <button
      type="button"
      className={className}
      onClick={() => onClick(character.id)}
      disabled={disabled}
    >
      <div className="card-top">#{character.id}</div>

      <div className="card-img-box">
        {!imgError ? (
          <img
            src={character.image}
            alt={character.name}
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="placeholder">{character.id}</div>
        )}

        {/* Show a big X over eliminated characters */}
        {isEliminated && <div className="x-mark">X</div>}
      </div>

      <div className="card-name">{character.name}</div>
    </button>
  );
}

export default CharacterCard;