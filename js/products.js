// DOM Elements
const productsList = document.querySelector('#productsList');
const addProductForm = document.querySelector('#addProductForm');
const editProductForm = document.querySelector('#editProductForm');
const categorySelect = document.querySelector('#categorySelect');
const editCategorySelect = document.querySelector('#editCategorySelect');

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    loadCategories();
});

if (addProductForm) {
    addProductForm.addEventListener('submit', handleAddProduct);
}

if (editProductForm) {
    editProductForm.addEventListener('submit', handleEditProduct);
}

// Functions
function loadProducts() {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    renderProducts(products);
}

function loadCategories() {
    const categories = JSON.parse(localStorage.getItem('categories')) || [];
    
    if (categorySelect) {
        categorySelect.innerHTML = `
            <option value="">Kategori Seçin</option>
            ${categories.map(category => `
                <option value="${category.name}">${category.name}</option>
            `).join('')}
        `;
    }

    if (editCategorySelect) {
        editCategorySelect.innerHTML = `
            <option value="">Kategori Seçin</option>
            ${categories.map(category => `
                <option value="${category.name}">${category.name}</option>
            `).join('')}
        `;
    }
}

function renderProducts(products) {
    if (!productsList) return;

    if (products.length === 0) {
        productsList.innerHTML = `
            <div class="alert alert-info">
                Henüz ürün bulunmuyor.
            </div>
        `;
        return;
    }

    productsList.innerHTML = products.map(product => `
        <div class="col-md-4 mb-4">
            <div class="card h-100">
                <img src="${product.image || 'placeholder.jpg'}" class="card-img-top" alt="${product.name}">
                <div class="card-body">
                    <h5 class="card-title">${product.name}</h5>
                    <p class="card-text">${product.description || ''}</p>
                    <div class="mb-2">
                        <strong>Kategori:</strong> ${product.category || 'Belirtilmemiş'}
                    </div>
                    <div class="mb-2">
                        <strong>Stok:</strong> ${product.stock}
                    </div>
                    <div class="mb-3">
                        <strong>Fiyat:</strong> ${product.price} TL
                    </div>
                    <div class="d-flex justify-content-between align-items-center">
                        <button class="btn btn-primary btn-sm" onclick="editProduct(${product.id})">
                            <i class="fas fa-edit"></i> Düzenle
                </button>
                        <button class="btn btn-danger btn-sm" onclick="deleteProduct(${product.id})">
                            <i class="fas fa-trash"></i> Sil
                </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function handleAddProduct(e) {
    e.preventDefault();

    const name = document.querySelector('#productName').value;
    const description = document.querySelector('#productDescription').value;
    const category = document.querySelector('#categorySelect').value;
    const stock = parseInt(document.querySelector('#productStock').value);
    const price = parseFloat(document.querySelector('#productPrice').value);
    const image = document.querySelector('#productImage').value;

    if (!name || stock < 0 || price <= 0) {
        showToast('Lütfen geçerli bilgiler giriniz', 'danger');
        return;
    }

    const products = JSON.parse(localStorage.getItem('products')) || [];
    
    // Ürün adı kontrolü
    if (products.some(p => p.name.toLowerCase() === name.toLowerCase())) {
        showToast('Bu ürün adı zaten kullanılıyor', 'danger');
        return;
    }

    const newProduct = {
        id: Date.now(),
        name: name,
        description: description,
        category: category,
        stock: stock,
        price: price,
        image: image,
        created_at: new Date().toISOString()
    };

    products.push(newProduct);
    localStorage.setItem('products', JSON.stringify(products));

    showToast('Ürün başarıyla eklendi', 'success');
    e.target.reset();
    loadProducts();
}

function handleEditProduct(e) {
    e.preventDefault();

    const id = parseInt(document.querySelector('#editProductId').value);
    const name = document.querySelector('#editProductName').value;
    const description = document.querySelector('#editProductDescription').value;
    const category = document.querySelector('#editCategorySelect').value;
    const stock = parseInt(document.querySelector('#editProductStock').value);
    const price = parseFloat(document.querySelector('#editProductPrice').value);
    const image = document.querySelector('#editProductImage').value;

    if (!name || stock < 0 || price <= 0) {
        showToast('Lütfen geçerli bilgiler giriniz', 'danger');
        return;
    }

    const products = JSON.parse(localStorage.getItem('products')) || [];
    const productIndex = products.findIndex(p => p.id === id);

    if (productIndex === -1) {
        showToast('Ürün bulunamadı', 'danger');
        return;
    }

    // Ürün adı kontrolü
    if (products.some(p => p.id !== id && p.name.toLowerCase() === name.toLowerCase())) {
        showToast('Bu ürün adı zaten kullanılıyor', 'danger');
        return;
    }

    products[productIndex] = {
        ...products[productIndex],
        name: name,
        description: description,
        category: category,
        stock: stock,
        price: price,
        image: image,
        updated_at: new Date().toISOString()
    };

    localStorage.setItem('products', JSON.stringify(products));

    showToast('Ürün başarıyla güncellendi', 'success');
    e.target.reset();
    loadProducts();
}

function editProduct(id) {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const product = products.find(p => p.id === id);

    if (!product) {
        showToast('Ürün bulunamadı', 'danger');
        return;
    }

    document.querySelector('#editProductId').value = product.id;
    document.querySelector('#editProductName').value = product.name;
    document.querySelector('#editProductDescription').value = product.description || '';
    document.querySelector('#editCategorySelect').value = product.category || '';
    document.querySelector('#editProductStock').value = product.stock;
    document.querySelector('#editProductPrice').value = product.price;
    document.querySelector('#editProductImage').value = product.image || '';

    const editModal = new bootstrap.Modal(document.querySelector('#editProductModal'));
    editModal.show();
}

function deleteProduct(id) {
    if (!confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
        return;
    }

    const products = JSON.parse(localStorage.getItem('products')) || [];
    const productIndex = products.findIndex(p => p.id === id);

    if (productIndex === -1) {
        showToast('Ürün bulunamadı', 'danger');
        return;
    }

    // Siparişlerde kullanılıp kullanılmadığını kontrol et
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
        const orders = JSON.parse(localStorage.getItem(`orders_${currentUser.id}`)) || [];
        const productInOrders = orders.some(order => 
            order.items.some(item => item.productId === id)
        );

        if (productInOrders) {
            showToast('Bu ürün siparişlerde kullanılıyor. Silinemez.', 'danger');
            return;
        }
    }

    products.splice(productIndex, 1);
    localStorage.setItem('products', JSON.stringify(products));

    showToast('Ürün başarıyla silindi', 'success');
    loadProducts();
}

// Yardımcı fonksiyonlar
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