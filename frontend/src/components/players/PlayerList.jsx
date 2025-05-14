import React, { useState } from 'react';
import PlayerEntry from './PlayerEntry';

function PlayerList({ players, selectedPlayers, onSelect, onDelete, clubId }) {
  const [filteredPlayers, setFilteredPlayers] = useState(players);
  
  // Update filtered players when players prop changes
  React.useEffect(() => {
    setFilteredPlayers(players);
  }, [players]);
  
  // Function to filter players by search term
  const filterPlayers = (searchTerm) => {
    if (!searchTerm) {
      setFilteredPlayers(players);
      return;
    }
    
    const term = searchTerm.toLowerCase();
    const filtered = players.filter(player => 
      player.name.toLowerCase().includes(term)
    );
    
    setFilteredPlayers(filtered);
  };
  
  return (
    <div id="players-container" className="player-container">
      {filteredPlayers.map(player => (
        <PlayerEntry 
          key={player.id}
          player={player}
          isSelected={selectedPlayers.includes(player.id)}
          onSelect={(isSelected) => onSelect(player.id, isSelected)}
          onDelete={() => onDelete(player.id)}
          clubId={clubId}
        />
      ))}
    </div>
  );
}

export default PlayerList;