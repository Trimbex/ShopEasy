// Product page functionality
document.addEventListener('DOMContentLoaded', function() {
    renderProductDetail();
    updateCartNav();
    renderSimilarProducts();
});
  
function getQueryParam(name) {
    let url = new URL(window.location);
    return url.searchParams.get(name);
}
  
function renderProductDetail() {
    const pid = getQueryParam('id');
    const prod = getProductById(pid);
    const cardContainer = document.getElementById('productCard');
    
    if (!prod) {
      cardContainer.innerHTML = "<div class='alert alert-danger'>Product not found.</div>";
      return;
    }
    
    cardContainer.innerHTML = `
      <div class="product-img-container">
        <img src="${prod.image}" class="product-img" alt="${prod.name}"/>
      </div>
      <div class="product-body">
        <div class="product-title">${prod.name}</div>
        <span class="stock-badge ${prod.stock > 0 ? 'in-stock' : 'out-of-stock'}">
          ${prod.stock > 0 ? 'In Stock' : 'Out of Stock'}
        </span>
        <div class="product-price">$${prod.price.toFixed(2)}</div>
        <div class="product-desc">${prod.desc}</div>
        <div class="quantity-section">
          <button class="qty-btn" id="decreaseQty">-</button>
          <input type="number" min="1" max="${prod.stock}" value="1" id="qtyInput" class="form-control">
          <button class="qty-btn" id="increaseQty">+</button>
        </div>
        <button class="btn btn-primary add-to-cart-btn" id="addToCartBtn" ${prod.stock <= 0 ? 'disabled' : ''}>
          Add to Cart
        </button>
      </div>
    `;
    
    // Add quantity controls
    const qtyInput = document.getElementById('qtyInput');
    const decreaseBtn = document.getElementById('decreaseQty');
    const increaseBtn = document.getElementById('increaseQty');
    
    if (decreaseBtn) {
      decreaseBtn.addEventListener('click', function() {
        let currentQty = parseInt(qtyInput.value) || 1;
        if (currentQty > 1) {
          qtyInput.value = currentQty - 1;
        }
      });
    }
    
    if (increaseBtn) {
      increaseBtn.addEventListener('click', function() {
        let currentQty = parseInt(qtyInput.value) || 1;
        if (currentQty < prod.stock) {
          qtyInput.value = currentQty + 1;
        } else {
          // Show out of stock toast
          const toastMsg = document.getElementById('cartToastMsg');
          toastMsg.textContent = 'Sorry, this item is out of stock!';
          const toastEl = document.getElementById('cartToast');
          const toast = new bootstrap.Toast(toastEl);
          toast.show();
        }
      });
    }
    
    // Add input validation for quantity
    if (qtyInput) {
      qtyInput.addEventListener('change', function() {
        let value = parseInt(this.value) || 1;
        if (value > prod.stock) {
          this.value = prod.stock;
          // Show out of stock toast
          const toastMsg = document.getElementById('cartToastMsg');
          toastMsg.textContent = 'Sorry, this item is out of stock!';
          const toastEl = document.getElementById('cartToast');
          const toast = new bootstrap.Toast(toastEl);
          toast.show();
        } else if (value < 1) {
          this.value = 1;
        }
      });
    }
    
    // Add to cart button
    const addToCartBtn = document.getElementById('addToCartBtn');
    if (addToCartBtn) {
      addToCartBtn.addEventListener('click', function() {
        let qty = parseInt(qtyInput.value) || 1;
        if (qty > 0 && qty <= prod.stock) {
          // Add to cart
          let cart = getCart();
          const idx = cart.findIndex(x => x.id === Number(pid));
          
          if (idx > -1) {
            cart[idx].qty += qty;
          } else {
            cart.push({ id: Number(pid), qty: qty });
          }
          
          setCart(cart);
          updateCartNav();
          
          // Show toast
          const toastMsg = document.getElementById('cartToastMsg');
          toastMsg.textContent = `Added ${qty} to cart!`;
          const toastEl = document.getElementById('cartToast');
          const toast = new bootstrap.Toast(toastEl);
          toast.show();
        }
      });
    }
}

// Render similar products
function renderSimilarProducts() {
    const pid = getQueryParam('id');
    const currentProduct = getProductById(pid);
    if (!currentProduct) return;

    const similarProductsContainer = document.getElementById('similarProducts');
    const allProducts = getAllProducts();
    
    // Get products from the same category, excluding current product
    const similarProducts = allProducts
        .filter(product => 
            product.category === currentProduct.category && 
            product.id !== currentProduct.id
        )
        .slice(0, 4); // Show up to 4 similar products

    if (similarProducts.length === 0) {
        similarProductsContainer.innerHTML = '<div class="col-12"><p class="text-center">No similar products found.</p></div>';
        return;
    }

    let html = '';
    similarProducts.forEach(product => {
        html += `
            <div class="col-md-3 col-sm-6 mb-4">
                <div class="card h-100 product-card">
                    <div class="product-img-container">
                        <img src="${product.image}" class="product-img" alt="${product.name}"/>
                    </div>
                    <div class="product-body">
                        <div class="product-title">${product.name}</div>
                        <span class="stock-badge ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}">
                            ${product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                        </span>
                        <div class="product-price">$${product.price.toFixed(2)}</div>
                        <div class="product-desc">${product.desc.substring(0, 100)}...</div>
                        <div class="d-flex justify-content-between align-items-center mt-3">
                            <a href="product.html?id=${product.id}" class="btn btn-outline-primary">View Details</a>
                            <button class="btn btn-primary add-to-cart-btn" 
                                    onclick="addToCart(${product.id})"
                                    ${product.stock <= 0 ? 'disabled' : ''}>
                                Add to Cart
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });

    similarProductsContainer.innerHTML = html;
}

// Add to cart function for similar products
function addToCart(productId) {
    const product = getProductById(productId);
    if (!product || product.stock <= 0) return;

    let cart = getCart();
    const idx = cart.findIndex(x => x.id === productId);
    
    if (idx > -1) {
        cart[idx].qty += 1;
    } else {
        cart.push({ id: productId, qty: 1 });
    }
    
    setCart(cart);
    updateCartNav();
    
    // Show toast
    const toastMsg = document.getElementById('cartToastMsg');
    toastMsg.textContent = 'Added to cart!';
    const toastEl = document.getElementById('cartToast');
    const toast = new bootstrap.Toast(toastEl);
    toast.show();
}