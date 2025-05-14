import React from 'react';

function ClubSelector({ clubs, selectedClub, onChange }) {
  return (
    <div className="club-selector">
      <select 
        id="club-select"
        value={selectedClub || 'my-players'}
        onChange={(e) => onChange(e.target.value === 'my-players' ? null : e.target.value)}
      >
        <option value="my-players">Mis jugadores</option>
        {clubs.map(club => (
          <option key={club.id} value={club.id}>
            {club.name}
          </option>
        ))}
        <option value="create-club">+ Crear nuevo club</option>
      </select>
    </div>
  );
}

export default ClubSelector;