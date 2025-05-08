// 1. DATA & UTILS
const PRODUCTS = [
    { id: 1, name: "Wireless Headphones", desc: "High quality sound. Bluetooth enabled. 30hr battery.", image: "https://picsum.photos/seed/phones/370/370", stock: 35, price: 40.99 },
    { id: 2, name: "Smart Watch", desc: "Track your fitness & notifications in style.", image: "https://picsum.photos/seed/watch/370/370", stock: 0, price: 99.99 },
    { id: 3, name: "Coffee Mug", desc: "Cozy up with a big 500ml ceramic mug.", image: "https://picsum.photos/seed/mug/370/370", stock: 120, price: 14.50 },
    { id: 4, name: "Notebook", desc: "80 lined pages for big ideas.", image: "https://picsum.photos/seed/book/370/370", stock: 55, price: 7.90 },
    { id: 5, name: "Bluetooth Speaker", desc: "Portable & powerful with deep bass.", image: "https://picsum.photos/seed/speaker/370/370", stock: 7, price: 29.50 }
  ];
  
  function getCart() { return JSON.parse(localStorage.getItem('cart') || '[]'); }
  function setCart(arr) { localStorage.setItem('cart', JSON.stringify(arr)); }
  function addToCart(productId) {
    let cart = getCart();
    productId = Number(productId);
    const idx = cart.findIndex(x => x.id === productId);
    if (idx > -1) { cart[idx].qty++; } else { cart.push({ id: productId, qty: 1 }); }
    setCart(cart); updateCartNav();
  }
  function getProductById(id) { return PRODUCTS.find(p => Number(p.id) === Number(id)); }
  
  // 2. DARK MODE TOGGLE
  function setDarkMode(on) {
    document.body.classList.toggle('dark-mode', on);
    localStorage.setItem('darkMode', on ? 'true' : 'false');
    const dmt = document.getElementById('darkModeToggle');
    if (dmt) dmt.checked = on;
  }
  
  // 3. UI EVENT HOOKS
  document.addEventListener('DOMContentLoaded', function() {
    // Restore dark mode
    setDarkMode(localStorage.getItem('darkMode') === 'true');
    const darkToggle = document.getElementById('darkModeToggle');
    if (darkToggle) {
      darkToggle.checked = document.body.classList.contains('dark-mode');
      darkToggle.addEventListener('change', function() { setDarkMode(this.checked); });
    }
  
    // -- RENDER PRODUCTS --
    if(document.getElementById('product-grid')) renderProducts(PRODUCTS);
  
    // -- SEARCH --
    const search = document.getElementById('searchInput');
    if (search) {
      search.addEventListener('input', function() {
        const q = this.value.toLowerCase();
        renderProducts(PRODUCTS.filter(prod =>
          prod.name.toLowerCase().includes(q) || prod.desc.toLowerCase().includes(q)
        ));
      });
    }
    // -- CART BADGE --
    updateCartNav();
  });
  
  // 4. RENDER PRODUCTS
  function renderProducts(products) {
    const grid = document.getElementById('product-grid');
    if (!grid) return;
    grid.innerHTML = "";
    products.forEach(prod => {
      grid.innerHTML += `
        <div class="col-12 col-sm-6 col-lg-4 col-xl-3">
          <div class="card h-100 shadow-sm">
            <img src="${prod.image}" alt="${prod.name}" class="card-img-top" style="object-fit:cover;height:180px;">
            <div class="card-body text-center">
              <div class="card-title fw-bold mb-1">${prod.name}</div>
              <div class="mb-1">
                <span class="fw-semibold text-success" style="font-size:1.1em;">$${prod.price.toFixed(2)}</span>
              </div>
              <div class="text-muted small mb-2">
                ${prod.stock > 0 ? `<span class="badge badge-stock">In Stock</span>` : `<span class="badge bg-danger">Out of stock</span>`}
              </div>
              <div class="mb-2">${prod.desc}</div>
              <div class="d-flex justify-content-center gap-2">
                <a href="product.html?id=${prod.id}" class="btn btn-warning w-50">View</a>
                <button class="btn btn-outline-secondary add-cart-btn" ${prod.stock == 0 ? "disabled" : ""} data-id="${prod.id}" title="Add to Cart">&#128722;</button>
              </div>
            </div>
          </div>
        </div>
      `;
    });
    // Attach add-to-cart events
    document.querySelectorAll('.add-cart-btn').forEach(btn => {
      btn.onclick = function() {
        addToCart(this.getAttribute('data-id'));
        showCartToast("Added to cart!");
      };
    });
  }
  
  // 5. TOAST
  function showCartToast(msg) {
    const toastMsg = document.getElementById('cartToastMsg');
    const toastEl = document.getElementById('cartToast');
    toastMsg.textContent = msg;
    const toast = new bootstrap.Toast(toastEl);
    toast.show();
  }
  
  // 6. CART BADGE
  function updateCartNav() {
    const cart = getCart();
    const cartCount = cart.reduce((s, x) => s + x.qty, 0);
    const badge = document.getElementById('cartBadge');
    if (badge) {
      badge.innerText = cartCount || '';
      badge.style.display = cartCount ? 'inline-block' : 'none';
    }
  }
  
  // -- Export for product page
// Expose for product page and cart page
window.getCart = getCart;
window.setCart = setCart;
window.addToCart = addToCart;

// ==== PRODUCT PAGE LOGIC ====
if (document.getElementById('productDetails')) {
  renderProductDetail();
}

function renderProductDetail() {
  // Get ?id=... from URL
  const urlParams = new URLSearchParams(window.location.search);
  const pid = urlParams.get('id');
  const prod = getProductById(pid);
  const container = document.getElementById('productDetails');
  if (!prod) {
    container.innerHTML = "<div class='alert alert-danger'>Product not found.</div>";
    return;
  }
  // Render the product card with quantity input and button
  container.innerHTML = `
    <img src="${prod.image}" class="product-img mb-1" alt="${prod.name}"/>
    <div class="product-title">${prod.name}</div>
    <span class="badge badge-stock mb-2">${prod.stock > 0 ? "In Stock" : "Out of Stock"}</span>
    <div class="product-desc mb-3">${prod.desc}</div>
    <div class="input-group mb-3 justify-content-center" style="max-width: 160px; margin: 0 auto;">
      <input type="number" min="1" max="${prod.stock}" value="1" id="qtyInput" class="form-control text-center" style="width:75px;">
      <button class="btn btn-warning fw-bold" type="button" id="addToCartBtn" style="min-width:120px">Add to Cart</button>
    </div>
  `;

  // Add-to-cart logic
  document.getElementById('addToCartBtn').onclick = function() {
    const qty = Math.max(1, Math.min(prod.stock, Number(document.getElementById('qtyInput').value || 1)));
    let cart = getCart();
    const idx = cart.findIndex(x => x.id === prod.id);
    if (idx > -1) {
      cart[idx].qty += qty;
    } else {
      cart.push({ id: prod.id, qty: qty });
    }
    setCart(cart);
    updateCartNav();
    showCartToast(`Added ${qty} to cart!`);
  };
}


// ==== CART PAGE LOGIC ====
if (document.getElementById('cartTable')) renderCart();

function renderCart() {
  const cart = getCart();
  let html = '';
  if (!cart.length) {
    html = `<div class="alert alert-info text-center">Your cart is empty.</div>`;
  } else {
    html = `<table class="table align-middle text-center table-bordered">
      <thead>
        <tr><th></th><th>Product</th><th>Price</th><th>Quantity</th><th>Subtotal</th><th>Action</th></tr>
      </thead><tbody>`;
    let total = 0;
    cart.forEach(item => {
      const prod = getProductById(item.id);
      if (!prod) return;
      let subtotal = prod.price * item.qty;
      total += subtotal;
      html += `<tr>
        <td style="width:68px"><img src="${prod.image}" width="60" style="border-radius:8px;"></td>
        <td>${prod.name}</td>
        <td>$${prod.price.toFixed(2)}</td>
        <td>
          <input type="number" min="1" max="${prod.stock}" value="${item.qty}" data-id="${prod.id}" class="form-control form-control-sm qty-input" style="width:65px;margin:auto;">
        </td>
        <td>$${subtotal.toFixed(2)}</td>
        <td>
          <button class="btn btn-sm btn-danger remove-btn" data-id="${prod.id}">&times;</button>
        </td>
      </tr>`;
    });
    html += `</tbody></table>
      <div class="text-end fw-bold fs-5">Total: $${total.toFixed(2)}</div>
      <div class="text-end">
        <button class="btn btn-success mt-3" onclick="alert('Checkout logic here!')">Proceed to Checkout</button>
      </div>
    `;
  }
  document.getElementById('cartTable').innerHTML = html;

  // Quantity change
  document.querySelectorAll('.qty-input').forEach(input => {
    input.addEventListener('change', function() {
      let pid = this.getAttribute('data-id');
      let cart = getCart();
      let idx = cart.findIndex(x => x.id == pid);
      if (idx > -1) {
        let val = Math.max(1, Math.min(Number(this.value), getProductById(pid).stock));
        cart[idx].qty = val;
        setCart(cart);
        renderCart();
        updateCartNav();
      }
    });
  });

  // Remove from cart
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

// Cart nav badge: called after all cart changes, and on page load
function updateCartNav() {
  const cart = getCart();
  const cartCount = cart.reduce((s, x) => s + x.qty, 0);
  const badge = document.getElementById('cartBadge');
  if (badge) {
    badge.innerText = cartCount || '';
    badge.style.display = cartCount ? 'inline-block' : 'none';
  }
}