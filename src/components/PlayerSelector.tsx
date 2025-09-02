import {useEffect, useState} from "react";

interface PlayerSelectorProps {
  characterId?: string;
  onChange?: (player?: Character) => void;
}

export default function PlayerSelector({
                                         characterId,
                                         onChange,
                                       }: PlayerSelectorProps) {
  const [players, setPlayers] = useState<Character[]>([]);

  useEffect(() => {
    const updatePlayers = () => {
      setPlayers([...ChatRoomCharacter]);

      if (ChatRoomCharacter.length > 0 && !characterId && onChange) {
        const firstPlayer = ChatRoomCharacter[0];
        onChange(firstPlayer);
      }
    };

    updatePlayers();

    const intervalId = setInterval(updatePlayers, 1000);
    return () => {
      clearInterval(intervalId);
    };
  }, [characterId, onChange]);

  const handlePlayerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const playerId = e.target.value;
    if (playerId) {
      const selectedPlayer = players.find(it => it.CharacterID === playerId);
      if (onChange) {
        onChange(selectedPlayer);
      }
    }
  };

  return (<label htmlFor="player-select">选择玩家:
    <select
      id="player-select"
      value={characterId}
      onChange={handlePlayerChange}
    >
      <option value="" disabled>
        请选择玩家
      </option>
      {players.map((character) => (
        <option key={character.CharacterID} value={character.CharacterID}>
          {character.Nickname || character.Name} ({character.Name})
        </option>
      ))}
    </select>
  </label>);
}
