// JavaScript for Aremu Eatry

function isRestaurantOpen() {
    const now = new Date();
    const hour = now.getHours();
    return hour >= 7 && hour < 20; // 7am to 8pm (20:00)
}

function checkOperatingHours() {
    if (!isRestaurantOpen()) {
        const orderSection = document.getElementById('order');
        const orderForm = document.getElementById('order-form');
        const addToCartButtons = document.querySelectorAll('.add-to-cart');
        const cartIcon = document.getElementById('cart-icon');
        
        // Show closed message
        const closedAlert = document.createElement('div');
        closedAlert.className = 'alert alert-warning alert-dismissible fade show';
        closedAlert.innerHTML = `
            <strong>Restaurant Closed!</strong> We are only open from 7:00 AM to 8:00 PM. Please visit us during business hours.
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        orderSection.insertBefore(closedAlert, orderSection.firstChild);
        
        // Disable ordering
        orderForm.style.pointerEvents = 'none';
        orderForm.style.opacity = '0.5';
        addToCartButtons.forEach(button => {
            button.disabled = true;
        });
        cartIcon.style.pointerEvents = 'none';
        cartIcon.style.opacity = '0.5';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const cartItems = document.getElementById('cart-items');
    const totalElement = document.getElementById('total');
    const orderForm = document.getElementById('order-form');
    const CART_KEY = 'aremusCart';
    const ORDER_DRAFT_KEY = 'aremusOrderDraft';
    let cart = [];
    let total = 0;

    function saveCartToStorage() {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
    }

    function loadCartFromStorage() {
        const savedCart = localStorage.getItem(CART_KEY);
        if (savedCart) {
            try {
                cart = JSON.parse(savedCart) || [];
            } catch (error) {
                cart = [];
            }
        }
    }

    function saveOrderDraft() {
        const draft = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            address: document.getElementById('address').value
        };
        localStorage.setItem(ORDER_DRAFT_KEY, JSON.stringify(draft));
    }

    function loadOrderDraft() {
        const savedDraft = localStorage.getItem(ORDER_DRAFT_KEY);
        if (!savedDraft) return;

        try {
            const draft = JSON.parse(savedDraft);
            document.getElementById('name').value = draft.name || '';
            document.getElementById('email').value = draft.email || '';
            document.getElementById('phone').value = draft.phone || '';
            document.getElementById('address').value = draft.address || '';
        } catch (error) {
            // ignore invalid draft data
        }
    }

    function bindDraftSave() {
        const inputs = document.querySelectorAll('#order-form input, #order-form textarea');
        inputs.forEach(input => {
            input.addEventListener('input', saveOrderDraft);
        });
    }

    loadCartFromStorage();
    updateCart();
    loadOrderDraft();
    bindDraftSave();
    
    // Mobile menu toggle
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mobileNav = document.getElementById('mobile-nav');
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function() {
            if (mobileNav.style.display === 'none') {
                mobileNav.style.display = 'block';
            } else {
                mobileNav.style.display = 'none';
            }
        });
    }
    
    // Close mobile menu when links are clicked
    const mobileLinks = document.querySelectorAll('#mobile-nav a');
    mobileLinks.forEach(link => {
        link.addEventListener('click', function() {
            mobileNav.style.display = 'none';
        });
    });
    
    // Check if restaurant is open
    checkOperatingHours();

    // Add to cart functionality
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function() {
            const item = this.getAttribute('data-item');
            const price = parseFloat(this.getAttribute('data-price'));
            
            // Get quantity from input field, default to one when absent
            const quantityInput = this.parentElement.querySelector('input[type="number"]');
            const quantity = quantityInput ? parseInt(quantityInput.value) || 1 : 1;
            
            // Get meat and soup selections if they exist (for food items)
            const cardBody = this.closest('.card-body');
            const meatSelect = cardBody.querySelector('.meat-select');
            const soupSelect = cardBody.querySelector('.soup-select');
            
            let meat = '';
            let soup = '';
            
            if (meatSelect) {
                meat = meatSelect.value || '';
                if (!meat) {
                    alert(`Please select a meat option for ${item}.`);
                    return;
                }
            }
            if (soupSelect) {
                soup = soupSelect.value || '';
                if (!soup) {
                    alert(`Please select a soup option for ${item}.`);
                    return;
                }
            }
            
            // Add multiple items based on quantity
            for (let i = 0; i < quantity; i++) {
                cart.push({ item, price, meat, soup });
            }
            
            updateCart();
            
            // Animation effect
            this.style.transform = 'scale(1.1)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 200);
        });
    });

    function updateCart() {
        cartItems.innerHTML = '';
        total = 0;
        
        // Group items by their food + soup combination
        const groupedItems = {};
        cart.forEach((item, index) => {
            const soup = item.soup || 'No Soup';
            const key = `${item.item}___${soup}`;
            
            if (!groupedItems[key]) {
                groupedItems[key] = {
                    item: item.item,
                    soup: soup,
                    price: item.price,
                    quantity: 0,
                    indices: []
                };
            }
            groupedItems[key].quantity++;
            groupedItems[key].indices.push(index);
            total += item.price;
        });
        
        // Display grouped items
        Object.keys(groupedItems).forEach((key) => {
            const group = groupedItems[key];
            const li = document.createElement('li');
            li.className = 'list-group-item';
            
            // Create item display with quantity
            let itemDisplay = `<div class="cart-item-info">`;
            itemDisplay += `<strong>${group.quantity}x ${group.item}`;
            if (group.soup && group.soup !== 'No Soup') {
                itemDisplay += ` + ${group.soup}`;
            }
            itemDisplay += `</strong>`;
            itemDisplay += `<br><small>₦${group.price.toFixed(2)} each × ${group.quantity} = ₦${(group.price * group.quantity).toFixed(2)}</small>`;
            itemDisplay += `</div>`;
            
            // Create remove button for all items in this group
            const removeBtn = `<button class="btn btn-sm btn-danger remove-group" data-key="${key}">Remove</button>`;
            
            li.innerHTML = itemDisplay + removeBtn;
            cartItems.appendChild(li);
        });
        
        totalElement.textContent = `Total: ₦${total.toFixed(2)}`;
        
        // Update cart count in nav (both desktop and mobile)
        const cartCount = document.getElementById('cart-count');
        const cartCountMobile = document.getElementById('cart-count-mobile');
        cartCount.textContent = cart.length;
        if (cartCountMobile) {
            cartCountMobile.textContent = cart.length;
        }
        if (cart.length > 0) {
            cartCount.style.display = 'inline';
            if (cartCountMobile) {
                cartCountMobile.style.display = 'inline';
            }
        } else {
            cartCount.style.display = 'none';
            if (cartCountMobile) {
                cartCountMobile.style.display = 'none';
            }
        }

        saveCartToStorage();
        
        // Add remove functionality for groups
        document.querySelectorAll('.remove-group').forEach(button => {
            button.addEventListener('click', function() {
                const key = this.getAttribute('data-key');
                // Remove all items with this key
                const parts = key.split('___');
                const itemName = parts[0];
                const soupName = parts[1];
                
                cart = cart.filter(item => {
                    const itemSoup = item.soup || 'No Soup';
                    return !(item.item === itemName && itemSoup === soupName);
                });
                updateCart();
            });
        });
    }

    // Order form submission
    orderForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (!isRestaurantOpen()) {
            alert('Sorry, we are currently closed. We are open from 7:00 AM to 8:00 PM.');
            return;
        }
        
        if (cart.length === 0) {
            alert('Please add items to your cart before ordering.');
            return;
        }
        
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const address = document.getElementById('address').value;
        
        // Create order object
        const now = new Date();
        const order = {
            id: Date.now(),
            date: now.toLocaleString(),
            name: name,
            email: email,
            phone: phone,
            address: address,
            items: [...cart],
            total: total
        };
        
        // Save to localStorage
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        orders.push(order);
        localStorage.setItem('orders', JSON.stringify(orders));
        
        // Simple order processing (in a real app, this would send to server)
        alert(`Thank you, ${name}! Your order has been placed. Total: ₦${total.toFixed(2)}\n\nWe'll deliver to: ${address}\nContact: ${phone}`);
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('cartModal'));
        if (modal) {
            modal.hide();
        }
        
        // Reset cart and form
        cart = [];
        updateCart();
        orderForm.reset();
        localStorage.removeItem(CART_KEY);
        localStorage.removeItem(ORDER_DRAFT_KEY);
    });

    // Smooth scrolling for navigation
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href && href !== '#' && document.querySelector(href)) {
                e.preventDefault();
                document.querySelector(href).scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
});