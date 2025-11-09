import {useEffect, useState, useCallback, useMemo, useRef} from "react";

interface PlayerSelectorProps {
  characterId?: string;
  onChange?: (player?: Character) => void;
}

export default function PlayerSelector({
                                         characterId,
                                         onChange,
                                       }: PlayerSelectorProps) {
  const [players, setPlayers] = useState<Character[]>([]);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    const updatePlayers = () => {
      const currentPlayers = ChatRoomCharacter || [];

      setPlayers(prev => {
        if (prev.length !== currentPlayers.length) {
          return [...currentPlayers];
        }

        const hasChanged = currentPlayers.some((char, idx) =>
          char.CharacterID !== prev[idx]?.CharacterID
        );

        return hasChanged ? [...currentPlayers] : prev;
      });
    };

    updatePlayers();

    const intervalId = setInterval(updatePlayers, 1000);
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    if (players.length > 0 && !characterId && onChangeRef.current) {
      onChangeRef.current(players[0]);
    }
  }, [players.length, characterId]);

  const handlePlayerChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const playerId = e.target.value;
    if (playerId && onChange) {
      const selectedPlayer = players.find(it => it.CharacterID === playerId);
      onChange(selectedPlayer);
    }
  }, [players, onChange]);

  const playerOptions = useMemo(() =>
    players.map((character) => ({
      id: character.CharacterID,
      displayName: character.Nickname || character.Name,
      name: character.Name,
    })),
    [players]
  );

  return (
    <label htmlFor="player-select">
      选择玩家:
      <select
        id="player-select"
        value={characterId || ""}
        onChange={handlePlayerChange}
      >
        <option value="" disabled>
          请选择玩家
        </option>
        {playerOptions.map(({id, displayName, name}) => (
          <option key={id} value={id}>
            {displayName} ({name})
          </option>
        ))}
      </select>
    </label>
  );
}
