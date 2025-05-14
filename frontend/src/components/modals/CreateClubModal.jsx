import React, { useState } from 'react';

function CreateClubModal({ onClose, onSubmit }) {
  const [clubName, setClubName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!clubName.trim()) {
      alert('Por favor ingresa un nombre para el club');
      return;
    }
    
    onSubmit(clubName);
  };

  return (
    <div id="createClubModal" className="modal" style={{ display: 'block' }}>
      <div className="modal-content">
        <h2>Crear Club</h2>
        <form onSubmit={handleSubmit}>
          <input 
            type="text" 
            id="new-club-name" 
            placeholder="Nombre del club" 
            value={clubName}
            onChange={(e) => setClubName(e.target.value)}
            autoFocus
          />
          <button type="submit" className="btn btn-primary">Crear</button>
          <button type="button" className="btn" onClick={onClose}>Cancelar</button>
        </form>
      </div>
    </div>
  );
}

export default CreateClubModal;