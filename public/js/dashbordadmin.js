
// total user 
        fetch('/api/stats/users')
        .then(res => res.json())
        .then(data => {
            document.getElementById('totalUsers').textContent = data.total;
        })
        .catch(err => console.error('Erreur lors de la récupération des utilisateurs :', err));
//total clt
fetch('/api/stats/clients')
.then(res => res.json())
.then(data => {
    document.getElementById('totalClients').textContent = data.total;
})
.catch(err => console.error('Erreur lors de la récupération des clients :', err));
//total pro
fetch('/api/stats/professionnels')
.then(res => res.json())
.then(data => {
    document.getElementById('totalProfessionals').textContent = data.total;
})
.catch(err => console.error('Erreur lors de la récupération des professionnels :', err));
//total rdv
 fetch('/api/stats/rdv')
        .then(res => res.json())
        .then(data => {
            document.getElementById('totalAppointments').textContent = data.total;
        })
        .catch(err => console.error('Erreur lors de la récupération des rendez-vous :', err));
//table rdv
//fetch('/api/stats/rdvs')
//.then(res => res.json())
//.then(data => {
  //  const table = document.getElementById('appointmentsTable');
    //table.innerHTML = ''; // Vider le tableau

    //data.forEach(rdv => {
      //  const row = document.createElement('tr');

        //row.innerHTML = `
          //  <td>${rdv.client?.name || 'N/A'}</td>
            //<td>${rdv.professional?.name || 'N/A'}</td>
            //<td>${new Date(rdv.date).toLocaleString()}</td>
            //<td>${rdv.description || '-'}</td>
            //<td>${rdv.status}</td>
            //<td>
              //  <button class="btn btn-sm btn-danger">Supprimer</button>
            //</td>
        //`;

        //table.appendChild(row);
    //});
//})
//.catch(err => {
  //  console.error("Erreur lors du chargement des rendez-vous :", err);
//});

// Récupérer et afficher les utilisateurs
fetch('/api/stats/AllUsers')
    .then(res => res.json())
    .then(data => {
        console.log(data);  // Vérifie que tu reçois bien les utilisateurs
        const table = document.getElementById('usersTable');
        table.innerHTML = '';  // Vider le tableau avant de le remplir

        // Ajouter les utilisateurs dans le tableau
        data.users.forEach(user => {  // 'users' contient tous les utilisateurs
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${user.role}</td>
                <td>
                    <button class="btn btn-sm btn-warning edit-user-btn" data-user='${JSON.stringify(user)}'>Modifier</button>
                    <button class="btn btn-sm btn-danger delete-user-btn" data-user-id="${user._id}">Supprimer</button>
                </td>
            `;
            table.appendChild(row);
        });
    })
    .catch(err => {
        console.error('Erreur lors du chargement des utilisateurs :', err);
    });
//modal add
    document.getElementById('addUserBtn').addEventListener('click', () => {
        const addUserModal = new bootstrap.Modal(document.getElementById('addUserModal'));
        addUserModal.show();
    });
 //ajout user
 document.getElementById('addUserForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const user = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        role: document.getElementById('role').value,
        password: document.getElementById('password').value,
    };

    fetch('/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
    })
    .then(res => {
        if (!res.ok) throw new Error("Erreur lors de l'ajout");
        return res.json();
    })
    .then(data => {
        alert('Utilisateur ajouté avec succès !');
        document.getElementById('addUserForm').reset();
        bootstrap.Modal.getInstance(document.getElementById('addUserModal')).hide();
        location.reload(); // recharge les données 
    })
    .catch(err => {
        console.error(err);
        alert('Erreur lors de l\'ajout de l\'utilisateur.');
    });
});
   //modif user
   document.addEventListener('click', function (e) {
    if (e.target.classList.contains('edit-user-btn')) {
      const user = JSON.parse(e.target.getAttribute('data-user'));
  
      document.getElementById('editUserId').value = user._id;
      document.getElementById('editName').value = user.name;
      document.getElementById('editEmail').value = user.email;
      document.getElementById('editRole').value = user.role;
      document.getElementById('editPassword').value = '';
  
      const editUserModal = new bootstrap.Modal(document.getElementById('editUserModal'));
      editUserModal.show();
    }
  });

  document.getElementById('editUserForm').addEventListener('submit', function (e) {
    e.preventDefault();
  
    const userId = document.getElementById('editUserId').value;
  
    const updatedUser = {
      name: document.getElementById('editName').value,
      email: document.getElementById('editEmail').value,
      role: document.getElementById('editRole').value
    };
  
    const newPassword = document.getElementById('editPassword').value;
    if (newPassword) {
      updatedUser.password = newPassword;
    }
  
    fetch(`/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedUser)
    })
      .then(res => {
        if (!res.ok) throw new Error("Erreur lors de la modification");
        return res.json();
      })
      .then(data => {
        alert('Utilisateur modifié avec succès !');
        bootstrap.Modal.getInstance(document.getElementById('editUserModal')).hide();
        location.reload();
      })
      .catch(err => {
        console.error(err);
        alert('Erreur lors de la modification de l\'utilisateur.');
      });
  });
  //delete user
  document.addEventListener('click', function (e) {
    if (e.target.classList.contains('delete-user-btn')) {
      const userId = e.target.getAttribute('data-user-id');
  
      if (confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) {
        fetch(`/user/${userId}`, {
          method: 'DELETE'
        })
        .then(res => {
          if (!res.ok) throw new Error("Erreur lors de la suppression");
          return res.json();
        })
        .then(data => {
          alert('Utilisateur supprimé avec succès.');
          location.reload();
        })
        .catch(err => {
          console.error(err);
          alert('Erreur lors de la suppression de l\'utilisateur.');
        });
      }
    }
  });
  
//modifier user conneceter
document.getElementById('userSettingsForm').addEventListener('submit', function (e) {
    e.preventDefault();
  
    const userId = document.getElementById('settingsUserId').value;
    const name = document.getElementById('settingsName').value;
    const email = document.getElementById('settingsEmail').value;
    const password = document.getElementById('settingsPassword').value;
  
    const updatedUser = { name, email };
    if (password) updatedUser.password = password;
  
    console.log('Données à envoyer :', updatedUser);

    fetch(`/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedUser)
    })
      .then(res => {
        if (!res.ok) throw new Error("Erreur lors de la mise à jour");
        return res.json();
      })
      .then(data => {
        alert("Informations mises à jour !");
        bootstrap.Modal.getInstance(document.getElementById('userSettingsModal')).hide();
        location.reload();
      })
      .catch(err => {
        console.error(err);
        alert("Erreur lors de la mise à jour.");
      });
    
  });

   // Fonction pour récupérer les données depuis les API
   async function fetchData() {
    const users = await fetch('/api/stats/users').then(res => res.json());
    const clients = await fetch('/api/stats/clients').then(res => res.json());
    const professionals = await fetch('/api/stats/professionnels').then(res => res.json());
    const rdvs = await fetch('/api/stats/rdv').then(res => res.json());

    return {
        users: users.total,
        clients: clients.total,
        professionals: professionals.total,
        rdvs: rdvs.total
    };
}

// Fonction pour afficher le graphique avec les données récupérées
async function renderChart() {
    const data = await fetchData();

    const ctx = document.getElementById('statsChart').getContext('2d');
    const statsChart = new Chart(ctx, {
        type: 'bar',  // Type de graphique (barres)
        data: {
            labels: ['Utilisateurs', 'Clients', 'Professionnels', 'Rendez-vous'],
            datasets: [{
                label: 'Total',
                data: [data.users, data.clients, data.professionals, data.rdvs],  // Les vraies valeurs des API
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Lancer la fonction pour afficher le graphique
renderChart();
  