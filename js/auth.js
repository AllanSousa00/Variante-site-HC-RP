// Authentication JavaScript for Hydra City RP

// DOM Elements
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const loginBox = document.getElementById('login-box');
const registerBox = document.getElementById('register-box');

// Initialize authentication
document.addEventListener('DOMContentLoaded', function() {
    initializeAuth();
    checkExistingSession();
});

function initializeAuth() {
    // Login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Register form submission
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    // Input focus effects
    initializeInputEffects();
}

function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const rememberMe = document.getElementById('remember-me').checked;
    
    // Clear previous errors
    clearErrors();
    
    // Validate inputs
    if (!validateEmail(email)) {
        showFieldError('login-email', 'E-mail inválido');
        return;
    }
    
    if (!validatePassword(password)) {
        showFieldError('login-password', 'Senha deve ter pelo menos 6 caracteres');
        return;
    }
    
    // Show loading state
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    setLoadingState(submitBtn, true);
    
    // Simulate login process
    setTimeout(() => {
        const users = getStoredUsers();
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            // Successful login
            loginUser(user, rememberMe);
            showSuccessMessage('Login realizado com sucesso!');
            
            setTimeout(() => {
                window.location.href = 'profile.html';
            }, 1500);
        } else {
            // Failed login
            showFieldError('login-password', 'E-mail ou senha incorretos');
            setLoadingState(submitBtn, false);
        }
    }, 1500);
}

function handleRegister(e) {
    e.preventDefault();
    
    const nickname = document.getElementById('register-nickname').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const acceptTerms = document.getElementById('accept-terms').checked;
    
    // Clear previous errors
    clearErrors();
    
    // Validate inputs
    if (!validateNickname(nickname)) {
        showFieldError('register-nickname', 'Nickname deve ter entre 3 e 20 caracteres');
        return;
    }
    
    if (!validateEmail(email)) {
        showFieldError('register-email', 'E-mail inválido');
        return;
    }
    
    if (!validatePassword(password)) {
        showFieldError('register-password', 'Senha deve ter pelo menos 6 caracteres');
        return;
    }
    
    if (password !== confirmPassword) {
        showFieldError('confirm-password', 'Senhas não coincidem');
        return;
    }
    
    if (!acceptTerms) {
        showFieldError('accept-terms', 'Você deve aceitar os termos de uso');
        return;
    }
    
    // Check if user already exists
    const users = getStoredUsers();
    if (users.find(u => u.email === email)) {
        showFieldError('register-email', 'E-mail já cadastrado');
        return;
    }
    
    if (users.find(u => u.nickname.toLowerCase() === nickname.toLowerCase())) {
        showFieldError('register-nickname', 'Nickname já está em uso');
        return;
    }
    
    // Show loading state
    const submitBtn = registerForm.querySelector('button[type="submit"]');
    setLoadingState(submitBtn, true);
    
    // Simulate registration process
    setTimeout(() => {
        const newUser = {
            id: generateUserId(),
            nickname: nickname,
            email: email,
            password: password,
            vipStatus: 'Nenhum',
            joinDate: new Date().toISOString(),
            lastLogin: new Date().toISOString()
        };
        
        // Save user
        users.push(newUser);
        localStorage.setItem('hydra_users', JSON.stringify(users));
        
        // Auto login
        loginUser(newUser, false);
        showSuccessMessage('Conta criada com sucesso!');
        
        setTimeout(() => {
            window.location.href = 'profile.html';
        }, 1500);
    }, 2000);
}

function loginUser(user, rememberMe) {
    // Update last login
    user.lastLogin = new Date().toISOString();
    
    // Save session
    const sessionData = {
        ...user,
        rememberMe: rememberMe,
        loginTime: new Date().toISOString()
    };
    
    if (rememberMe) {
        localStorage.setItem('hydra_user', JSON.stringify(sessionData));
    } else {
        sessionStorage.setItem('hydra_user', JSON.stringify(sessionData));
    }
    
    // Update stored users
    const users = getStoredUsers();
    const userIndex = users.findIndex(u => u.id === user.id);
    if (userIndex !== -1) {
        users[userIndex] = user;
        localStorage.setItem('hydra_users', JSON.stringify(users));
    }
}

function logoutUser() {
    localStorage.removeItem('hydra_user');
    sessionStorage.removeItem('hydra_user');
    window.location.href = 'index.html';
}

function getCurrentUser() {
    let user = localStorage.getItem('hydra_user');
    if (!user) {
        user = sessionStorage.getItem('hydra_user');
    }
    return user ? JSON.parse(user) : null;
}

function checkExistingSession() {
    const user = getCurrentUser();
    if (user && window.location.pathname.includes('login.html')) {
        window.location.href = 'profile.html';
    }
}

function getStoredUsers() {
    const users = localStorage.getItem('hydra_users');
    return users ? JSON.parse(users) : [];
}

function generateUserId() {
    return 'user_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Validation Functions
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePassword(password) {
    return password && password.length >= 6;
}

function validateNickname(nickname) {
    return nickname && nickname.length >= 3 && nickname.length <= 20;
}

// UI Helper Functions
function showLogin() {
    loginBox.classList.remove('hidden');
    registerBox.classList.add('hidden');
}

function showRegister() {
    registerBox.classList.remove('hidden');
    loginBox.classList.add('hidden');
}

function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const button = input.parentElement.querySelector('.toggle-password i');
    
    if (input.type === 'password') {
        input.type = 'text';
        button.className = 'fas fa-eye-slash';
    } else {
        input.type = 'password';
        button.className = 'fas fa-eye';
    }
}

function initializeInputEffects() {
    // Add focus effects to inputs
    document.querySelectorAll('.input-container input').forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.classList.remove('focused');
            if (this.value) {
                this.parentElement.classList.add('filled');
            } else {
                this.parentElement.classList.remove('filled');
            }
        });
        
        // Check if already filled on page load
        if (input.value) {
            input.parentElement.classList.add('filled');
        }
    });
}

function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const container = field.parentElement;
    
    // Add error class
    container.classList.add('error');
    
    // Remove existing error message
    const existingError = container.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Add error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message show';
    errorDiv.textContent = message;
    container.appendChild(errorDiv);
    
    // Focus the field
    field.focus();
}

function clearErrors() {
    document.querySelectorAll('.input-container.error').forEach(container => {
        container.classList.remove('error');
    });
    
    document.querySelectorAll('.error-message').forEach(error => {
        error.remove();
    });
}

function showSuccessMessage(message) {
    // Remove existing success messages
    document.querySelectorAll('.success-message').forEach(msg => msg.remove());
    
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message show';
    successDiv.textContent = message;
    
    const authForm = document.querySelector('.auth-form');
    authForm.parentElement.insertBefore(successDiv, authForm);
}

function setLoadingState(button, loading) {
    if (loading) {
        button.classList.add('loading');
        button.disabled = true;
    } else {
        button.classList.remove('loading');
        button.disabled = false;
    }
}

function loginWithDiscord() {
    // Simulate Discord OAuth
    showSuccessMessage('Redirecionando para Discord...');
    
    setTimeout(() => {
        // Create a fake Discord user
        const discordUser = {
            id: generateUserId(),
            nickname: 'DiscordUser#' + Math.floor(Math.random() * 9999),
            email: 'discord@example.com',
            password: 'discord_auth',
            vipStatus: 'Nenhum',
            joinDate: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            provider: 'discord'
        };
        
        loginUser(discordUser, true);
        window.location.href = 'profile.html';
    }, 2000);
}

// Add CSS for input effects
const inputStyles = document.createElement('style');
inputStyles.textContent = `
    .input-container.focused .input-icon {
        color: var(--primary) !important;
    }
    
    .input-container.filled .input-icon {
        color: var(--primary-light);
    }
    
    .input-container input:focus {
        border-color: var(--primary);
        box-shadow: 0 0 0 3px rgba(98, 0, 234, 0.1);
    }
    
    .auth-form {
        position: relative;
    }
`;
document.head.appendChild(inputStyles);

// Export functions for global access
window.showLogin = showLogin;
window.showRegister = showRegister;
window.togglePassword = togglePassword;
window.loginWithDiscord = loginWithDiscord;
window.logoutUser = logoutUser;
window.getCurrentUser = getCurrentUser;
