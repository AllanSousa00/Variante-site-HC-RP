// Cart JavaScript for Hydra City RP

// DOM Elements
const cartItemsContainer = document.getElementById('cart-items');
const emptyCartContainer = document.getElementById('empty-cart');
const subtotalElement = document.getElementById('subtotal');
const discountElement = document.getElementById('discount');
const totalElement = document.getElementById('total');
const couponInput = document.getElementById('coupon-code');
const checkoutModal = document.getElementById('checkout-modal');

// Cart state
let currentDiscount = 0;
let appliedCoupon = null;

// Valid coupons
const validCoupons = {
    'HYDRA10': { discount: 0.10, description: '10% de desconto' },
    'VIP20': { discount: 0.20, description: '20% de desconto' },
    'WELCOME15': { discount: 0.15, description: '15% de desconto para novos usuários' },
    'BLACKFRIDAY': { discount: 0.30, description: '30% de desconto Black Friday' }
};

// Initialize cart page
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('cart.html')) {
        initializeCart();
        loadCartItems();
        updateCartSummary();
    }
});

function initializeCart() {
    // Update cart count in navigation
    updateCartCount();
    
    // Add event listeners
    if (couponInput) {
        couponInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                applyCoupon();
            }
        });
    }
    
    // Close modal when clicking outside
    if (checkoutModal) {
        checkoutModal.addEventListener('click', function(e) {
            if (e.target === checkoutModal) {
                closeModal();
            }
        });
    }
}

function loadCartItems() {
    const cart = getCart();
    
    if (cart.length === 0) {
        showEmptyCart();
        return;
    }
    
    showCartItems();
    renderCartItems(cart);
}

function showEmptyCart() {
    if (cartItemsContainer) cartItemsContainer.style.display = 'none';
    if (emptyCartContainer) emptyCartContainer.classList.remove('hidden');
    document.querySelector('.cart-summary').style.display = 'none';
}

function showCartItems() {
    if (cartItemsContainer) cartItemsContainer.style.display = 'block';
    if (emptyCartContainer) emptyCartContainer.classList.add('hidden');
    document.querySelector('.cart-summary').style.display = 'block';
}

function renderCartItems(cart) {
    if (!cartItemsContainer) return;
    
    cartItemsContainer.innerHTML = '';
    
    cart.forEach((item, index) => {
        const cartItemElement = createCartItemElement(item, index);
        cartItemsContainer.appendChild(cartItemElement);
    });
}

function createCartItemElement(item, index) {
    const cartItem = document.createElement('div');
    cartItem.className = 'cart-item';
    cartItem.setAttribute('data-item-id', item.id);
    
    cartItem.innerHTML = `
        <div class="item-image">
            <i class="${item.image}"></i>
        </div>
        <div class="item-details">
            <h3 class="item-name">${item.name}</h3>
            <p class="item-description">${getItemDescription(item.id)}</p>
        </div>
        <div class="item-price">${formatPrice(item.price)}</div>
        <button class="remove-item" onclick="removeFromCart('${item.id}')">
            <i class="fas fa-trash"></i>
        </button>
    `;
    
    return cartItem;
}

function getItemDescription(itemId) {
    const descriptions = {
        'vip-bronze': 'Pacote VIP Bronze com benefícios básicos',
        'vip-gold': 'Pacote VIP Ouro com benefícios premium',
        'vip-diamond': 'Pacote VIP Diamante com todos os benefícios'
    };
    return descriptions[itemId] || 'Produto premium do Hydra City RP';
}

function removeFromCart(itemId) {
    const cart = getCart();
    const itemIndex = cart.findIndex(item => item.id === itemId);
    
    if (itemIndex === -1) return;
    
    // Add removing animation
    const itemElement = document.querySelector(`[data-item-id="${itemId}"]`);
    if (itemElement) {
        itemElement.classList.add('removing');
        
        setTimeout(() => {
            // Remove from cart array
            cart.splice(itemIndex, 1);
            saveCart(cart);
            
            // Update UI
            updateCartCount();
            loadCartItems();
            updateCartSummary();
            
            // Show notification
            showNotification('Item removido do carrinho', 'info');
        }, 300);
    }
}

function updateCartSummary() {
    const cart = getCart();
    const subtotal = calculateSubtotal(cart);
    const discount = calculateDiscount(subtotal);
    const total = subtotal - discount;
    
    if (subtotalElement) {
        subtotalElement.textContent = formatPrice(subtotal);
    }
    
    if (discountElement) {
        discountElement.textContent = formatPrice(discount);
        discountElement.parentElement.style.display = discount > 0 ? 'flex' : 'none';
    }
    
    if (totalElement) {
        totalElement.textContent = formatPrice(total);
    }
}

function calculateSubtotal(cart) {
    return cart.reduce((sum, item) => sum + item.price, 0);
}

function calculateDiscount(subtotal) {
    return subtotal * currentDiscount;
}

function applyCoupon() {
    const couponCode = couponInput.value.trim().toUpperCase();
    
    if (!couponCode) {
        showNotification('Digite um código promocional', 'warning');
        return;
    }
    
    if (appliedCoupon) {
        showNotification('Você já aplicou um cupom', 'warning');
        return;
    }
    
    const coupon = validCoupons[couponCode];
    
    if (!coupon) {
        showNotification('Código promocional inválido', 'error');
        couponInput.value = '';
        return;
    }
    
    // Apply coupon
    appliedCoupon = couponCode;
    currentDiscount = coupon.discount;
    
    // Update UI
    updateCartSummary();
    couponInput.value = '';
    couponInput.placeholder = `Cupom aplicado: ${couponCode}`;
    couponInput.disabled = true;
    
    // Update button
    const applyButton = document.querySelector('.coupon-container .btn');
    applyButton.textContent = 'Aplicado';
    applyButton.disabled = true;
    applyButton.style.background = 'var(--success)';
    
    showNotification(`Cupom aplicado! ${coupon.description}`, 'success');
}

function removeCoupon() {
    appliedCoupon = null;
    currentDiscount = 0;
    
    // Reset UI
    couponInput.placeholder = 'Código promocional';
    couponInput.disabled = false;
    couponInput.value = '';
    
    const applyButton = document.querySelector('.coupon-container .btn');
    applyButton.textContent = 'Aplicar';
    applyButton.disabled = false;
    applyButton.style.background = '';
    
    updateCartSummary();
    showNotification('Cupom removido', 'info');
}

function checkout() {
    const cart = getCart();
    
    if (cart.length === 0) {
        showNotification('Seu carrinho está vazio', 'warning');
        return;
    }
    
    // Check if user is logged in
    const user = getCurrentUser();
    if (!user) {
        showNotification('Faça login para finalizar a compra', 'warning');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
        return;
    }
    
    // Show checkout modal
    showCheckoutModal();
    
    // Save order to user's history (simulation)
    saveOrderToHistory(cart, user);
}

function showCheckoutModal() {
    if (checkoutModal) {
        checkoutModal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal() {
    if (checkoutModal) {
        checkoutModal.classList.remove('show');
        document.body.style.overflow = '';
    }
}

function saveOrderToHistory(cart, user) {
    const orders = getOrderHistory(user.id);
    const subtotal = calculateSubtotal(cart);
    const discount = calculateDiscount(subtotal);
    const total = subtotal - discount;
    
    const order = {
        id: generateOrderId(),
        userId: user.id,
        items: [...cart],
        subtotal: subtotal,
        discount: discount,
        total: total,
        coupon: appliedCoupon,
        status: 'Pendente',
        date: new Date().toISOString()
    };
    
    orders.push(order);
    localStorage.setItem(`hydra_orders_${user.id}`, JSON.stringify(orders));
}

function getOrderHistory(userId) {
    const orders = localStorage.getItem(`hydra_orders_${userId}`);
    return orders ? JSON.parse(orders) : [];
}

function generateOrderId() {
    return 'ORDER_' + Date.now().toString(36).toUpperCase();
}

function clearCart() {
    saveCart([]);
    updateCartCount();
    loadCartItems();
    updateCartSummary();
    
    // Reset coupon
    if (appliedCoupon) {
        removeCoupon();
    }
    
    showNotification('Carrinho limpo', 'info');
}

// Utility functions (reuse from main.js)
function getCart() {
    const cart = localStorage.getItem('hydra_cart');
    return cart ? JSON.parse(cart) : [];
}

function saveCart(cart) {
    localStorage.setItem('hydra_cart', JSON.stringify(cart));
}

function updateCartCount() {
    const cart = getCart();
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        cartCount.textContent = cart.length;
        cartCount.style.display = cart.length > 0 ? 'block' : 'none';
    }
}

function formatPrice(price) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(price);
}

function getCurrentUser() {
    let user = localStorage.getItem('hydra_user');
    if (!user) {
        user = sessionStorage.getItem('hydra_user');
    }
    return user ? JSON.parse(user) : null;
}

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

function openDiscord() {
    window.open('https://discord.gg/hydracityrp', '_blank');
}

// Export functions for global access
window.removeFromCart = removeFromCart;
window.applyCoupon = applyCoupon;
window.checkout = checkout;
window.closeModal = closeModal;
window.clearCart = clearCart;
window.openDiscord = openDiscord;
