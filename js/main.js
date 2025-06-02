// === App State ===
let currentUser = JSON.parse(localStorage.getItem('user')) || null;
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
let products = [
    {
        id: 1,
        name: "Örnek Ürün 1",
        description: "Bu bir örnek ürün açıklamasıdır.",
        price: 99.99,
        stock: 50,
        category_id: 1,
        image: "https://via.placeholder.com/150"
    },
    {
        id: 2,
        name: "Örnek Ürün 2",
        description: "Bu başka bir örnek ürün açıklamasıdır.",
        price: 149.99,
        stock: 30,
        category_id: 2,
        image: "https://via.placeholder.com/150"
    }
];
let categories = [
    { id: 1, name: "Elektronik" },
    { id: 2, name: "Giyim" }
];

// === DOM Elements ===
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const logoutBtn = document.getElementById('logoutBtn');
const authButtons = document.getElementById('authButtons');
const userMenu = document.getElementById('userMenu');
const userNameDisplay = document.getElementById('userNameDisplay');
const cartBadge = document.querySelector('.cart-badge');
const favoritesBadge = document.querySelector('.favorites-badge');
const productList = document.getElementById('productList');
const categoryList = document.getElementById('categoryList');
const searchInput = document.querySelector('.search-box input');

// === Bootstrap Modals ===
const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
const registerModal = new bootstrap.Modal(document.getElementById('registerModal'));
const productModal = new bootstrap.Modal(document.getElementById('productModal'));
const categoryModal = new bootstrap.Modal(document.getElementById('categoryModal'));

// === Event Listeners ===
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
    loadInitialData();
});

// === Initialization Functions ===
function initializeApp() {
    updateUI();
    updateCartBadge();
    updateFavoritesBadge();
}

function setupEventListeners() {
    // Auth buttons
    if (loginBtn) loginBtn.addEventListener('click', () => loginModal.show());
    if (registerBtn) registerBtn.addEventListener('click', () => registerModal.show());
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);

    // Forms
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const productForm = document.getElementById('productForm');
    const categoryForm = document.getElementById('categoryForm');

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    if (productForm) {
        productForm.addEventListener('submit', handleProductSubmit);
    }
    if (categoryForm) {
        categoryForm.addEventListener('submit', handleCategorySubmit);
    }

    // Search functionality
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 300));
    }
}

function loadInitialData() {
    renderProducts();
    renderCategories();
}

// === Authentication Functions ===
function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    // Demo kullanıcı kontrolü
    if (email === "demo@example.com" && password === "demo123") {
        currentUser = {
            id: 1,
            name: "Demo Kullanıcı",
            email: email
        };
        localStorage.setItem('user', JSON.stringify(currentUser));
        updateUI();
        loginModal.hide();
        showToast('Giriş başarılı!', 'success');
    } else {
        showToast('Geçersiz email veya şifre', 'error');
    }
}

function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    
    // Demo kayıt
    currentUser = {
        id: Date.now(),
        name: name,
        email: email
    };
    localStorage.setItem('user', JSON.stringify(currentUser));
    showToast('Kayıt başarılı!', 'success');
    registerModal.hide();
    updateUI();
}

function handleLogout() {
    localStorage.removeItem('user');
    currentUser = null;
    updateUI();
    showToast('Çıkış yapıldı', 'info');
}

// === Product Management Functions ===
function handleProductSubmit(e) {
    e.preventDefault();
    
    if (!currentUser) {
        showToast('Lütfen önce giriş yapın', 'warning');
        return;
    }
    
    const formData = new FormData(e.target);
    const newProduct = {
        id: Date.now(),
        name: formData.get('name'),
        description: formData.get('description'),
        price: parseFloat(formData.get('price')),
        stock: parseInt(formData.get('stock')),
        category_id: parseInt(formData.get('category')),
        image: "https://via.placeholder.com/150"
    };
    
    products.push(newProduct);
    renderProducts();
    productModal.hide();
    showToast('Ürün başarıyla eklendi', 'success');
}

// === Cart Functions ===
function addToCart(product) {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }
    
    saveCart();
    updateCartBadge();
    showToast('Ürün sepete eklendi', 'success');
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartBadge();
    showToast('Ürün sepetten kaldırıldı', 'info');
}

function updateCartQuantity(productId, quantity) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity = quantity;
        saveCart();
        updateCartBadge();
    }
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartBadge() {
    if (cartBadge) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartBadge.textContent = totalItems;
    }
}

// === Favorites Functions ===
function toggleFavorite(product) {
    const index = favorites.findIndex(fav => fav.id === product.id);
    
    if (index === -1) {
        favorites.push(product);
        showToast('Ürün favorilere eklendi', 'success');
    } else {
        favorites.splice(index, 1);
        showToast('Ürün favorilerden kaldırıldı', 'info');
    }
    
    saveFavorites();
    updateFavoritesBadge();
}

function saveFavorites() {
    localStorage.setItem('favorites', JSON.stringify(favorites));
}

function updateFavoritesBadge() {
    if (favoritesBadge) {
        favoritesBadge.textContent = favorites.length;
    }
}

// === Search Function ===
function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    const filteredProducts = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm)
    );
    renderProducts(filteredProducts);
}

// === UI Update Functions ===
function updateUI() {
    if (currentUser) {
        if (authButtons) authButtons.style.display = 'none';
        if (userMenu) userMenu.style.display = 'block';
        if (userNameDisplay) userNameDisplay.textContent = currentUser.name;
    } else {
        if (authButtons) authButtons.style.display = 'block';
        if (userMenu) userMenu.style.display = 'none';
    }
}

function renderProducts(productsToRender = products) {
    if (!productList) return;
    
    productList.innerHTML = productsToRender.map(product => `
        <div class="col-md-4 mb-4">
            <div class="card h-100">
                <img src="${product.image}" class="card-img-top" alt="${product.name}">
                <div class="card-body">
                    <h5 class="card-title">${product.name}</h5>
                    <p class="card-text">${product.description}</p>
                    <p class="card-text"><strong>Fiyat: </strong>${formatCurrency(product.price)}</p>
                    <p class="card-text"><strong>Stok: </strong>${product.stock}</p>
                    <button class="btn btn-primary" onclick="addToCart(${JSON.stringify(product)})">
                        Sepete Ekle
                    </button>
                    <button class="btn btn-outline-danger" onclick="toggleFavorite(${JSON.stringify(product)})">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function renderCategories() {
    if (!categoryList) return;
    
    categoryList.innerHTML = categories.map(category => `
        <li class="list-group-item">
            <a href="#" class="text-decoration-none">${category.name}</a>
        </li>
    `).join('');
}

// === Utility Functions ===
function formatCurrency(amount) {
    return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY'
    }).format(amount);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type} border-0`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;
    
    document.body.appendChild(toast);
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
    
    toast.addEventListener('hidden.bs.toast', () => {
        document.body.removeChild(toast);
    });
} 