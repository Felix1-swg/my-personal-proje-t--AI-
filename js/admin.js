// JavaScript for Admin Orders Page

let lastOrderCount = 0;

function deleteOrder(orderId) {
    if (confirm('Are you sure you want to delete this order?')) {
        let orders = JSON.parse(localStorage.getItem('orders')) || [];
        orders = orders.filter(order => order.id !== orderId);
        localStorage.setItem('orders', JSON.stringify(orders));
        displayOrders();
    }
}

function displayOrders() {
    const ordersContainer = document.getElementById('orders-container');
    
    // Load orders from localStorage
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    
    if (orders.length === 0) {
        ordersContainer.innerHTML = '<p class="text-center text-muted">No orders yet. Orders will appear here when customers place them.</p>';
        lastOrderCount = 0;
        return;
    }
    
    // Display orders
    ordersContainer.innerHTML = '';
    orders.forEach(order => {
        const orderDiv = document.createElement('div');
        orderDiv.className = 'card mb-4';
        orderDiv.innerHTML = `
            <div class="card-header d-flex justify-content-between align-items-center">
                <div>
                    <h5>Order #${order.id}</h5>
                    <small class="text-muted">${order.date}</small>
                </div>
                <button class="btn btn-sm btn-danger" onclick="deleteOrder(${order.id})">Delete Order</button>
            </div>
            <div class="card-body">
                <div class="row">
                    <div class="col-md-6">
                        <h6>Customer Details:</h6>
                        <p><strong>Name:</strong> ${order.name}</p>
                        <p><strong>Email:</strong> ${order.email}</p>
                        <p><strong>Phone:</strong> ${order.phone}</p>
                        <p><strong>Address:</strong> ${order.address}</p>
                    </div>
                    <div class="col-md-6">
                        <h6>Order Items:</h6>
                        <ul class="list-group">
                            ${order.items.map(item => {
                                let itemText = `${item.item} - ₦${item.price.toFixed(2)}`;
                                if (item.meat || item.soup) {
                                    itemText += `<br><small>(${item.meat || 'No meat'} + ${item.soup || 'No soup'})</small>`;
                                }
                                return `<li class="list-group-item">${itemText}</li>`;
                            }).join('')}
                        </ul>
                        <p class="mt-2"><strong>Total: ₦${order.total.toFixed(2)}</strong></p>
                    </div>
                </div>
            </div>
        `;
        ordersContainer.appendChild(orderDiv);
    });
    
    lastOrderCount = orders.length;
}

document.addEventListener('DOMContentLoaded', function() {
    // Display orders on page load
    displayOrders();
    
    // Auto-refresh orders every 2 seconds to show new orders in real-time
    setInterval(function() {
        displayOrders();
    }, 2000);
});