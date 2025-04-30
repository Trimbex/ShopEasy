// Cart page functionality
function clearCart() {
    if(confirm('Are you sure you want to clear all items from your cart?')) {
      setCart([]);
      renderCart();
      updateCartNav();
    }
  }
  
  function renderCart() {
    const cart = getCart();
    let html = '';
    if (!cart.length) {
      html = `<div class="alert alert-info text-center">Your cart is empty.</div>`;
    } else {
      html = `<div class="cart-header">
        <h2>Your Cart</h2>
        <button id="clearCartBtn">Clear Cart</button>
      </div>
      <table class="table">
        <thead>
          <tr>
            <th></th>
            <th>Product</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Subtotal</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>`;
      let total = 0;
      cart.forEach(item => {
        const prod = getProductById(item.id);
        if (!prod) return;
        let subtotal = prod.price * item.qty;
        total += subtotal;
        html += `<tr>
          <td>
            <img src="${prod.image}" alt="${prod.name}">
          </td>
          <td>${prod.name}</td>
          <td>$${prod.price.toFixed(2)}</td>
          <td>
            <input type="number" min="1" max="${prod.stock}" value="${item.qty}" data-id="${prod.id}" class="form-control form-control-sm qty-input" style="width:65px;margin:auto;">
          </td>
          <td>$${subtotal.toFixed(2)}</td>
          <td>
            <button class="btn btn-sm btn-danger remove-btn" data-id="${prod.id}">×</button>
          </td>
        </tr>`;
      });
      html += `</tbody></table>
        <div class="cart-total">Total: $${total.toFixed(2)}</div>
        <div class="text-end">
          <button class="checkout-btn" id="checkoutBtn">Proceed to Checkout</button>
        </div>
      `;
    }
    document.getElementById('cartTable').innerHTML = html;
  
    // Attach event listeners after DOM is updated
    attachCartEventListeners();
  }
  
  function attachCartEventListeners() {
    // Clear cart button
    const clearCartBtn = document.getElementById('clearCartBtn');
    if (clearCartBtn) {
      clearCartBtn.addEventListener('click', clearCart);
    }
    
    // Checkout button
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', function() {
        window.location.href = 'checkout.html';
      });
    }
  
    // Quantity change events
    document.querySelectorAll('.qty-input').forEach(input => {
      input.addEventListener('change', function() {
        let pid = this.getAttribute('data-id');
        let cart = getCart();
        let idx = cart.findIndex(x => x.id == pid);
        if (idx > -1) {
          let val = Math.max(1, Math.min(Number(this.value), getProductById(pid).stock));
          if (val < Number(this.value)) {
            // Show out of stock toast
            const toastMsg = document.getElementById('cartToastMsg');
            toastMsg.textContent = 'Sorry, this item is out of stock!';
            const toastEl = document.getElementById('cartToast');
            const toast = new bootstrap.Toast(toastEl);
            toast.show();
          }
          cart[idx].qty = val;
          setCart(cart);
          renderCart();
          updateCartNav();
        }
      });
    });
  
    // Remove item buttons
    document.querySelectorAll('.remove-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        let pid = this.getAttribute('data-id');
        let cart = getCart().filter(x => x.id != pid);
        setCart(cart);
        renderCart();
        updateCartNav();
      });
    });
  }
  
  // Initialize the cart page
  document.addEventListener('DOMContentLoaded', function() {
    renderCart();
  });