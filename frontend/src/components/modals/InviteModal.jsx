
import React, { useState } from 'react';
import PropTypes from 'prop-types';

/**
 * InviteModal component for inviting users to a club
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {function} props.onClose - Function to call when the modal is closed
 * @param {function} props.onSendInvitation - Function to call when an invitation is sent
 * @param {string} props.clubId - The ID of the club to invite users to
 */
const InviteModal = ({ isOpen, onClose, onSendInvitation, clubId }) => {
  const [username, setUsername] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      onSendInvitation(username, clubId);
      setUsername('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Invitar usuario al club</h2>
          <button 
            className="icon-button" 
            onClick={onClose} 
            title="Cerrar"
          >
            <i className="fa-solid fa-times"></i>
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <input 
            type="text" 
            id="inviteUsernameInput" 
            placeholder="Nombre de usuario" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          
          <div className="modal-actions-bottom">
            <button 
              type="submit" 
              className="btn btn-primary"
            >
              Enviar invitación
            </button>
            <button 
              type="button" 
              className="btn" 
              onClick={onClose}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

InviteModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSendInvitation: PropTypes.func.isRequired,
  clubId: PropTypes.string
};

export default InviteModal;