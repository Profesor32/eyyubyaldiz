// DOM Elements
const stockDetailsContainer = document.querySelector('#stockDetails');
const stockHistoryContainer = document.querySelector('#stockHistory');
const addStockForm = document.querySelector('#addStockForm');
const editStockForm = document.querySelector('#editStockForm');

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
        const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (productId) {
        loadStockDetails(productId);
        loadStockHistory(productId);
    }

    if (addStockForm) {
        addStockForm.onsubmit = function(e) {
            e.preventDefault();
            const urlParams = new URLSearchParams(window.location.search);
            const productId = urlParams.get('id');
            const type = document.getElementById('stockType').value;
            const quantity = parseInt(document.getElementById('quantity').value);
            const description = document.getElementById('description').value;
            if (!productId || !quantity || quantity <= 0) {
                showToast('Geçerli bir miktar giriniz', 'danger');
                return;
            }
            const products = JSON.parse(localStorage.getItem('products')) || [];
            const productIndex = products.findIndex(p => p.id === parseInt(productId));
            if (productIndex === -1) {
                showToast('Ürün bulunamadı', 'danger');
                return;
            }
            const previousStock = products[productIndex].stock;
            let newStock = previousStock;
            if (type === 'Giriş') {
                newStock += quantity;
            } else {
                newStock -= quantity;
                if (newStock < 0) newStock = 0;
            }
            products[productIndex].stock = newStock;
            products[productIndex].updated_at = new Date().toISOString();
            // Stok geçmişini güncelle
            const key = `stock_history_${productId}`;
            const stockHistory = JSON.parse(localStorage.getItem(key)) || [];
            stockHistory.unshift({
                date: new Date().toISOString(),
                type,
                quantity: type === 'Giriş' ? quantity : -quantity,
                previous_stock: previousStock,
                new_stock: newStock,
                description
            });
            localStorage.setItem('products', JSON.stringify(products));
            localStorage.setItem(key, JSON.stringify(stockHistory));
            showToast('Stok hareketi eklendi', 'success');
            // Modalı kapat
            const modal = bootstrap.Modal.getInstance(document.getElementById('addStockModal'));
            if (modal) modal.hide();
            loadStockDetails(productId);
            loadStockHistory(productId);
        };
    }

    if (editStockForm) {
        editStockForm.addEventListener('submit', (e) => handleEditStock(e, productId));
    }
});

// Functions
function loadStockDetails(productId) {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const product = products.find(p => p.id === parseInt(productId));

    if (!product) {
        showToast('Ürün bulunamadı', 'danger');
        setTimeout(() => {
            window.location.href = 'products.html';
        }, 2000);
        return;
    }

    if (stockDetailsContainer) {
        const maxQty = product.stock > 0 ? product.stock : 1;
        const stockLow = Number(product.stock) <= 5;
        stockDetailsContainer.innerHTML = `
            <div class="card bg-secondary text-light shadow mb-4">
                <div class="row g-0 align-items-center">
                    <div class="col-md-4 text-center p-3">
                        <img src="${product.image || 'https://via.placeholder.com/180x180?text=Ürün'}" alt="${product.name}" class="img-fluid rounded mb-2 product-img">
                        <div class="badge bg-dark mt-2">${product.category || 'Kategori Yok'}</div>
                    </div>
                    <div class="col-md-8">
                        <div class="card-body">
                            <h3 class="card-title mb-2">${product.name}</h3>
                            <p class="card-text mb-2">${product.description || '<span class=\'text-muted\'>Açıklama yok</span>'}</p>
                            <div class="row mb-2">
                                <div class="col-6 mb-2"><strong>Fiyat:</strong> <span class="badge bg-dark text-warning fs-6 fw-bold">${parseFloat(product.price).toLocaleString('tr-TR', {minimumFractionDigits: 2, maximumFractionDigits: 2})} TL</span></div>
                                <div class="col-6 mb-2"><strong>Stok:</strong> <span class="badge ${stockLow ? 'bg-danger' : 'bg-success'}">${product.stock}${stockLow ? ' (Düşük!)' : ''}</span></div>
                                <div class="col-6 mb-2"><strong>Kategori:</strong> <span class="badge bg-dark">${product.category || '-'}</span></div>
                                <div class="col-6 mb-2"><strong>Son Güncelleme:</strong> ${product.updated_at ? new Date(product.updated_at).toLocaleString('tr-TR') : '-'}</div>
                            </div>
                            <div class="d-flex gap-2 align-items-center mt-3 qty-group">
                                <label for="detailQty" class="form-label mb-0">Miktar:</label>
                                <button class="qty-btn" id="qtyMinus">-</button>
                                <input type="number" id="detailQty" class="form-control w-auto text-center" value="1" min="1" max="${maxQty}" style="width:80px;" ${product.stock <= 0 ? 'disabled' : ''}>
                                <button class="qty-btn" id="qtyPlus">+</button>
                                <button class="btn btn-success" id="addToCartDetailBtn" ${product.stock <= 0 ? 'disabled' : ''}><i class="fas fa-cart-plus me-2"></i>Sepete Ekle</button>
                                <a href="products.html" class="btn btn-outline-light">Ürünlere Dön</a>
                            </div>
                            ${product.stock <= 0 ? '<div class="text-danger mt-2">Stokta Yok</div>' : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
        // Sepete ekle butonu event
        setTimeout(() => {
            const btn = document.getElementById('addToCartDetailBtn');
            if (btn) {
                btn.onclick = function() {
                    const qty = parseInt(document.getElementById('detailQty').value);
                    addToCartFromDetail(product.id, qty);
                };
            }
            // + ve - butonları
            const qtyInput = document.getElementById('detailQty');
            const minusBtn = document.getElementById('qtyMinus');
            const plusBtn = document.getElementById('qtyPlus');
            if (minusBtn && qtyInput) {
                minusBtn.onclick = () => {
                    let val = parseInt(qtyInput.value) || 1;
                    if (val > 1) qtyInput.value = val - 1;
                };
            }
            if (plusBtn && qtyInput) {
                plusBtn.onclick = () => {
                    let val = parseInt(qtyInput.value) || 1;
                    if (val < maxQty) qtyInput.value = val + 1;
                };
            }
        }, 0);
    }
}

// Demo: İlk açılışta örnek hareket ekle
function ensureDemoStockHistory(productId) {
    const key = `stock_history_${productId}`;
    let stockHistory = JSON.parse(localStorage.getItem(key)) || [];
    if (stockHistory.length === 0) {
        const now = new Date();
        stockHistory = [
            {
                date: new Date(now.getTime() - 86400000).toISOString(),
                type: 'Giriş',
                quantity: 10,
                previous_stock: 0,
                new_stock: 10,
                description: ''
            },
            {
                date: new Date(now.getTime() - 3600000).toISOString(),
                type: 'Çıkış',
                quantity: -2,
                previous_stock: 10,
                new_stock: 8,
                description: ''
            }
        ];
        localStorage.setItem(key, JSON.stringify(stockHistory));
    }
}

function loadStockHistory(productId) {
    ensureDemoStockHistory(productId);
    const stockHistory = JSON.parse(localStorage.getItem(`stock_history_${productId}`)) || [];
    if (stockHistoryContainer) {
        if (stockHistory.length === 0) {
            stockHistoryContainer.innerHTML = `
                <div class="alert alert-info">
                    Henüz stok hareketi bulunmuyor.
                </div>
            `;
            return;
        }
        stockHistoryContainer.innerHTML = `
            <div class="table-responsive">
                <table class="table table-dark table-striped table-bordered align-middle">
                    <thead>
                        <tr>
                            <th>Tarih</th>
                            <th>İşlem</th>
                            <th>Miktar</th>
                            <th>Önceki Stok</th>
                            <th>Yeni Stok</th>
                            <th>Açıklama</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${stockHistory.map(record => `
                            <tr>
                                <td>${new Date(record.date).toLocaleString('tr-TR')}</td>
                                <td><span class="badge bg-${record.type === 'Giriş' ? 'success' : 'danger'}">${record.type}</span></td>
                                <td>${record.quantity}</td>
                                <td>${record.previous_stock}</td>
                                <td>${record.new_stock}</td>
                                <td>${record.description || '-'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }
}

function handleEditStock(e, productId) {
    e.preventDefault();
    
    const newStock = parseInt(document.querySelector('#newStock').value);
    const description = document.querySelector('#editDescription').value;

    if (newStock < 0) {
        showToast('Geçerli bir stok miktarı giriniz', 'danger');
        return;
    }

    const products = JSON.parse(localStorage.getItem('products')) || [];
    const productIndex = products.findIndex(p => p.id === parseInt(productId));

    if (productIndex === -1) {
        showToast('Ürün bulunamadı', 'danger');
        return;
    }
    
    const previousStock = products[productIndex].stock;
    products[productIndex].stock = newStock;
    products[productIndex].updated_at = new Date().toISOString();

    // Stok geçmişini güncelle
    const stockHistory = JSON.parse(localStorage.getItem(`stock_history_${productId}`)) || [];
    stockHistory.unshift({
        date: new Date().toISOString(),
        type: 'Düzenleme',
        quantity: newStock - previousStock,
        previous_stock: previousStock,
        new_stock: newStock,
        description: description
    });

    // LocalStorage'ı güncelle
    localStorage.setItem('products', JSON.stringify(products));
    localStorage.setItem(`stock_history_${productId}`, JSON.stringify(stockHistory));

    showToast('Stok başarıyla güncellendi', 'success');
    
    // Formu temizle ve sayfayı yenile
    e.target.reset();
    loadStockDetails(productId);
    loadStockHistory(productId);
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

// Sepete ekle fonksiyonu (stok ve miktar kontrolü ile)
function addToCartFromDetail(productId, quantity) {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const product = products.find(p => p.id === parseInt(productId));
    if (!product) {
        showToast('Ürün bulunamadı', 'danger');
        return;
    }
    quantity = parseInt(quantity);
    if (isNaN(quantity) || quantity < 1) {
        showToast('Lütfen geçerli bir miktar girin.', 'warning');
        return;
    }
    if (quantity > product.stock) {
        showToast('Stokta yeterli ürün yok.', 'danger');
        return;
    }
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const idx = cart.findIndex(item => item.id === product.id);
    if (idx !== -1) {
        if (cart[idx].quantity + quantity > product.stock) {
            showToast('Sepetteki miktar ile birlikte stok aşılacak.', 'danger');
            return;
        }
        cart[idx].quantity += quantity;
    } else {
        cart.push({ ...product, quantity });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount && updateCartCount();
    showToast('Ürün sepete eklendi', 'success');
} 