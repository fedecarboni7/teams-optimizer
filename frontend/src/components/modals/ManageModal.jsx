
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * ManageModal component for managing club members
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {function} props.onClose - Function to call when the modal is closed
 * @param {Array} props.members - Array of club members
 * @param {string} props.clubId - The ID of the club
 * @param {Object} props.currentUser - The current user's information
 * @param {function} props.onSendInvitation - Function to call when an invitation is sent
 * @param {function} props.onDeleteClub - Function to call when the club is deleted
 * @param {function} props.onLeaveClub - Function to call when a user leaves the club
 * @param {function} props.onRoleChange - Function to call when a member's role is changed
 */
const ManageModal = ({ 
  isOpen, 
  onClose, 
  members = [], 
  clubId, 
  currentUser, 
  onSendInvitation, 
  onDeleteClub, 
  onLeaveClub,
  onRoleChange
}) => {
  const [showInviteContent, setShowInviteContent] = useState(false);
  const [roleChanges, setRoleChanges] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  const [username, setUsername] = useState('');

  // Reset state when modal opens or closes
  useEffect(() => {
    if (isOpen) {
      setRoleChanges({});
      setHasChanges(false);
      setShowInviteContent(false);
      setUsername('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRoleChange = (memberId, newRole) => {
    const updatedChanges = {
      ...roleChanges,
      [memberId]: newRole
    };
    setRoleChanges(updatedChanges);
    setHasChanges(Object.keys(updatedChanges).length > 0);
  };

  const handleConfirmChanges = () => {
    onRoleChange(roleChanges);
    setRoleChanges({});
    setHasChanges(false);
  };

  const showMembersContent = () => {
    setShowInviteContent(false);
  };

  const handleSendInvitation = () => {
    if (username.trim()) {
      onSendInvitation(username, clubId);
      setUsername('');
      showMembersContent();
    }
  };

  const renderMemberRow = (member) => {
    const isCurrentUser = member.id === currentUser.id;
    const isOwner = member.role === 'owner';
    const currentRole = roleChanges[member.id] || member.role;

    return (
      <tr key={member.id}>
        <td>{member.userName}{isCurrentUser ? ' (tú)' : ''}</td>
        <td>
          {isOwner || isCurrentUser ? (
            <span>{currentRole === 'owner' ? 'Dueño' : currentRole === 'admin' ? 'Administrador' : 'Miembro'}</span>
          ) : (
            <select 
              value={currentRole} 
              onChange={(e) => handleRoleChange(member.id, e.target.value)}
              disabled={currentUser.clubRole !== 'owner'}
            >
              <option value="member">Miembro</option>
              <option value="admin">Administrador</option>
            </select>
          )}
        </td>
        <td>
          {!isCurrentUser && currentUser.clubRole === 'owner' && (
            <button 
              className="icon-button" 
              onClick={() => onLeaveClub(clubId, member.id)} 
              title="Eliminar miembro"
            >
              <i className="fa-solid fa-user-minus"></i>
            </button>
          )}
        </td>
      </tr>
    );
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {!showInviteContent ? (
          <div id="membersContent">
            <div className="modal-header">
              <h2>Miembros del Club</h2>
              <div className="modal-actions">
                {clubId && currentUser.clubRole !== 'member' && (
                  <button 
                    id="inviteBtn" 
                    className="icon-button" 
                    onClick={() => setShowInviteContent(true)} 
                    title="Invitar"
                  >
                    <i className="fa-solid fa-user-plus"></i>
                  </button>
                )}
                {currentUser.clubRole === 'owner' && (
                  <button 
                    className="icon-button delete-club" 
                    onClick={() => onDeleteClub(clubId)} 
                    title="Eliminar club"
                  >
                    <i className="fa-solid fa-trash"></i>
                  </button>
                )}
                {currentUser.clubRole !== 'owner' && (
                  <button 
                    className="icon-button" 
                    onClick={() => onLeaveClub(clubId)} 
                    title="Salir del club"
                  >
                    <i className="fa-solid fa-door-open"></i>
                  </button>
                )}
                <button 
                  className="icon-button" 
                  onClick={onClose} 
                  title="Cerrar"
                >
                  <i className="fa-solid fa-times"></i>
                </button>
              </div>
            </div>
            
            <table className="members-table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Rol</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody id="membersTableBody">
                {members.map(renderMemberRow)}
              </tbody>
            </table>
            
            <div className="modal-actions-bottom">
              {hasChanges && (
                <button 
                  id="confirmChangesBtn" 
                  className="btn btn-primary" 
                  onClick={handleConfirmChanges}
                >
                  Confirmar cambios
                </button>
              )}
              <button 
                className="btn" 
                onClick={onClose}
              >
                Cerrar
              </button>
            </div>
          </div>
        ) : (
          <div id="inviteContent">
            <div className="modal-header">
              <h2>Invitar usuario al club</h2>
              <button 
                className="icon-button" 
                onClick={showMembersContent} 
                title="Volver"
              >
                <i className="fa-solid fa-arrow-left"></i>
              </button>
            </div>
            
            <input 
              type="text" 
              id="inviteUsernameInput" 
              placeholder="Nombre de usuario" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            
            <div className="modal-actions-bottom">
              <button 
                className="btn btn-primary" 
                onClick={handleSendInvitation}
              >
                Enviar invitación
              </button>
              <button 
                className="btn" 
                onClick={showMembersContent}
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

ManageModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  members: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      userName: PropTypes.string.isRequired,
      role: PropTypes.string.isRequired
    })
  ),
  clubId: PropTypes.string,
  currentUser: PropTypes.shape({
    id: PropTypes.string.isRequired,
    userName: PropTypes.string.isRequired,
    clubRole: PropTypes.string
  }),
  onSendInvitation: PropTypes.func.isRequired,
  onDeleteClub: PropTypes.func.isRequired,
  onLeaveClub: PropTypes.func.isRequired,
  onRoleChange: PropTypes.func.isRequired
};

export default ManageModal;