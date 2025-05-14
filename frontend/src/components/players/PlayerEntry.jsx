import React, { useState, useEffect } from 'react';
import StarRating from './StarRating';

function PlayerEntry({ player, isSelected, onSelect, onDelete, clubId }) {
  const [showDetails, setShowDetails] = useState(false);
  const [playerName, setPlayerName] = useState(player.name);
  const [playerSkills, setPlayerSkills] = useState({
    velocidad: player.velocidad,
    resistencia: player.resistencia,
    control: player.control,
    pases: player.pases,
    tiro: player.tiro,
    defensa: player.defensa,
    habilidad_arquero: player.habilidad_arquero,
    fuerza_cuerpo: player.fuerza_cuerpo,
    vision: player.vision
  });

  // Update player data when player prop changes
  useEffect(() => {
    setPlayerName(player.name);
    setPlayerSkills({
      velocidad: player.velocidad,
      resistencia: player.resistencia,
      control: player.control,
      pases: player.pases,
      tiro: player.tiro,
      defensa: player.defensa,
      habilidad_arquero: player.habilidad_arquero,
      fuerza_cuerpo: player.fuerza_cuerpo,
      vision: player.vision
    });
  }, [player]);

  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  const handleSkillChange = (skill, value) => {
    setPlayerSkills({
      ...playerSkills,
      [skill]: value
    });
  };

  return (
    <div className="player-entry">
      <div className="player-header">
        <input 
          type="checkbox" 
          name="selectedPlayers" 
          value={player.id}
          checked={isSelected}
          onChange={(e) => onSelect(e.target.checked)}
        />
        <input 
          type="text" 
          name="names" 
          value={playerName}
          placeholder={`Jugador`} 
          onChange={(e) => setPlayerName(e.target.value)}
          onClick={toggleDetails}
          required
          readOnly={!player.isNew}
        />
        <button 
          className="toggle-details" 
          type="button" 
          onClick={toggleDetails}
        >
          <i className={`fa-solid fa-angle-${showDetails ? 'up' : 'down'} toggle-icon`}></i>
        </button>
        <button 
          className="delete-button" 
          id={player.id} 
          type="button" 
          onClick={onDelete}
          data-club-id={clubId}
        >
          <i className="fa-solid fa-trash"></i>
        </button>
      </div>
      <div 
        className="details-container" 
        style={{ maxHeight: showDetails ? '1000px' : '0px', overflow: 'hidden', transition: 'max-height 0.3s ease-in-out' }}
      >
        <div className="skills-container">
          <div className="skill-entry">
            <label>Velocidad:</label>
            <StarRating 
              name="velocidad" 
              value={playerSkills.velocidad}
              onChange={(value) => handleSkillChange('velocidad', value)}
            />
          </div>
          <div className="skill-entry">
            <label>Resistencia:</label>
            <StarRating 
              name="resistencia" 
              value={playerSkills.resistencia}
              onChange={(value) => handleSkillChange('resistencia', value)}
            />
          </div>
          <div className="skill-entry">
            <label>Control:</label>
            <StarRating 
              name="control" 
              value={playerSkills.control}
              onChange={(value) => handleSkillChange('control', value)}
            />
          </div>
          <div className="skill-entry">
            <label>Pases:</label>
            <StarRating 
              name="pases" 
              value={playerSkills.pases}
              onChange={(value) => handleSkillChange('pases', value)}
            />
          </div>
          <div className="skill-entry">
            <label>Tiro:</label>
            <StarRating 
              name="tiro" 
              value={playerSkills.tiro}
              onChange={(value) => handleSkillChange('tiro', value)}
            />
          </div>
          <div className="skill-entry">
            <label>Defensa:</label>
            <StarRating 
              name="defensa" 
              value={playerSkills.defensa}
              onChange={(value) => handleSkillChange('defensa', value)}
            />
          </div>
          <div className="skill-entry">
            <label>Hab. arquero:</label>
            <StarRating 
              name="habilidad_arquero" 
              value={playerSkills.habilidad_arquero}
              onChange={(value) => handleSkillChange('habilidad_arquero', value)}
            />
          </div>
          <div className="skill-entry">
            <label>Fuerza cuerpo:</label>
            <StarRating 
              name="fuerza_cuerpo" 
              value={playerSkills.fuerza_cuerpo}
              onChange={(value) => handleSkillChange('fuerza_cuerpo', value)}
            />
          </div>
          <div className="skill-entry">
            <label>Visión:</label>
            <StarRating 
              name="vision" 
              value={playerSkills.vision}
              onChange={(value) => handleSkillChange('vision', value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlayerEntry;