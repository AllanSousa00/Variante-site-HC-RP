// Main JavaScript for Hydra City RP Website

// DOM Elements
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');
const cartCount = document.getElementById('cart-count');
const onlineCount = document.getElementById('online-count');

// Initialize the website
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeCarousel();
    updateCartCount();
    updateOnlineCount();
    initializeScrollEffects();
    checkUserSession();
});

// Navigation Functions
function initializeNavigation() {
    // Mobile menu toggle
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', toggleMobileMenu);
    }

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                // Close mobile menu if open
                if (navMenu.classList.contains('active')) {
                    toggleMobileMenu();
                }
            }
        });
    });

    // Navbar scroll effect
    window.addEventListener('scroll', handleNavbarScroll);
}

function toggleMobileMenu() {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
}

function handleNavbarScroll() {
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(18, 18, 18, 0.98)';
    } else {
        navbar.style.background = 'rgba(18, 18, 18, 0.95)';
    }
}

// Carousel Functions
let currentSlide = 0;
let carouselInterval;

function initializeCarousel() {
    const carousel = document.getElementById('carousel');
    if (!carousel) return;

    const slides = carousel.querySelectorAll('.carousel-slide');
    if (slides.length === 0) return;

    // Auto-play carousel
    carouselInterval = setInterval(nextSlide, 5000);

    // Pause on hover
    carousel.addEventListener('mouseenter', () => clearInterval(carouselInterval));
    carousel.addEventListener('mouseleave', () => {
        carouselInterval = setInterval(nextSlide, 5000);
    });
}

function nextSlide() {
    const carousel = document.getElementById('carousel');
    if (!carousel) return;

    const slides = carousel.querySelectorAll('.carousel-slide');
    if (slides.length === 0) return;

    currentSlide = (currentSlide + 1) % slides.length;
    updateCarousel();
}

function prevSlide() {
    const carousel = document.getElementById('carousel');
    if (!carousel) return;

    const slides = carousel.querySelectorAll('.carousel-slide');
    if (slides.length === 0) return;

    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    updateCarousel();
}

function updateCarousel() {
    const carousel = document.getElementById('carousel');
    if (!carousel) return;

    const slideWidth = 100;
    carousel.style.transform = `translateX(-${currentSlide * slideWidth}%)`;
}

// Hero Button Functions
function copyServerIP() {
    const serverIP = 'connect hydracityrp.com';
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(serverIP).then(() => {
            showNotification('IP do servidor copiado!', 'success');
        }).catch(() => {
            fallbackCopyTextToClipboard(serverIP);
        });
    } else {
        fallbackCopyTextToClipboard(serverIP);
    }
}

function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.position = 'fixed';
    
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        showNotification('IP do servidor copiado!', 'success');
    } catch (err) {
        showNotification('Erro ao copiar IP', 'error');
    }
    
    document.body.removeChild(textArea);
}

function openDiscord() {
    window.open('https://discord.gg/hydracityrp', '_blank');
}

function scrollToStore() {
    const storeSection = document.getElementById('store');
    if (storeSection) {
        storeSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

function downloadPacks() {
    showNotification('Download iniciado! Verifique sua pasta de downloads.', 'info');
    // In a real scenario, this would trigger an actual download
    setTimeout(() => {
        window.open('#', '_blank');
    }, 1000);
}

// Cart Functions
function addToCart(id, name, price) {
    let cart = getCart();
    
    // Check if item already exists
    const existingItem = cart.find(item => item.id === id);
    if (existingItem) {
        showNotification('Item já está no carrinho!', 'warning');
        return;
    }
    
    const item = {
        id: id,
        name: name,
        price: price,
        image: getItemImage(id)
    };
    
    cart.push(item);
    saveCart(cart);
    updateCartCount();
    
    // Add visual feedback
    const button = event.target;
    const originalText = button.innerHTML;
    button.innerHTML = '<i class="fas fa-check"></i> Adicionado!';
    button.style.background = 'var(--success)';
    
    setTimeout(() => {
        button.innerHTML = originalText;
        button.style.background = '';
    }, 2000);
    
    showNotification(`${name} adicionado ao carrinho!`, 'success');
}

function getCart() {
    const cart = localStorage.getItem('hydra_cart');
    return cart ? JSON.parse(cart) : [];
}

function saveCart(cart) {
    localStorage.setItem('hydra_cart', JSON.stringify(cart));
}

function updateCartCount() {
    const cart = getCart();
    if (cartCount) {
        cartCount.textContent = cart.length;
        cartCount.style.display = cart.length > 0 ? 'block' : 'none';
    }
}

function getItemImage(id) {
    const images = {
        'vip-bronze': 'fas fa-medal',
        'vip-gold': 'fas fa-crown',
        'vip-diamond': 'fas fa-gem'
    };
    return images[id] || 'fas fa-star';
}

// Notification System
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add notification styles if not already present
    if (!document.querySelector('#notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            .notification {
                position: fixed;
                top: 100px;
                right: 20px;
                background: var(--surface);
                border: 1px solid var(--border);
                border-radius: var(--radius-md);
                padding: var(--spacing-md);
                display: flex;
                align-items: center;
                gap: var(--spacing-md);
                z-index: 3000;
                min-width: 300px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                animation: slideInRight 0.3s ease;
            }
            
            .notification-success { border-left: 4px solid var(--success); }
            .notification-error { border-left: 4px solid var(--error); }
            .notification-warning { border-left: 4px solid var(--warning); }
            .notification-info { border-left: 4px solid var(--primary); }
            
            .notification-content {
                display: flex;
                align-items: center;
                gap: var(--spacing-sm);
                flex: 1;
                color: var(--text-primary);
            }
            
            .notification-close {
                background: none;
                border: none;
                color: var(--text-secondary);
                cursor: pointer;
                padding: var(--spacing-xs);
                transition: var(--transition-fast);
            }
            
            .notification-close:hover {
                color: var(--text-primary);
            }
            
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @media (max-width: 768px) {
                .notification {
                    right: 10px;
                    left: 10px;
                    min-width: auto;
                }
            }
        `;
        document.head.appendChild(styles);
    }
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideInRight 0.3s ease reverse';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

function getNotificationIcon(type) {
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    return icons[type] || 'info-circle';
}

// Online Count Animation
function updateOnlineCount() {
    if (!onlineCount) return;
    
    const baseCount = 247;
    const variation = 15;
    
    setInterval(() => {
        const randomChange = Math.floor(Math.random() * variation) - Math.floor(variation / 2);
        const newCount = Math.max(200, baseCount + randomChange);
        
        // Animate the number change
        animateNumber(onlineCount, parseInt(onlineCount.textContent), newCount, 1000);
    }, 30000); // Update every 30 seconds
}

function animateNumber(element, start, end, duration) {
    const startTime = performance.now();
    const difference = end - start;
    
    function updateNumber(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const current = Math.floor(start + (difference * progress));
        element.textContent = current;
        
        if (progress < 1) {
            requestAnimationFrame(updateNumber);
        }
    }
    
    requestAnimationFrame(updateNumber);
}

// Scroll Effects
function initializeScrollEffects() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, observerOptions);
    
    // Observe elements that should fade in
    document.querySelectorAll('.vip-card, .update-card, .step').forEach(el => {
        observer.observe(el);
    });
}

// User Session Management
function checkUserSession() {
    const user = getCurrentUser();
    const loginBtn = document.querySelector('.login-btn');
    
    if (user && loginBtn) {
        loginBtn.textContent = user.nickname;
        loginBtn.href = 'profile.html';
    }
}

function getCurrentUser() {
    const user = localStorage.getItem('hydra_user');
    return user ? JSON.parse(user) : null;
}

// Utility Functions
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function formatPrice(price) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(price);
}

// Error Handling
window.addEventListener('error', function(e) {
    console.error('JavaScript Error:', e.error);
    showNotification('Ocorreu um erro inesperado', 'error');
});

// Prevent right-click on images (optional)
document.addEventListener('contextmenu', function(e) {
    if (e.target.tagName === 'IMG') {
        e.preventDefault();
    }
});

// Export functions for global access
window.copyServerIP = copyServerIP;
window.openDiscord = openDiscord;
window.scrollToStore = scrollToStore;
window.downloadPacks = downloadPacks;
window.addToCart = addToCart;
window.nextSlide = nextSlide;
window.prevSlide = prevSlide;
