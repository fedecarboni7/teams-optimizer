// Variables globales
let currentUser = null;
let clubId = null;
document.addEventListener('DOMContentLoaded', () => {
  clubId = document.getElementById('club-select').value;
  currentUser = document.getElementById('invitationsBtn').value;
  currentUser = JSON.parse(currentUser.replace(/'/g, '"'));
});

let pendingInvitations = [];
let clubMembers = [];
let pendingRoleChanges = new Map(); // Almacena los cambios pendientes

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
  document.getElementById('invitationsBtn').addEventListener('click', () => openModal('invitationsModal'));
  
  // Botones de modales para el club
  if (clubId !== 'my-players') {
    // Permitir que todos los miembros vean la lista
    document.getElementById('manageBtn').addEventListener('click', () => {
      loadClubMembers();
      openModal('manageModal');
    });

    // Solo admins y owners pueden invitar
    if (currentUser.clubRole !== 'member') {
      const inviteBtn = document.getElementById('inviteBtn');
      if (inviteBtn) {
        inviteBtn.addEventListener('click', (e) => {
          e.stopPropagation(); // Evitar que el click cierre el modal de miembros
          showInviteContent();
        });
      }
    }
  }

  // Cerrar modales al hacer click fuera
  document.addEventListener('click', event => {
    if (event.target.classList.contains('modal')) {
      event.target.classList.remove('active');
    }
  });
}

function showInviteContent() {
  document.getElementById('membersContent').style.display = 'none';
  document.getElementById('inviteContent').style.display = 'block';
  document.getElementById('inviteUsernameInput').value = ''; // Actualizado el ID
}

function showMembersContent() {
  document.getElementById('inviteContent').style.display = 'none';
  document.getElementById('membersContent').style.display = 'block';
}

// Funciones de UI
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
    : '<p>No tenés invitaciones pendientes</p>';
}

function updateMembersTableUI() {
  const tbody = document.getElementById('membersTableBody');
  const canEdit = currentUser.clubRole === 'admin' || currentUser.clubRole === 'owner';
  
  tbody.innerHTML = clubMembers.map(member => `
    <tr class="${member.role === 'pending' ? 'pending-member' : ''}">
      <td>${member.username}</td>
      <td>
        ${member.role === 'pending' ? 
          'Invitado <span class="pending-badge">Pendiente</span>' : 
          canEdit ? `
            <select
              class="member-role-select"
              ${member.user_id === currentUser.userId ? 'disabled' : ''}
              onchange="handleRoleChange(${member.user_id}, this.value, '${member.role}')"
            >
              <option value="member" ${member.role === 'member' ? 'selected' : ''}>Miembro</option>
              <option value="admin" ${member.role === 'admin' ? 'selected' : ''}>Admin</option>
              <option value="owner" ${member.role === 'owner' ? 'selected' : ''}>Owner</option>
            </select>
          ` : member.role
        }
      </td>
      <td>
        ${member.role === 'pending' ? `
          <button class="btn btn-secondary" onclick="cancelInvitation(${member.id})">Cancelar</button>
        ` : 
          canEdit && member.user_id !== currentUser.userId ? 
          `<button class="btn btn-danger" onclick="removeMember(${member.user_id})">Eliminar</button>` 
          : ''
        }
      </td>
    </tr>
  `).join('');

  // Mostrar u ocultar el botón de confirmar según haya cambios pendientes
  const confirmButton = document.getElementById('confirmChangesBtn');
  if (confirmButton) {
    confirmButton.style.display = pendingRoleChanges.size > 0 ? 'block' : 'none';
  }
}

function handleRoleChange(userId, newRole, currentRole) {
  if (newRole !== currentRole) {
    pendingRoleChanges.set(userId, newRole);
  } else {
    pendingRoleChanges.delete(userId);
  }
  
  // Mostrar u ocultar el botón de confirmar
  const confirmButton = document.getElementById('confirmChangesBtn');
  confirmButton.style.display = pendingRoleChanges.size > 0 ? 'block' : 'none';
}

async function confirmRoleChanges() {
  if (pendingRoleChanges.size === 0) return;

  const confirmation = confirm('¿Confirmar los cambios de roles?');
  if (!confirmation) return;

  let success = true;
  
  for (const [userId, newRole] of pendingRoleChanges) {
    try {
      const response = await fetch(`/clubs/${clubId}/members/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      });
      
      if (!response.ok) {
        success = false;
        const errorData = await response.json();
        alert(`Error al actualizar el rol: ${errorData.detail}`);
      }
    } catch (error) {
      success = false;
      console.error('Error:', error);
      alert('Error al actualizar el rol');
    }
  }

  if (success) {
    await loadClubMembers(); // Recargar la lista de miembros
    pendingRoleChanges.clear(); // Limpiar cambios pendientes
    const confirmButton = document.getElementById('confirmChangesBtn');
    confirmButton.style.display = 'none';
  }
}

// Funciones de acción
function sendInvitation() {
  const username = document.getElementById('inviteUsernameInput').value; // Actualizado el ID
  if (!username) {
    alert('Por favor ingresa un nombre de usuario');
    return;
  }
  
  fetch(`/clubs/${clubId}/invite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invited_username: username })
    })
    .then(response => response.json().then(data => ({ status: response.status, body: data })))
    .then(({ status, body }) => {
      if (status === 200) {
        alert('Invitación enviada con éxito');
        showMembersContent(); // Volver a la vista de miembros
      } else {
        alert(`Error al enviar la invitación: ${body.detail}`);
      }
    })
    .catch (error => {
      console.error('Error:', error);
      alert('Error al enviar la invitación');
    });
}

async function respondToInvitation(invitationId, accept) {
  try {
    const response = await fetch(`/invitations/${invitationId}/${accept ? 'accept' : 'reject'}`, {
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

async function updateMemberRole(userId, newRole) {
  try {
    const response = await fetch(`/clubs/${clubId}/members/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole })
    });
    
    if (response.ok) {
      clubMembers = clubMembers.map(member =>
        member.user_id === userId ? { ...member, role: newRole } : member
      );
      updateMembersTableUI();
    } else {
      const errorData = await response.json();
      alert(`Error al actualizar el rol: ${errorData.detail}`);
      loadClubMembers();
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error al actualizar el rol');
  }
}

async function removeMember(userId) {
  if (!confirm('¿Estás seguro de que deseas eliminar a este miembro?')) return;
  
  try {
    const response = await fetch(`/clubs/${clubId}/members/${userId}`, {
      method: 'DELETE'
    });
    
    if (response.ok) {
      clubMembers = clubMembers.filter(member => member.user_id !== userId);
      updateMembersTableUI();
    } else {
      const errorData = await response.json();
      alert(`Error al eliminar al miembro: ${errorData.detail}`);
      loadClubMembers();
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error al eliminar al miembro');
  }
}

async function cancelInvitation(invitationId) {
  if (!confirm('¿Estás seguro de que deseas cancelar esta invitación?')) return;
  
  try {
    const response = await fetch(`/clubs/${clubId}/invitations/${invitationId}`, {
      method: 'DELETE'
    });
    
    if (response.ok) {
      await loadClubMembers(); // Reload the members list
    } else {
      const errorData = await response.json();
      alert(`Error al cancelar la invitación: ${errorData.detail}`);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error al cancelar la invitación');
  }
}

function loadPlayersForClub() {
  const select = document.getElementById('club-select');
  const selectedValue = select.value;

  if (selectedValue === 'create-club') {
    // Restaurar el valor anterior del select
    select.value = clubId || 'my-players';
    openModal('createClubModal');
    return;
  }

  // Obtener la escala actual
  const currentScale = getCurrentScale();

  if (selectedValue === 'my-players') {
    window.location.href = `/home?scale=${currentScale}`;
    return;
  }

  // Navegar al club seleccionado preservando la escala
  window.location.href = `/home?club_id=${encodeURIComponent(selectedValue)}&scale=${currentScale}`;
}