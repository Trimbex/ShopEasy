// Constants for calculations
const SHIPPING_RATE = 5.99;
const TAX_RATE = 0.08; // 8% tax rate

// Initialize the checkout page
document.addEventListener('DOMContentLoaded', function() {
    renderOrderSummary();
    attachEventListeners();
});

// Render the order summary
function renderOrderSummary() {
    const cart = getCart();
    const orderSummary = document.getElementById('orderSummary');
    let html = '';
    let subtotal = 0;

    if (!cart.length) {
        window.location.href = 'cart.html';
        return;
    }

    cart.forEach(item => {
        const product = getProductById(item.id);
        if (!product) return;
        
        const itemTotal = product.price * item.qty;
        subtotal += itemTotal;

        html += `
            <div class="d-flex justify-content-between align-items-center mb-2">
                <div>
                    <h6 class="mb-0">${product.name}</h6>
                    <small class="text-muted">Qty: ${item.qty}</small>
                </div>
                <span>$${itemTotal.toFixed(2)}</span>
            </div>
        `;
    });

    orderSummary.innerHTML = html;

    // Calculate and update totals
    const shipping = subtotal > 0 ? SHIPPING_RATE : 0;
    const tax = subtotal * TAX_RATE;
    const total = subtotal + shipping + tax;

    document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('shipping').textContent = `$${shipping.toFixed(2)}`;
    document.getElementById('tax').textContent = `$${tax.toFixed(2)}`;
    document.getElementById('total').textContent = `$${total.toFixed(2)}`;
}

// Attach event listeners
function attachEventListeners() {
    // Place order button
    const placeOrderBtn = document.getElementById('placeOrderBtn');
    placeOrderBtn.addEventListener('click', handlePlaceOrder);

    // Form validation
    const form = document.getElementById('checkoutForm');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
    });

    // Card number formatting
    const cardNumber = document.getElementById('cardNumber');
    cardNumber.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        value = value.replace(/(\d{4})/g, '$1 ').trim();
        e.target.value = value;
    });

    // Expiry date formatting
    const expiry = document.getElementById('expiry');
    expiry.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.slice(0, 2) + '/' + value.slice(2, 4);
        }
        e.target.value = value;
    });

    // CVV validation
    const cvv = document.getElementById('cvv');
    cvv.addEventListener('input', function(e) {
        e.target.value = e.target.value.replace(/\D/g, '').slice(0, 3);
    });
}

// Handle place order
async function handlePlaceOrder() {
    const form = document.getElementById('checkoutForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    // Get form data
    const formData = {
        shipping: {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            email: document.getElementById('email').value,
            address: document.getElementById('address').value,
            city: document.getElementById('city').value,
            state: document.getElementById('state').value,
            zip: document.getElementById('zip').value
        },
        payment: {
            cardName: document.getElementById('cardName').value,
            cardNumber: document.getElementById('cardNumber').value.replace(/\s/g, ''),
            expiry: document.getElementById('expiry').value,
            cvv: document.getElementById('cvv').value
        },
        order: {
            items: getCart(),
            subtotal: parseFloat(document.getElementById('subtotal').textContent.replace('$', '')),
            shipping: parseFloat(document.getElementById('shipping').textContent.replace('$', '')),
            tax: parseFloat(document.getElementById('tax').textContent.replace('$', '')),
            total: parseFloat(document.getElementById('total').textContent.replace('$', ''))
        }
    };

    try {
        // Here you would typically make an API call to your backend
        // For now, we'll simulate a successful order
        await simulateOrderPlacement(formData);
        
        // Clear the cart
        setCart([]);
        updateCartNav();
        
        // Show success message and redirect
        alert('Order placed successfully! Thank you for your purchase.');
        window.location.href = 'index.html';
    } catch (error) {
        alert('There was an error processing your order. Please try again.');
        console.error('Order placement error:', error);
    }
}

// Simulate order placement (replace with actual API call)
function simulateOrderPlacement(orderData) {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log('Order placed:', orderData);
            resolve();
        }, 1000);
    });
} 