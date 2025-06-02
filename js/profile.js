// API URL
const API_URL = 'http://localhost:3000/api';

// DOM Elements
const profileForm = document.querySelector('#profileForm');
const nameInput = document.querySelector('#name');
const emailInput = document.querySelector('#email');
const currentPasswordInput = document.querySelector('#currentPassword');
const newPasswordInput = document.querySelector('#newPassword');
const confirmPasswordInput = document.querySelector('#confirmPassword');
const totalStocksSpan = document.getElementById('totalStocks');
const totalFavoritesSpan = document.getElementById('totalFavorites');
const lastLoginSpan = document.getElementById('lastLogin');
const stockHistoryDiv = document.getElementById('stockHistory');
const logoutBtn = document.getElementById('logoutBtn');
const userMenu = document.getElementById('userMenu');
const userNameDisplay = document.getElementById('userNameDisplay');

// Event Listeners
if (profileForm) {
    profileForm.addEventListener('submit', handleProfileUpdate);
    loadUserProfile();
}

// Functions
function loadUserProfile() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
        nameInput.value = currentUser.name;
        emailInput.value = currentUser.email;
    }
}

function handleProfileUpdate(e) {
    e.preventDefault();

    const name = nameInput.value;
    const email = emailInput.value;
    const currentPassword = currentPasswordInput.value;
    const newPassword = newPasswordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    // LocalStorage'dan kullanıcıları al
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    // Mevcut kullanıcıyı bul
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    
    if (userIndex === -1) {
        showToast('Kullanıcı bulunamadı', 'danger');
        return;
    }

    // Şifre değişikliği kontrolü
    if (currentPassword) {
        if (users[userIndex].password !== currentPassword) {
            showToast('Mevcut şifre yanlış', 'danger');
            return;
        }

        if (newPassword !== confirmPassword) {
            showToast('Yeni şifreler eşleşmiyor', 'danger');
            return;
        }

        users[userIndex].password = newPassword;
    }

    // Email değişikliği kontrolü
    if (email !== users[userIndex].email) {
        if (users.some(u => u.email === email && u.id !== currentUser.id)) {
            showToast('Bu email adresi zaten kullanılıyor', 'danger');
            return;
        }
        users[userIndex].email = email;
    }

    // Kullanıcı bilgilerini güncelle
    users[userIndex].username = name;
    
    // LocalStorage'ı güncelle
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify({
        id: currentUser.id,
        name: name,
        email: email
    }));

    showToast('Profil başarıyla güncellendi', 'success');
    
    // Form alanlarını temizle
    currentPasswordInput.value = '';
    newPasswordInput.value = '';
    confirmPasswordInput.value = '';
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

// Son eklenen stokları yükle
async function loadRecentStocks() {
    try {
        const response = await fetch('/api/stocks/recent', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            throw new Error('Stok bilgileri alınamadı');
        }

        const data = await response.json();
        const tableBody = document.getElementById('recentStocksTable');
        tableBody.innerHTML = '';

        data.stocks.forEach(stock => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${stock.name}</td>
                <td>${stock.price.toFixed(2)} TL</td>
                <td>${stock.quantity}</td>
                <td>${new Date(stock.created_at).toLocaleString()}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="viewStock(${stock.id})">Görüntüle</button>
                    <button class="btn btn-sm btn-success" onclick="addToFavorites(${stock.id})">Favorilere Ekle</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Stok yükleme hatası:', error);
        showAlert('Stok bilgileri yüklenirken bir hata oluştu', 'danger');
    }
}

// Profil düzenleme modalını göster
function showEditProfileModal() {
    const modal = new bootstrap.Modal(document.getElementById('editProfileModal'));
    document.getElementById('newUsername').value = document.getElementById('username').value;
    document.getElementById('newEmail').value = document.getElementById('email').value;
    modal.show();
}

// Stok detaylarını görüntüle
function viewStock(stockId) {
    window.location.href = `stock-details.html?id=${stockId}`;
}

// Favorilere ekle
async function addToFavorites(stockId) {
    try {
        const response = await fetch('/api/favorites', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ stock_id: stockId })
        });

        if (!response.ok) {
            throw new Error('Favorilere eklenemedi');
        }

        showAlert('Stok favorilere eklendi', 'success');
    } catch (error) {
        console.error('Favori ekleme hatası:', error);
        showAlert('Stok favorilere eklenirken bir hata oluştu', 'danger');
    }
}

// Çıkış yap
function logout() {
    localStorage.removeItem('token');
    window.location.href = 'index.html';
}

// Alert göster
function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.querySelector('.container').insertAdjacentElement('afterbegin', alertDiv);
    setTimeout(() => alertDiv.remove(), 5000);
}

// UI Güncelleme
function updateUI() {
    if (currentUser) {
        userMenu.style.display = 'flex';
        userNameDisplay.textContent = currentUser.name;
    } else {
        userMenu.style.display = 'none';
    }
}

// İstatistikleri Yükle
async function loadStats() {
    try {
        const response = await fetch(`${API_URL}/users/stats`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (response.ok) {
            const stats = await response.json();
            totalStocksSpan.textContent = stats.totalStocks;
            totalFavoritesSpan.textContent = stats.totalFavorites;
            lastLoginSpan.textContent = new Date(stats.lastLogin).toLocaleString();
        } else {
            const data = await response.json();
            alert(data.error);
        }
    } catch (error) {
        console.error('İstatistik yükleme hatası:', error);
        alert('İstatistikler yüklenirken bir hata oluştu');
    }
}

// Stok Geçmişini Yükle
async function loadStockHistory() {
    try {
        const response = await fetch(`${API_URL}/users/stocks`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (response.ok) {
            const stocks = await response.json();
            updateStockHistory(stocks);
        } else {
            const data = await response.json();
            alert(data.error);
        }
    } catch (error) {
        console.error('Stok geçmişi yükleme hatası:', error);
        alert('Stok geçmişi yüklenirken bir hata oluştu');
    }
}

// Stok Geçmişini Güncelle
function updateStockHistory(stocks) {
    stockHistoryDiv.innerHTML = '';
    
    stocks.forEach(stock => {
        const stockElement = document.createElement('div');
        stockElement.className = 'list-group-item';
        stockElement.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <h6 class="mb-1">${stock.name}</h6>
                    <small class="text-muted">${new Date(stock.created_at).toLocaleString()}</small>
                </div>
                <div>
                    <span class="badge bg-primary rounded-pill">${stock.price}</span>
                    <button class="btn btn-sm btn-outline-danger ms-2" onclick="deleteStock(${stock.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        stockHistoryDiv.appendChild(stockElement);
    });
}

// Stok Silme
async function deleteStock(id) {
    if (!confirm('Bu stoku silmek istediğinizden emin misiniz?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/stocks/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (response.ok) {
            loadStats();
            loadStockHistory();
        } else {
            const data = await response.json();
            alert(data.error);
        }
    } catch (error) {
        console.error('Stok silme hatası:', error);
        alert('Stok silinirken bir hata oluştu');
    }
} 