// Profile JavaScript for Hydra City RP

// DOM Elements
const profileName = document.getElementById('profile-name');
const profileId = document.getElementById('profile-id');
const vipBadge = document.getElementById('vip-badge');
const memberBadge = document.getElementById('member-badge');
const vipStatus = document.getElementById('vip-status');
const lastLogin = document.getElementById('last-login');
const totalSpent = document.getElementById('total-spent');
const totalOrders = document.getElementById('total-orders');
const activityList = document.getElementById('activity-list');
const ordersList = document.getElementById('orders-list');
const editProfileModal = document.getElementById('edit-profile-modal');
const editProfileForm = document.getElementById('edit-profile-form');

// Initialize profile page
document.addEventListener('DOMContentLoaded', function() {
    checkAuthentication();
    loadUserProfile();
    initializeEventListeners();
});

function checkAuthentication() {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = 'login.html';
        return;
    }
}

function loadUserProfile() {
    const user = getCurrentUser();
    if (!user) return;

    // Update profile header
    updateProfileHeader(user);

    // Load stats
    loadUserStats(user);

    // Load activity
    loadRecentActivity(user);

    // Load orders if on orders tab
    if (document.querySelector('#orders-tab.active')) {
        loadOrders(user);
    }
}

function updateProfileHeader(user) {
    if (profileName) profileName.textContent = user.nickname;
    if (profileId) profileId.textContent = `ID: #${user.id.split('_')[1]}`;
    if (vipBadge) vipBadge.textContent = user.vipStatus || 'Nenhum VIP';
    if (memberBadge) {
        const joinDate = new Date(user.joinDate);
        memberBadge.textContent = `Membro desde: ${joinDate.getFullYear()}`;
    }
}

function loadUserStats(user) {
    // VIP Status
    if (vipStatus) vipStatus.textContent = user.vipStatus || 'Nenhum';

    // Last Login
    if (lastLogin) {
        const lastLoginDate = new Date(user.lastLogin);
        lastLogin.textContent = formatDate(lastLoginDate);
    }

    // Calculate total spent and orders
    const orders = getOrderHistory(user.id);
    const spent = orders.reduce((total, order) => total + order.total, 0);
    
    if (totalSpent) totalSpent.textContent = formatPrice(spent);
    if (totalOrders) totalOrders.textContent = orders.length;
}

function loadRecentActivity(user) {
    if (!activityList) return;

    const activities = [];

    // Add join activity
    activities.push({
        icon: 'user-plus',
        title: 'Conta criada',
        description: 'Bem-vindo ao Hydra City RP!',
        time: user.joinDate
    });

    // Add VIP purchase activities from orders
    const orders = getOrderHistory(user.id);
    orders.forEach(order => {
        activities.push({
            icon: 'shopping-cart',
            title: 'Compra realizada',
            description: `Pedido #${order.id.split('_')[1]}`,
            time: order.date
        });
    });

    // Sort activities by date (newest first)
    activities.sort((a, b) => new Date(b.time) - new Date(a.time));

    // Render activities
    activityList.innerHTML = activities.map(activity => `
        <div class="activity-item">
            <div class="activity-icon">
                <i class="fas fa-${activity.icon}"></i>
            </div>
            <div class="activity-content">
                <h4>${activity.title}</h4>
                <p>${activity.description}</p>
                <span class="activity-time">${formatDate(new Date(activity.time))}</span>
            </div>
        </div>
    `).join('');
}

function loadOrders(user) {
    if (!ordersList) return;

    const orders = getOrderHistory(user.id);

    if (orders.length === 0) {
        ordersList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-shopping-bag"></i>
                <h3>Nenhum pedido encontrado</h3>
                <p>Você ainda não fez nenhuma compra.</p>
                <a href="index.html#store" class="btn btn-primary">Ver Loja VIP</a>
            </div>
        `;
        return;
    }

    // Sort orders by date (newest first)
    orders.sort((a, b) => new Date(b.date) - new Date(a.date));

    ordersList.innerHTML = orders.map(order => `
        <div class="order-item">
            <div class="order-header">
                <span class="order-id">Pedido #${order.id.split('_')[1]}</span>
                <span class="order-status ${order.status.toLowerCase()}">${order.status}</span>
            </div>
            <div class="order-items">
                ${order.items.map(item => `
                    <div class="order-item-name">
                        <i class="${item.image}"></i>
                        ${item.name}
                    </div>
                `).join('')}
            </div>
            <div class="order-footer">
                <span class="order-date">${formatDate(new Date(order.date))}</span>
                <span class="order-total">${formatPrice(order.total)}</span>
            </div>
        </div>
    `).join('');
}

function showTab(tabId) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });

    // Remove active class from all buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected tab
    const selectedTab = document.getElementById(`${tabId}-tab`);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }

    // Add active class to clicked button
    const selectedBtn = document.querySelector(`.tab-btn[onclick="showTab('${tabId}')"]`);
    if (selectedBtn) {
        selectedBtn.classList.add('active');
    }

    // Load orders if orders tab is selected
    if (tabId === 'orders') {
        loadOrders(getCurrentUser());
    }
}

function editProfile() {
    const user = getCurrentUser();
    if (!user) return;

    // Populate form
    document.getElementById('edit-nickname').value = user.nickname;
    document.getElementById('edit-email').value = user.email;

    // Show modal
    editProfileModal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeEditModal() {
    editProfileModal.classList.remove('show');
    document.body.style.overflow = '';
}

function saveSettings() {
    const user = getCurrentUser();
    if (!user) return;

    const nickname = document.getElementById('settings-nickname').value;
    const email = document.getElementById('settings-email').value;
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmNewPassword = document.getElementById('confirm-new-password').value;
    const emailNotifications = document.getElementById('email-notifications').checked;
    const marketingEmails = document.getElementById('marketing-emails').checked;

    // Validate current password
    if (currentPassword && currentPassword !== user.password) {
        showNotification('Senha atual incorreta', 'error');
        return;
    }

    // Validate new password
    if (newPassword) {
        if (newPassword.length < 6) {
            showNotification('Nova senha deve ter pelo menos 6 caracteres', 'error');
            return;
        }

        if (newPassword !== confirmNewPassword) {
            showNotification('As senhas não coincidem', 'error');
            return;
        }
    }

    // Update user data
    const updatedUser = {
        ...user,
        nickname: nickname || user.nickname,
        email: email || user.email,
        password: newPassword || user.password,
        preferences: {
            emailNotifications,
            marketingEmails
        }
    };

    // Save to localStorage
    localStorage.setItem('hydra_user', JSON.stringify(updatedUser));

    // Update stored users
    const users = getStoredUsers();
    const userIndex = users.findIndex(u => u.id === user.id);
    if (userIndex !== -1) {
        users[userIndex] = updatedUser;
        localStorage.setItem('hydra_users', JSON.stringify(users));
    }

    showNotification('Configurações salvas com sucesso', 'success');
    resetSettings();
}

function resetSettings() {
    const user = getCurrentUser();
    if (!user) return;

    // Reset form values
    document.getElementById('settings-nickname').value = user.nickname;
    document.getElementById('settings-email').value = user.email;
    document.getElementById('current-password').value = '';
    document.getElementById('new-password').value = '';
    document.getElementById('confirm-new-password').value = '';
    document.getElementById('email-notifications').checked = user.preferences?.emailNotifications ?? true;
    document.getElementById('marketing-emails').checked = user.preferences?.marketingEmails ?? false;
}

function deleteAccount() {
    if (!confirm('Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.')) {
        return;
    }

    const user = getCurrentUser();
    if (!user) return;

    // Remove user from stored users
    const users = getStoredUsers();
    const updatedUsers = users.filter(u => u.id !== user.id);
    localStorage.setItem('hydra_users', JSON.stringify(updatedUsers));

    // Clear user session
    localStorage.removeItem('hydra_user');
    sessionStorage.removeItem('hydra_user');

    showNotification('Conta excluída com sucesso', 'success');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 2000);
}

function refreshOrders() {
    const user = getCurrentUser();
    if (!user) return;

    // Add loading animation
    ordersList.innerHTML = '<div class="loading">Carregando pedidos...</div>';

    // Simulate loading delay
    setTimeout(() => {
        loadOrders(user);
    }, 1000);
}

// Event Listeners
function initializeEventListeners() {
    // Edit profile form submission
    if (editProfileForm) {
        editProfileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const user = getCurrentUser();
            if (!user) return;

            const nickname = document.getElementById('edit-nickname').value;
            const email = document.getElementById('edit-email').value;

            // Update user data
            const updatedUser = {
                ...user,
                nickname,
                email
            };

            // Save to localStorage
            localStorage.setItem('hydra_user', JSON.stringify(updatedUser));

            // Update stored users
            const users = getStoredUsers();
            const userIndex = users.findIndex(u => u.id === user.id);
            if (userIndex !== -1) {
                users[userIndex] = updatedUser;
                localStorage.setItem('hydra_users', JSON.stringify(users));
            }

            // Update UI
            loadUserProfile();
            closeEditModal();
            showNotification('Perfil atualizado com sucesso', 'success');
        });
    }

    // Close modal on outside click
    if (editProfileModal) {
        editProfileModal.addEventListener('click', function(e) {
            if (e.target === editProfileModal) {
                closeEditModal();
            }
        });
    }
}

// Utility Functions
function formatDate(date) {
    const now = new Date();
    const diff = now - date;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 7) {
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    } else if (days > 0) {
        return `${days} dia${days > 1 ? 's' : ''} atrás`;
    } else if (hours > 0) {
        return `${hours} hora${hours > 1 ? 's' : ''} atrás`;
    } else if (minutes > 0) {
        return `${minutes} minuto${minutes > 1 ? 's' : ''} atrás`;
    } else {
        return 'Agora mesmo';
    }
}

function formatPrice(price) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(price);
}

function getOrderHistory(userId) {
    const orders = localStorage.getItem(`hydra_orders_${userId}`);
    return orders ? JSON.parse(orders) : [];
}

function getStoredUsers() {
    const users = localStorage.getItem('hydra_users');
    return users ? JSON.parse(users) : [];
}

function getCurrentUser() {
    let user = localStorage.getItem('hydra_user');
    if (!user) {
        user = sessionStorage.getItem('hydra_user');
    }
    return user ? JSON.parse(user) : null;
}

function showNotification(message, type = 'info') {
    // Use the showNotification function from main.js
    if (window.showNotification) {
        window.showNotification(message, type);
    }
}

// Export functions for global access
window.showTab = showTab;
window.editProfile = editProfile;
window.closeEditModal = closeEditModal;
window.saveSettings = saveSettings;
window.resetSettings = resetSettings;
window.deleteAccount = deleteAccount;
window.refreshOrders = refreshOrders;
