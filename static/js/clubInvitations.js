// Variables globales
let currentUser = null;
let clubId = null;
document.addEventListener('DOMContentLoaded', () => {
  clubId = document.getElementById('club-select').value;
  currentUser = document.getElementById('invitationsBtn').value;
});

let pendingInvitations = [];
let clubMembers = [];

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners(clubId, currentUser);
  loadInvitations();
  if (clubId !== 'my-players') {
    loadClubMembers();
  }
});

// Configuración de event listeners
function setupEventListeners(clubId, currentUser) {
  // Botón de invitaciones
  document.getElementById('invitationsBtn').addEventListener('click', toggleInvitationsPopover);
  
  // Cerrar popover al hacer click fuera
  document.addEventListener('click', (e) => {
    if (!e.target.closest('#invitationsBtn') && !e.target.closest('#invitationsPopover')) {
      document.getElementById('invitationsPopover').classList.remove('active');
    }
  });

  currentUser = JSON.parse(currentUser.replace(/'/g, '"'));
  // Botones de modales
  if (clubId !== 'my-players' && currentUser.clubRole !== 'member') {
    document.getElementById('inviteBtn').addEventListener('click', () => openModal('inviteModal'));
    document.getElementById('manageBtn').addEventListener('click', () => {
      loadClubMembers();
      openModal('manageModal');
    });
  }
}

// Funciones de UI
function toggleInvitationsPopover() {
  document.getElementById('invitationsPopover').classList.toggle('active');
}

function openModal(modalId) {
  document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove('active');
}

// Funciones de carga de datos
function loadInvitations() {
  fetch('/invitations/pending', {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }  
  })
  .then(response => response.json())
  .then(response => {
    pendingInvitations = response;
    updateInvitationsUI();
  })
  .catch(error => {
    console.error('Error al cargar invitaciones:', error);
  });
}

async function loadClubMembers() {
  try {
    const response = await fetch(`/clubs/${clubId}/members`);
    clubMembers = await response.json();
    updateMembersTableUI();
  } catch (error) {
    console.error('Error al cargar miembros:', error);
  }
}

// Funciones de actualización de UI
function updateInvitationsUI() {
  const badge = document.getElementById('invitationsBadge');
  const list = document.getElementById('invitationsList');
  
  badge.textContent = pendingInvitations.length;
  badge.style.display = pendingInvitations.length > 0 ? 'flex' : 'none';
  
  list.innerHTML = pendingInvitations.length > 0 
    ? pendingInvitations.map(inv => `
      <div class="invitation-card">
        <span>Unirse a ${inv.club_name}</span>
        <div>
          <button class="btn" onclick="respondToInvitation(${inv.id}, false)">Rechazar</button>
          <button class="btn btn-primary" onclick="respondToInvitation(${inv.id}, true)">Aceptar</button>
        </div>
      </div>
    `).join('')
    : '<p>No tienes invitaciones pendientes</p>';
}

function updateMembersTableUI() {
  const tbody = document.getElementById('membersTableBody');
  tbody.innerHTML = clubMembers.map(member => `
    <tr>
      <td>${member.username}</td>
      <td>
        <select
          ${member.user_id === currentUser.userId ? 'disabled' : ''}
          onchange="updateMemberRole(${member.user_id}, this.value)"
        >
          <option value="member" ${member.role === 'member' ? 'selected' : ''}>Miembro</option>
          <option value="admin" ${member.role === 'admin' ? 'selected' : ''}>Admin</option>
          <option value="owner" ${member.role === 'owner' ? 'selected' : ''}>Owner</option>
        </select>
      </td>
      <td>
        ${member.user_id !== currentUser.id 
          ? `<button class="btn btn-danger" onclick="removeMember(${member.user_id})">Eliminar</button>`
          : ''}
      </td>
    </tr>
  `).join('');
}

// Funciones de acción
function sendInvitation() {
  const username = document.getElementById('usernameInput').value;
  fetch(`/clubs/${clubId}/invite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invited_username: username })
    })
    .then(response => {
      if (response.ok) {
        alert('Invitación enviada con éxito');
        closeModal('inviteModal');
        document.getElementById('usernameInput').value = '';
      } else {
        alert('Error al enviar la invitación');
      }
    })
    .catch (error => {
      console.error('Error:', error);
      alert('Error al enviar la invitación');
    });
}

function respondToInvitation(invitationId, accept) {
  try {
    const response = fetch(`/invitations/${invitationId}/${accept ? 'accept' : 'reject'}`, {
      method: 'POST'
    });
    
    if (response.ok) {
      pendingInvitations = pendingInvitations.filter(inv => inv.id !== invitationId);
      updateInvitationsUI();
      if (accept) {
        window.location.reload(); // Recargar para actualizar la UI con el nuevo club
      }
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error al responder a la invitación');
  }
}

function updateMemberRole(userId, newRole) {
  try {
    const response = fetch(`/clubs/${clubId}/members/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole })
    });
    
    if (response.ok) {
      clubMembers = clubMembers.map(member =>
        member.user_id === userId ? { ...member, role: newRole } : member
      );
      updateMembersTableUI();
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error al actualizar el rol');
  }
}

function removeMember(userId) {
  if (!confirm('¿Estás seguro de que deseas eliminar a este miembro?')) return;
  
  try {
    const response = fetch(`/clubs/${clubId}/members/${userId}`, {
      method: 'DELETE'
    });
    
    if (response.ok) {
      clubMembers = clubMembers.filter(member => member.user_id !== userId);
      updateMembersTableUI();
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error al eliminar al miembro');
  }
}