import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ClubSelector from './club/ClubSelector';
import PlayerList from './players/PlayerList';
import InvitationsModal from './modals/InvitationsModal';
import CreateClubModal from './modals/CreateClubModal';
import InviteModal from './modals/InviteModal';
import ManageModal from './modals/ManageModal';
import '../assets/css/styles.css';
import '../assets/css/formations.css';
import '../assets/css/clubs.css';

function Home() {
  const [players, setPlayers] = useState([]);
  const [clubId, setClubId] = useState(null);
  const [userClubs, setUserClubs] = useState([]);
  const [currentUser, setCurrentUser] = useState({});
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [showInvitationsModal, setShowInvitationsModal] = useState(false);
  const [showCreateClubModal, setShowCreateClubModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [sortAlphabetically, setSortAlphabetically] = useState(false);

  useEffect(() => {
    // Fetch current user data, clubs, and players
    fetchCurrentUser();
    fetchUserClubs();
    loadPlayersForClub();
  }, [clubId]);

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/current-user');
      const data = await response.json();
      setCurrentUser(data);
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  const fetchUserClubs = async () => {
    try {
      const response = await fetch('/api/user-clubs');
      const data = await response.json();
      setUserClubs(data);
    } catch (error) {
      console.error('Error fetching user clubs:', error);
    }
  };

  const loadPlayersForClub = async () => {
    try {
      const url = clubId ? `/api/players/${clubId}` : '/api/my-players';
      const response = await fetch(url);
      const data = await response.json();
      setPlayers(data);
    } catch (error) {
      console.error('Error loading players:', error);
    }
  };

  const handleClubChange = (newClubId) => {
    if (newClubId === 'create-club') {
      setShowCreateClubModal(true);
    } else {
      setClubId(newClubId);
    }
  };

  const toggleSort = () => {
    setSortAlphabetically(!sortAlphabetically);
    
    const sortedPlayers = [...players].sort((a, b) => {
      if (sortAlphabetically) {
        return a.name.localeCompare(b.name);
      } else {
        return 0; // Return to original order or you could implement another sorting logic
      }
    });
    
    setPlayers(sortedPlayers);
  };

  const createNewClub = async (clubName) => {
    try {
      const response = await fetch('/api/create-club', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: clubName }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserClubs([...userClubs, data]);
        setClubId(data.id);
        setShowCreateClubModal(false);
      }
    } catch (error) {
      console.error('Error creating club:', error);
    }
  };

  const handlePlayerSelection = (playerId, isSelected) => {
    if (isSelected) {
      setSelectedPlayers([...selectedPlayers, playerId]);
    } else {
      setSelectedPlayers(selectedPlayers.filter(id => id !== playerId));
    }
  };

  const handleSelectAll = (selectAll) => {
    if (selectAll) {
      setSelectedPlayers(players.map(player => player.id));
    } else {
      setSelectedPlayers([]);
    }
  };

  const addPlayer = () => {
    const newPlayer = {
      id: `temp-${Date.now()}`,
      name: '',
      velocidad: 3,
      resistencia: 3,
      control: 3,
      pases: 3,
      tiro: 3,
      defensa: 3,
      habilidad_arquero: 3,
      fuerza_cuerpo: 3,
      vision: 3,
      isNew: true
    };
    
    setPlayers([...players, newPlayer]);
  };

  const deletePlayer = async (playerId) => {
    try {
      if (!window.confirm('¿Estás seguro de eliminar este jugador?')) {
        return;
      }
      
      const response = await fetch(`/api/players/${playerId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ clubId }),
      });
      
      if (response.ok) {
        setPlayers(players.filter(player => player.id !== playerId));
        setSelectedPlayers(selectedPlayers.filter(id => id !== playerId));
      }
    } catch (error) {
      console.error('Error deleting player:', error);
    }
  };

  const savePlayers = async () => {
    try {
      const playersToSave = players.map(player => {
        const { isNew, ...playerData } = player;
        return playerData;
      });
      
      const response = await fetch('/api/save-players', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ players: playersToSave, clubId }),
      });
      
      if (response.ok) {
        alert('Jugadores guardados exitosamente');
        loadPlayersForClub();
      }
    } catch (error) {
      console.error('Error saving players:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedPlayers.length < 2) {
      alert('Selecciona al menos 2 jugadores para formar equipos');
      return false;
    }
    
    // Submit the form with selected players
    const formData = new FormData();
    selectedPlayers.forEach(playerId => {
      formData.append('selectedPlayers', playerId);
    });
    
    if (clubId) {
      formData.append('clubId', clubId);
    }
    
    try {
      const response = await fetch('/submit', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        const data = await response.json();
        // Handle the response, maybe redirect to results page
        window.location.href = `/results?id=${data.resultId}`;
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    }
    
    return false;
  };

  const resetPlayers = async () => {
    if (window.confirm('¿Estás seguro de borrar a todos los jugadores?')) {
      try {
        const response = await fetch('/api/reset-players', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ clubId }),
        });
        
        if (response.ok) {
          setPlayers([]);
          setSelectedPlayers([]);
        }
      } catch (error) {
        console.error('Error resetting players:', error);
      }
    }
  };

  return (
    <div className="content">
      <h1>Armar Equipos</h1>

      <div className="club-section">
        <div className="club-container">
          <div className="header-controls">
            <div className="sort-container" style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                id="sortButton" 
                className="sort-button" 
                onClick={toggleSort}
              >
                <i className={`fas fa-sort-alpha-${sortAlphabetically ? 'up' : 'down'}`}></i>
              </button>
            </div>
            
            <ClubSelector 
              clubs={userClubs} 
              selectedClub={clubId} 
              onChange={handleClubChange} 
            />

            <div className="control-buttons">
              <button 
                id="invitationsBtn" 
                className="icon-button notification-button" 
                title="Notificaciones"
                onClick={() => setShowInvitationsModal(true)}
              >
                <i className="fa-solid fa-bell"></i>
                {currentUser.pendingInvitations > 0 && (
                  <span id="invitationsBadge" className="notification-badge">
                    {currentUser.pendingInvitations}
                  </span>
                )}
              </button>

              {clubId && (
                <button 
                  id="manageBtn" 
                  className="icon-button" 
                  title="Administrar"
                  onClick={() => setShowManageModal(true)}
                >
                  <i className="fa-solid fa-users"></i>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="search-box" style={{ width: '80%', maxWidth: '800px', margin: '20px auto' }}>
        <input 
          type="search" 
          id="searchInput" 
          placeholder="Buscar jugador..." 
          onChange={(e) => {
            // Implement filtering logic here
            const searchText = e.target.value.toLowerCase();
            // Update players list based on search
          }} 
        />
        <i className="fas fa-search search-icon"></i>
      </div>

      <form onSubmit={handleSubmit}>
        {clubId && <input type="hidden" name="clubId" value={clubId} />}
        
        <PlayerList 
          players={players}
          selectedPlayers={selectedPlayers}
          onSelect={handlePlayerSelection}
          onDelete={deletePlayer}
          clubId={clubId}
        />

        <button type="submit" id="submitBtn">Armar Equipos</button>
        <button type="button" onClick={addPlayer}>Crear jugador</button>
        <button 
          type="button" 
          id="toggle-select-button"
          onClick={() => handleSelectAll(selectedPlayers.length < players.length)}
        >
          {selectedPlayers.length === players.length ? 'Deseleccionar a todos' : 'Seleccionar a todos'}
        </button>
        <button type="button" id="savePlayersBtn" onClick={savePlayers}>Guardar Jugadores</button>
      </form>
      
      <button className="reset-button" id="resetBtn" type="button" onClick={resetPlayers}>
        Borrar a todos
      </button>
      
      <br />
      
      <Link to="/logout" className="logout-link">
        <i className="fa-solid fa-right-from-bracket"></i> Cerrar sesión ({currentUser.userName})
      </Link>
      
      <div id="teams-container">
        {/* Results will be loaded here after submit */}
      </div>

      <div id="floating-button">
        <i className="fa-solid fa-list-check" style={{ fontSize: '20px' }}></i>
        <span id="selected-count" className="badge">{selectedPlayers.length}</span>
        <div id="selected-players-list" className={selectedPlayers.length > 0 ? '' : 'hidden'}>
          <ul id="selected-players-ul">
            {selectedPlayers.map(id => {
              const player = players.find(p => p.id === id);
              return player ? <li key={id}>{player.name}</li> : null;
            })}
          </ul>
        </div>
      </div>

      <button 
        type="button" 
        id="scroll-button" 
        onClick={() => {
          const submitBtn = document.getElementById('submitBtn');
          if (submitBtn) submitBtn.scrollIntoView({ behavior: 'smooth' });
        }}
      >
        <i className="fa-solid fa-circle-down"></i>
      </button>
      
      {/* Modals */}
      {showInvitationsModal && (
        <InvitationsModal 
          onClose={() => setShowInvitationsModal(false)} 
          userId={currentUser.id}
        />
      )}
      
      {showCreateClubModal && (
        <CreateClubModal 
          onClose={() => setShowCreateClubModal(false)}
          onSubmit={createNewClub}
        />
      )}
      
      {showInviteModal && (
        <InviteModal 
          onClose={() => setShowInviteModal(false)}
          clubId={clubId}
        />
      )}
      
      {showManageModal && (
        <ManageModal 
          onClose={() => setShowManageModal(false)}
          clubId={clubId}
          currentUser={currentUser}
          onShowInviteModal={() => {
            setShowManageModal(false);
            setShowInviteModal(true);
          }}
        />
      )}
      
      <footer className="footer">
        <div className="footer-links">
          <a 
            className="feedback-button" 
            href="https://form.typeform.com/to/FJzZpDL4" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <i className="fa-regular fa-comment"></i>
            <span>Dejame tu opinión</span>
          </a>
        </div>
        <div className="copyright">
          <i className="fas fa-code"></i> with ❤️ by <a href="https://github.com/fedecarboni7" target="_blank" rel="noopener noreferrer">fedecarboni7</a>
        </div>
      </footer>
    </div>
  );
}

export default Home;