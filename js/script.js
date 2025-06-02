// Genel Yardımcı Fonksiyonlar ve Olay Dinleyiciler

// Token kontrolü ve yetkilendirme
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        // Oturum gerektiren diğer sayfalarda token yoksa login sayfasına yönlendir
        if (
            window.location.pathname.includes('profile.html') ||
            window.location.pathname.includes('orders.html') ||
            window.location.pathname.includes('cart.html')
        ) {
            window.location.href = 'login.html';
            return false;
        }
        return false;
    }
    // Token varsa, geçerliliğini kontrol etmek için bir API çağrısı yapılabilir (isteğe bağlı)
    // Şimdilik sadece varlığını kontrol ediyoruz.
    return true;
}

// Kullanıcı menüsünü güncelle
function updateUserMenu() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const userDropdown = document.getElementById('userDropdown');
    
    if (userDropdown) {
        if (currentUser) {
            userDropdown.innerHTML = `
                <li><a class="dropdown-item" href="profile.html"><i class="fas fa-user me-2"></i> Profilim</a></li>
                <li><a class="dropdown-item" href="orders.html"><i class="fas fa-shopping-bag me-2"></i> Siparişlerim <span class='text-secondary' style='font-size:0.9em;'>(Tüm sipariş geçmişiniz)</span></a></li>
                <li><hr class="dropdown-divider"></li>
                <li><a class="dropdown-item" href="#" onclick="logout()"><i class="fas fa-sign-out-alt me-2"></i> Çıkış Yap</a></li>
            `;
        } else {
            userDropdown.innerHTML = `
                <li><a class="dropdown-item" href="login.html"><i class="fas fa-sign-in-alt me-2"></i> Giriş Yap</a></li>
                <li><a class="dropdown-item" href="register.html"><i class="fas fa-user-plus me-2"></i> Kayıt Ol</a></li>
            `;
        }
    }
}

// Sepet sayısını güncelle
function updateCartCount() {
    const cartCount = document.getElementById('cartCount');
    if (!cartCount) return;

    try {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const count = cart.reduce((total, item) => total + item.quantity, 0);
        cartCount.textContent = count;
    } catch (error) {
        console.error('Sepet sayısı güncelleme hatası:', error);
        cartCount.textContent = '0';
    }
}

// Toast bildirimi göster
function showToast(message, type = 'success') {
    const toastContainer = document.querySelector('.toast-container');
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type === 'success' ? 'success' : 'danger'} border-0`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;
    
    toastContainer.appendChild(toast);
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
    
    toast.addEventListener('hidden.bs.toast', () => {
        toast.remove();
    });
}

// Çıkış yap
function logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    updateUserMenu();
    showToast('Başarıyla çıkış yapıldı', 'success');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

// --- Ürün Listeleme Sayfası İçin Fonksiyonlar (frontend/products.html) ---

let allProducts = []; // Tüm ürünleri saklamak için değişken

// Ürünleri LocalStorage'dan getir ve görüntüle
function fetchAndDisplayProducts() {
    const productsContainer = document.getElementById('productsContainer');
    if (!productsContainer) return; // Sadece products.html sayfasında çalışır

    try {
        const products = JSON.parse(localStorage.getItem('products')) || [];
        allProducts = products; // Tüm ürünleri sakla
            displayProducts(allProducts); // Hepsini görüntüle
    } catch (error) {
        console.error('Ürün yükleme hatası:', error);
        showToast('Ürünler yüklenirken bir hata oluştu', 'danger');
         productsContainer.innerHTML = '<div class="col-12 text-center"><p>Ürünler yüklenirken bir hata oluştu.</p></div>';
    }
}

// Ürünleri DOM'a görüntüle (filtrelenmiş/aranmış listeyi alır)
function displayProducts(products) {
    const productsContainer = document.getElementById('productsContainer');
    if (!productsContainer) return; // Sadece products.html sayfasında çalışır

    if (products.length === 0) {
        productsContainer.innerHTML = '<div class="col-12 text-center"><p>Ürün bulunamadı.</p></div>';
        return;
    }

    productsContainer.innerHTML = products.map(product => `
        <div class="col-md-4 mb-4">
            <div class="card h-100">
                <a href="product-detail.html?id=${product.id}">
                    <img src="${product.image || 'images/placeholder.jpg'}" class="card-img-top" alt="${product.name}">
                </a>
                <div class="card-body">
                    <h5 class="card-title">${product.name}</h5>
                    <p class="card-text">${product.description ? product.description.substring(0, 100) + '...' : ''}</p>
                    <p class="card-text">
                        <small class="text-muted">Stok: ${product.stock}</small>
                    </p>
                    <p class="card-text">
                        <strong>${parseFloat(product.price).toFixed(2)} TL</strong>
                    </p>
                    <button class="btn btn-primary" onclick="addToCart(${product.id})" ${product.stock <= 0 ? 'disabled' : ''}>
                        ${product.stock <= 0 ? 'Stokta Yok' : 'Sepete Ekle'}
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Ürün arama fonksiyonu
function searchProducts() {
    const searchTerm = document.getElementById('productSearch').value.toLowerCase();
     const filteredProducts = allProducts.filter(product => 
        product.name.toLowerCase().includes(searchTerm) || 
        (product.description && product.description.toLowerCase().includes(searchTerm))
    );
    displayProducts(filteredProducts);
}

// --- Sepet Sayfası İçin Fonksiyonlar (frontend/cart.html) ---

// Sepet ürünlerini LocalStorage'dan getir ve görüntüle
function fetchCartItems() {
    const cartItemsContainer = document.getElementById('cartItems');
    if (!cartItemsContainer) return; // Sadece cart.html sayfasında çalışır

    try {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const products = JSON.parse(localStorage.getItem('products')) || [];
        
        // Sepetteki ürünleri, ürün bilgileriyle birleştir
        const cartItems = cart.map(item => {
            const product = products.find(p => p.id === item.id) || {};
            return {
                ...item,
                name: product.name || item.name,
                description: product.description || item.description,
                price: product.price || item.price,
                image: product.image || item.image
            };
        });

        displayCartItems(cartItems);
        updateOrderSummary(cartItems);
    } catch (error) {
        console.error('Sepet yükleme hatası:', error);
        showToast('Sepet yüklenirken bir hata oluştu', 'danger');
        cartItemsContainer.innerHTML = '<div class="col-12 text-center"><p>Sepet yüklenirken bir hata oluştu.</p></div>';
    }
}

// Sepet ürünlerini DOM'a görüntüle
function displayCartItems(items) {
    const cartItemsContainer = document.getElementById('cartItems');
     if (!cartItemsContainer) return; // Sadece cart.html sayfasında çalışır
    
    if (items.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="text-center py-4">
                <i class="fas fa-shopping-cart fa-3x mb-3 text-muted"></i>
                <p class="mb-0">Sepetiniz boş</p>
                <a href="products.html" class="btn btn-primary mt-3">Alışverişe Başla</a>
            </div>
        `;
        return;
    }

    cartItemsContainer.innerHTML = items.map(item => `
        <div class="cart-item mb-3 pb-3 border-bottom">
            <div class="row align-items-center">
                <div class="col-md-2">
                    <img src="${item.image || 'images/placeholder.jpg'}" class="img-fluid rounded" alt="${item.name}">
                </div>
                <div class="col-md-4">
                    <h5 class="mb-1">${item.name}</h5>
                    <p class="text-muted mb-0">${item.description ? item.description.substring(0, 50) + '...' : ''}</p>
                </div>
                <div class="col-md-2">
                    <div class="input-group">
                        <button class="btn btn-outline-secondary btn-sm" onclick="updateQuantity(${item.id}, ${item.quantity - 1})" ${item.quantity <= 1 ? 'disabled' : ''}>-</button>
                        <input type="number" class="form-control form-control-sm text-center" value="${item.quantity}" min="1" onchange="updateQuantity(${item.id}, this.value)">
                        <button class="btn btn-outline-secondary btn-sm" onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                    </div>
                </div>
                <div class="col-md-2 text-end">
                    <p class="mb-0">${parseFloat(item.price * item.quantity).toFixed(2)} TL</p>
                </div>
                <div class="col-md-2 text-end">
                    <button class="btn btn-danger btn-sm" onclick="removeFromCart(${item.id})">
                        <i class="fas fa-trash"></i> Sil
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    // Sipariş özetini güncelle
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.18; // %18 KDV
    const total = subtotal + tax;

    updateOrderSummary({
        subtotal: subtotal,
        tax: tax,
        total: total
    });
}

// Sipariş özetini güncelle
function updateOrderSummary(data) {
    const subtotalElement = document.getElementById('subtotal');
    const taxElement = document.getElementById('tax');
    const totalElement = document.getElementById('total');

    if (subtotalElement) subtotalElement.textContent = `${parseFloat(data.subtotal || 0).toFixed(2)} TL`;
    if (taxElement) taxElement.textContent = `${parseFloat(data.tax || 0).toFixed(2)} TL`;
    if (totalElement) totalElement.textContent = `${parseFloat(data.total || 0).toFixed(2)} TL`;
}

// Sepetteki ürün miktarını güncelle
function updateQuantity(itemId, quantity) {
    try {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const itemIndex = cart.findIndex(item => item.id === itemId);

        if (itemIndex === -1) {
            showToast('Ürün sepette bulunamadı', 'danger');
        return;
    }

        if (quantity <= 0) {
            // Miktar 0 veya daha az ise ürünü sepetten kaldır
            cart.splice(itemIndex, 1);
            showToast('Ürün sepetten kaldırıldı', 'success');
        } else {
            // Miktarı güncelle
            cart[itemIndex].quantity = quantity;
            showToast('Ürün miktarı güncellendi', 'success');
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        fetchCartItems(); // Sepeti yeniden yükle
        updateCartCount(); // Sepet sayısını güncelle
    } catch (error) {
        console.error('Miktar güncelleme hatası:', error);
        showToast('Miktar güncellenirken bir hata oluştu', 'danger');
    }
}

// Sepetten ürün kaldır
function removeFromCart(itemId) {
    try {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const itemIndex = cart.findIndex(item => item.id === itemId);

        if (itemIndex === -1) {
            showToast('Ürün sepette bulunamadı', 'danger');
            return;
        }

        // Ürünü sepetten kaldır
        cart.splice(itemIndex, 1);
        localStorage.setItem('cart', JSON.stringify(cart));

        showToast('Ürün sepetten kaldırıldı', 'success');
        fetchCartItems(); // Sepeti yeniden yükle
        updateCartCount(); // Sepet sayısını güncelle
    } catch (error) {
        console.error('Ürün kaldırma hatası:', error);
        showToast('Ürün kaldırılırken bir hata oluştu', 'danger');
    }
}

// Siparişi tamamla
function checkout() {
    try {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        if (cart.length === 0) {
            showToast('Sepetiniz boş', 'warning');
         return;
    }

        // Mevcut siparişleri al
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        
        // Yeni sipariş oluştur
        const newOrder = {
            id: orders.length + 1,
            items: cart,
            total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            status: 'Beklemede',
            created_at: new Date().toISOString()
        };

        // Siparişi kaydet
        orders.push(newOrder);
        localStorage.setItem('orders', JSON.stringify(orders));

        // Sepeti temizle
        localStorage.removeItem('cart');

            showToast('Siparişiniz başarıyla oluşturuldu', 'success');
            setTimeout(() => {
            window.location.href = 'orders.html';
        }, 1500);
    } catch (error) {
        console.error('Sipariş oluşturma hatası:', error);
        showToast('Sipariş oluşturulurken bir hata oluştu', 'danger');
    }
}

// --- Ürün Detay Sayfası İçin Fonksiyonlar (frontend/product-detail.html) ---

// Ürün detayını LocalStorage'dan getir ve görüntüle
function fetchAndDisplayProductDetail() {
    const productDetailContainer = document.getElementById('productDetail');
    if (!productDetailContainer) return;

    try {
        // URL'den ürün ID'sini al
    const urlParams = new URLSearchParams(window.location.search);
        const productId = parseInt(urlParams.get('id'));

    if (!productId) {
            showToast('Ürün ID\'si bulunamadı', 'danger');
            productDetailContainer.innerHTML = '<div class="col-12 text-center"><p>Ürün bulunamadı.</p></div>';
        return;
    }

        // Ürünü LocalStorage'dan bul
        const products = JSON.parse(localStorage.getItem('products')) || [];
        const product = products.find(p => p.id === productId);

        if (!product) {
            showToast('Ürün bulunamadı', 'danger');
            productDetailContainer.innerHTML = '<div class="col-12 text-center"><p>Ürün bulunamadı.</p></div>';
            return;
        }

        displayProductDetail(product);
    } catch (error) {
        console.error('Ürün detayı yükleme hatası:', error);
        showToast('Ürün detayı yüklenirken bir hata oluştu', 'danger');
        productDetailContainer.innerHTML = '<div class="col-12 text-center"><p>Ürün detayı yüklenirken bir hata oluştu.</p></div>';
    }
}

// Ürün detaylarını DOM'a görüntüle
function displayProductDetail(product) {
    const productDetailContainer = document.getElementById('productDetail');
    if (!productDetailContainer) return;

    productDetailContainer.innerHTML = `
        <div class="row">
            <div class="col-md-6">
                <img src="${product.image || 'images/placeholder.jpg'}" class="img-fluid rounded" alt="${product.name}">
            </div>
            <div class="col-md-6">
                <h2>${product.name}</h2>
                <p class="text-muted">Kategori: ${product.category || 'Belirtilmemiş'}</p>
                <h4>${parseFloat(product.price).toFixed(2)} TL</h4>
                <p>${product.description || 'Ürün açıklaması bulunmamaktadır.'}</p>
                <p><strong>Stok Durumu:</strong> ${product.stock > 0 ? product.stock + ' adet stokta' : 'Stokta Yok'}</p>
                 
                <div class="d-flex align-items-center mb-3">
                     <label for="quantity" class="form-label me-2">Miktar:</label>
                     <input type="number" id="quantity" class="form-control w-auto" value="1" min="1" max="${product.stock}" ${product.stock <= 0 ? 'disabled' : ''}>
                </div>

                <button class="btn btn-primary btn-lg" onclick="addToCartFromDetail(${product.id}, document.getElementById('quantity').value)" ${product.stock <= 0 ? 'disabled' : ''}>
                    <i class="fas fa-shopping-cart me-2"></i> Sepete Ekle
                </button>
            </div>
        </div>
    `;
}

// Ürün detay sayfasından sepete ekle
function addToCartFromDetail(productId, quantity) {
     quantity = parseInt(quantity);
     if (quantity < 1 || isNaN(quantity)) {
         showToast('Lütfen geçerli bir miktar girin.', 'warning');
         return;
     }

    try {
        // Ürünü bul
        const products = JSON.parse(localStorage.getItem('products')) || [];
        const product = products.find(p => p.id === productId);

        if (!product) {
            showToast('Ürün bulunamadı', 'danger');
        return;
    }

        if (product.stock < quantity) {
            showToast('Yeterli stok yok', 'warning');
            return;
        }

        // Sepeti al veya oluştur
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existingItem = cart.find(item => item.id === productId);

        if (existingItem) {
            // Eğer yeni miktar stoktan fazlaysa uyar
            if (existingItem.quantity + quantity > product.stock) {
                showToast('Yeterli stok yok', 'warning');
                return;
            }
            existingItem.quantity += quantity;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                description: product.description,
                price: product.price,
                image: product.image,
                quantity: quantity
            });
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        showToast('Ürün sepete eklendi', 'success');
    } catch (error) {
        console.error('Sepete ekleme hatası:', error);
        showToast('Ürün sepete eklenirken bir hata oluştu', 'danger');
    }
}

// --- Profil Sayfası İçin Fonksiyonlar (frontend/profile.html) ---

// Profil bilgilerini LocalStorage'dan getir ve görüntüle
function fetchAndDisplayProfile() {
    const profileContainer = document.getElementById('profileContainer');
    if (!profileContainer) return;

    try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) {
            showToast('Kullanıcı bilgileri bulunamadı', 'danger');
            window.location.href = 'login.html';
            return;
        }

        // Kullanıcının siparişlerini al
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        const userOrders = orders.filter(order => order.userId === currentUser.id);

        // Profil bilgilerini görüntüle
        displayProfile({
            ...currentUser,
            orders: userOrders
        });
    } catch (error) {
        console.error('Profil yükleme hatası:', error);
        showToast('Profil yüklenirken bir hata oluştu', 'danger');
        profileContainer.innerHTML = '<div class="col-12 text-center"><p>Profil yüklenirken bir hata oluştu.</p></div>';
    }
}

// Profil bilgilerini DOM'a görüntüle
function displayProfile(user) {
    const profileDetailContainer = document.getElementById('profileDetailContainer');
    if (!profileDetailContainer) return; // Sadece profile.html sayfasında çalışır

    profileDetailContainer.innerHTML = `
        <div class="row">
            <div class="col-md-6">
                <p><strong>Kullanıcı Adı:</strong> ${user.username}</p>
                <p><strong>E-posta:</strong> ${user.email}</p>
                <p><strong>Rol:</strong> ${user.isAdmin ? 'Yönetici' : 'Kullanıcı'}</p>
                <!-- Diğer profil bilgileri buraya eklenebilir -->
            </div>
             <!-- Profil düzenleme formu veya şifre değiştirme alanı buraya eklenebilir -->
        </div>
    `;
}

// --- Siparişler Sayfası İçin Fonksiyonlar (frontend/orders.html) ---

function displayOrders() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const ordersContainer = document.getElementById('ordersContainer');
    if (!user) {
        ordersContainer.innerHTML = `<div class='alert alert-warning text-center'>Giriş yapmadınız. <a href='login.html'>Giriş Yap</a></div>`;
        return;
    }
    const userOrders = orders.filter(order => order.userId === user.id);
    if (userOrders.length === 0) {
        ordersContainer.innerHTML = `<div class='alert alert-info text-center'>Henüz siparişiniz bulunmamaktadır.</div>`;
        return;
    }
    ordersContainer.innerHTML = `
        <div class="list-group">
            ${userOrders.map(order => `
                <div class="list-group-item list-group-item-action mb-3 bg-secondary text-light">
                    <div class="d-flex w-100 justify-content-between">
                        <h5 class="mb-1">Sipariş #${order.orderNumber || order.id}</h5>
                        <small>${order.date || ''}</small>
                    </div>
                    <p class="mb-1">Toplam Tutar: <strong>${order.total} TL</strong></p>
                    <small class="text-muted">Durum: ${order.status || 'Beklemede'}</small>
                </div>
            `).join('')}
        </div>
    `;
}

// --- ÖRNEK VERİ EKLEME ---
function initializeSampleData() {
    // Örnek kullanıcı ekle (eğer yoksa)
    if (!localStorage.getItem('users')) {
        const users = [
            {
                id: 1,
                username: 'admin',
                email: 'admin@admin.com',
                password: '123456',
                created_at: new Date().toISOString()
            },
            {
                id: 2,
                username: 'ali',
                email: 'ali@example.com',
                password: '123456',
                created_at: new Date().toISOString()
            }
        ];
        localStorage.setItem('users', JSON.stringify(users));
    }
    // Örnek ürün ekle (eğer yoksa)
    if (!localStorage.getItem('products')) {
        const products = [
            {
                id: 1,
                name: 'Dizüstü Bilgisayar',
                description: 'Yüksek performanslı laptop',
                category: 'Elektronik',
                stock: 10,
                price: 15000,
                image: '',
                created_at: new Date().toISOString()
            },
            {
                id: 2,
                name: 'Bluetooth Kulaklık',
                description: 'Kablosuz kulaklık',
                category: 'Elektronik',
                stock: 25,
                price: 1200,
                image: '',
                created_at: new Date().toISOString()
            },
            {
                id: 3,
                name: 'Ofis Sandalyesi',
                description: 'Ergonomik sandalye',
                category: 'Mobilya',
                stock: 5,
                price: 2500,
                image: '',
                created_at: new Date().toISOString()
            }
        ];
        localStorage.setItem('products', JSON.stringify(products));
    }
    // Örnek kategori ekle (eğer yoksa)
    if (!localStorage.getItem('categories')) {
        const categories = [
            { id: 1, name: 'Elektronik', description: 'Elektronik ürünler', created_at: new Date().toISOString() },
            { id: 2, name: 'Mobilya', description: 'Mobilya ürünleri', created_at: new Date().toISOString() }
        ];
        localStorage.setItem('categories', JSON.stringify(categories));
    }
}

// Sayfa yüklendiğinde örnek verileri ekle
initializeSampleData();

// --- Sayfa Yüklendiğinde Çalışacak Olay Dinleyiciler ---

document.addEventListener('DOMContentLoaded', () => {
    // Her sayfada çalışacaklar
    updateUserMenu(); // Kullanıcı menüsünü güncelle
    updateCartCount(); // Sepet sayısını güncelle

    // Sayfaya özel fonksiyonları çalıştır
    if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
        // Ana Sayfa
        // Ürünleri ana sayfadaki products bölümüne getirir (index.html)
        // fetchProducts(); // index.html'de ürün gösterimi için bu fonksiyon kullanılabilir, ancak index.html'in yapısına göre ayarlanmalı

    } else if (window.location.pathname === '/frontend/products.html') {
        // Ürünler Sayfası
        fetchAndDisplayProducts(); // Tüm ürünleri getir ve görüntüle (products.html)
        // Ürün arama inputuna olay dinleyici ekle
        const productSearchInput = document.getElementById('productSearch');
        if(productSearchInput) {
             productSearchInput.addEventListener('input', searchProducts);
        }

    } else if (window.location.pathname === '/frontend/cart.html') {
        // Sepet Sayfası
         // checkAuth() çağrısı DOMContentLoaded içinde yapılıyor
        fetchCartItems(); // Sepet öğelerini getir

    } else if (window.location.pathname === '/frontend/product-detail.html') {
         // Ürün Detay Sayfası
         fetchAndDisplayProductDetail(); // Ürün detayını getir

    } else if (window.location.pathname === '/frontend/profile.html') {
         // Profil Sayfası
         // checkAuth() çağrısı DOMContentLoaded içinde yapılıyor
         fetchAndDisplayProfile(); // Profil bilgilerini getir ve görüntüle

    } else if (window.location.pathname === '/frontend/orders.html') {
         // Siparişler Sayfası
         // checkAuth() çağrısı DOMContentLoaded içinde yapılıyor
         displayOrders(); // Siparişleri getir ve görüntüle

    } else if (window.location.pathname.includes('/admin/')) {
        // Admin Sayfaları - Yetkilendirme kontrolü
         checkAuth(); // checkAuth admin olmayanları login sayfasına yönlendirir
         // Admin sayfalarına özel scriptler ve fonksiyonlar buraya veya ayrı bir dosyaya eklenebilir.
    }

     // Genel sayfalarda (index, products, cart, detail, about, login, register)
     // userDropdown elementinin olduğu varsayılarak updateUserMenu çağrılır.
     // checkAuth() çağrısı sadece oturum gerektiren sayfalarda başında yapılmalıdır.

}); 

// Ana sayfada ürünleri getirme fonksiyonu (eğer index.html'de productsContainer varsa çalışır)
// Bu fonksiyon şu anda sadece products.html'de kullanılıyor. İhtiyaca göre index.html'e eklenebilir.
// async function fetchProductsForIndexPage() {
//     const productsContainer = document.getElementById('products'); // index.html'deki id
//     if (!productsContainer) return; 

//     try {
//         const response = await fetch('/api/products');
//         const data = await response.json();
//         
//         if (data.success) {
//             // index.html'deki ürün görüntüleme formatına uygun hale getirilmeli
//             productsContainer.innerHTML = data.data.map(product => `...`).join('');
//         } else {
//             showToast(data.message || 'Ürünler yüklenemedi', 'danger');
//         }
//     } catch (error) {
//         console.error('Ürün yükleme hatası:', error);
//         showToast('Ürünler yüklenirken bir hata oluştu', 'danger');
//     }
// } 

// Sepet işlemleri
function addToCart(product) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItem = cart.find(item => item.id === product.id);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            description: product.description,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showToast('Ürün sepete eklendi', 'success');
}

function updateCartCount() {
    const cartCount = document.getElementById('cartCount');
    if (!cartCount) return;

    try {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const count = cart.reduce((total, item) => total + item.quantity, 0);
        cartCount.textContent = count;
    } catch (error) {
        console.error('Sepet sayısı güncelleme hatası:', error);
        cartCount.textContent = '0';
    }
}

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    updateUserMenu();
}); 

document.querySelectorAll('.toggle-details-btn').forEach(button => {
    button.addEventListener('click', (e) => {
        e.preventDefault();
        const detailsDiv = button.previousElementSibling; // Butondan önceki .project-details divi
        if (detailsDiv.style.display === 'none') {
            detailsDiv.style.display = 'block';
            button.textContent = 'Detayları Gizle';
        } else {
            detailsDiv.style.display = 'none';
            button.textContent = 'Detayları Gör';
        }
    });
}); 