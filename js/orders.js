// DOM Elements
const ordersList = document.querySelector('#ordersList');
const emptyState = document.querySelector('#emptyState');

// Event Listeners
document.addEventListener('DOMContentLoaded', loadOrders);

// Functions
function loadOrders() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    const orders = JSON.parse(localStorage.getItem(`orders_${currentUser.id}`)) || [];
    
    if (orders.length === 0) {
        showEmptyState();
        return;
    }

    renderOrders(orders);
}

function renderOrders(orders) {
    if (!ordersList) return;

    ordersList.innerHTML = orders.map(order => `
        <div class="col-md-6 mb-4">
            <div class="card h-100">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h5 class="mb-0">Sipariş #${order.id}</h5>
                    <span class="badge bg-${getStatusBadgeColor(order.status)}">${getStatusText(order.status)}</span>
                </div>
                <div class="card-body">
                    <div class="mb-3">
                        <strong>Tarih:</strong> ${new Date(order.date).toLocaleString()}
                    </div>
                    <div class="mb-3">
                        <strong>Toplam Tutar:</strong> ${order.total} TL
                    </div>
                    <div class="mb-3">
                        <strong>Ürünler:</strong>
                        <ul class="list-unstyled">
                            ${order.items.map(item => `
                                <li class="d-flex justify-content-between align-items-center">
                                    <span>${item.name}</span>
                                    <span>${item.quantity} adet x ${item.price} TL</span>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                    ${order.status === 'pending' ? `
                        <div class="d-flex justify-content-end">
                            <button class="btn btn-danger btn-sm me-2" onclick="cancelOrder(${order.id})">
                                İptal Et
                            </button>
                        </div>
                    ` : ''}
                </div>
            </div>
        </div>
    `).join('');

    hideEmptyState();
}

function cancelOrder(orderId) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;

    const orders = JSON.parse(localStorage.getItem(`orders_${currentUser.id}`)) || [];
    const orderIndex = orders.findIndex(o => o.id === orderId);

    if (orderIndex === -1) {
        showToast('Sipariş bulunamadı', 'danger');
        return;
    }

    if (orders[orderIndex].status !== 'pending') {
        showToast('Sadece bekleyen siparişler iptal edilebilir', 'danger');
        return;
    }

    // Siparişi iptal et
    orders[orderIndex].status = 'cancelled';
    orders[orderIndex].cancelled_at = new Date().toISOString();

    // Stokları geri ekle
    const products = JSON.parse(localStorage.getItem('products')) || [];
    orders[orderIndex].items.forEach(item => {
        const productIndex = products.findIndex(p => p.id === item.productId);
        if (productIndex !== -1) {
            products[productIndex].stock += item.quantity;
        }
    });

    // LocalStorage'ı güncelle
    localStorage.setItem(`orders_${currentUser.id}`, JSON.stringify(orders));
    localStorage.setItem('products', JSON.stringify(products));

    showToast('Sipariş başarıyla iptal edildi', 'success');
    loadOrders();
}

function showEmptyState() {
    if (emptyState) {
        emptyState.style.display = 'block';
    }
    if (ordersList) {
        ordersList.innerHTML = '';
    }
}

function hideEmptyState() {
    if (emptyState) {
        emptyState.style.display = 'none';
    }
}

// Yardımcı fonksiyonlar
function getStatusBadgeColor(status) {
    switch (status) {
        case 'pending':
            return 'warning';
        case 'completed':
            return 'success';
        case 'cancelled':
            return 'danger';
        default:
            return 'secondary';
    }
}

function getStatusText(status) {
    switch (status) {
        case 'pending':
            return 'Beklemede';
        case 'completed':
            return 'Tamamlandı';
        case 'cancelled':
            return 'İptal Edildi';
        default:
            return status;
    }
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