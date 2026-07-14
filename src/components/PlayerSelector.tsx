import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {useTranslation} from "react-i18next";
import {InlineLabel, Select} from "@/components/FieldControls";

interface PlayerSelectorProps {
  characterId?: string;
  onChange?: (player?: Character) => void;
}

export default function PlayerSelector({
                                         characterId,
                                         onChange,
                                       }: PlayerSelectorProps) {
  const {t} = useTranslation();
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
    <InlineLabel htmlFor="player-select">
      {t('playerSelector.label')}
      <Select
        id="player-select"
        value={characterId || ""}
        onChange={handlePlayerChange}
      >
        <option value="" disabled>
          {t('playerSelector.placeholder')}
        </option>
        {playerOptions.map(({id, displayName, name}) => (
          <option key={id} value={id}>
            {displayName} ({name})
          </option>
        ))}
      </Select>
    </InlineLabel>
  );
}
