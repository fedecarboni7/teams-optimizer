import React, { useState, useEffect } from 'react';

function InvitationsModal({ onClose, userId }) {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvitations();
  }, [userId]);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/invitations/${userId}`);
      const data = await response.json();
      setInvitations(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching invitations:', error);
      setLoading(false);
    }
  };

  const handleInvitation = async (invitationId, action) => {
    try {
      const response = await fetch(`/api/invitations/${invitationId}/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        // Remove the invitation from the list
        setInvitations(invitations.filter(inv => inv.id !== invitationId));
      }
    } catch (error) {
      console.error(`Error ${action} invitation:`, error);
    }
  };

  return (
    <div id="invitationsModal" className="modal" style={{ display: 'block' }}>
      <div className="modal-content">
        <h2>Invitaciones pendientes</h2>
        <div id="invitationsList">
          {loading ? (
            <p>Cargando invitaciones...</p>
          ) : invitations.length === 0 ? (
            <p>No tienes invitaciones pendientes</p>
          ) : (
            <ul className="invitations-list">
              {invitations.map(invitation => (
                <li key={invitation.id} className="invitation-item">
                  <div className="invitation-info">
                    <p>
                      <strong>{invitation.senderName}</strong> te invitó a unirte al club{' '}
                      <strong>{invitation.clubName}</strong>
                    </p>
                  </div>
                  <div className="invitation-actions">
                    <button 
                      className="btn btn-accept" 
                      onClick={() => handleInvitation(invitation.id, 'accept')}
                    >
                      Aceptar
                    </button>
                    <button 
                      className="btn btn-reject" 
                      onClick={() => handleInvitation(invitation.id, 'reject')}
                    >
                      Rechazar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <button className="btn" onClick={onClose}>Cerrar</button>
      </div>
    </div>
  );
}

export default InvitationsModal;