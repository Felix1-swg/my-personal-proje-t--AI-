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
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const cartItems = document.getElementById('cart-items');
    const totalElement = document.getElementById('total');
    const orderForm = document.getElementById('order-form');
    let cart = [];
    let total = 0;
    
    // Check if restaurant is open
    checkOperatingHours();

    // Add to cart functionality
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function() {
            const item = this.getAttribute('data-item');
            const price = parseFloat(this.getAttribute('data-price'));
            
            // Get quantity from input field
            const quantityInput = this.parentElement.querySelector('input[type="number"]');
            const quantity = parseInt(quantityInput.value) || 1;
            
            // Get meat and soup selections if they exist (for food items)
            const cardBody = this.closest('.card-body');
            const meatSelect = cardBody.querySelector('.meat-select');
            const soupSelect = cardBody.querySelector('.soup-select');
            
            let meat = '';
            let soup = '';
            
            if (meatSelect) {
                meat = meatSelect.value || '';
            }
            if (soupSelect) {
                soup = soupSelect.value || '';
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
        
        cart.forEach((item, index) => {
            total += item.price;
            const li = document.createElement('li');
            li.className = 'list-group-item';
            
            let itemDisplay = `${item.item} - ₦${item.price.toFixed(2)}`;
            if (item.meat || item.soup) {
                itemDisplay += `<br><small>(${item.meat || 'No meat'} + ${item.soup || 'No soup'})</small>`;
            }
            
            li.innerHTML = `
                ${itemDisplay}
                <button class="btn btn-sm btn-danger remove-item" data-index="${index}">Remove</button>
            `;
            cartItems.appendChild(li);
        });
        
        totalElement.textContent = `Total: ₦${total.toFixed(2)}`;
        
        // Add remove functionality
        document.querySelectorAll('.remove-item').forEach(button => {
            button.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                cart.splice(index, 1);
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
        const meat = document.getElementById('meat').value;
        const soup = document.getElementById('soup').value;
        
        // Validate meat and soup selections
        if (!meat) {
            alert('Please select a meat option.');
            return;
        }
        if (!soup) {
            alert('Please select a soup option.');
            return;
        }
        
        // Create order object
        const now = new Date();
        const order = {
            id: Date.now(),
            date: now.toLocaleString(),
            name: name,
            email: email,
            phone: phone,
            address: address,
            meat: meat,
            soup: soup,
            items: [...cart],
            total: total
        };
        
        // Save to localStorage
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        orders.push(order);
        localStorage.setItem('orders', JSON.stringify(orders));
        
        // Simple order processing (in a real app, this would send to server)
        alert(`Thank you, ${name}! Your order has been placed. Total: ₦${total.toFixed(2)}\n\nMeat: ${meat}\nSoup: ${soup}\n\nWe'll deliver to: ${address}\nContact: ${phone}`);
        
        // Reset cart and form
        cart = [];
        updateCart();
        orderForm.reset();
    });

    // Smooth scrolling for navigation
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
});