// DOM Elements
const categoriesList = document.querySelector('#categoriesList');
const addCategoryForm = document.querySelector('#addCategoryForm');
const editCategoryForm = document.querySelector('#editCategoryForm');

// Event Listeners
document.addEventListener('DOMContentLoaded', loadCategories);

if (addCategoryForm) {
    addCategoryForm.addEventListener('submit', handleAddCategory);
}

if (editCategoryForm) {
    editCategoryForm.addEventListener('submit', handleEditCategory);
}

// Functions
function loadCategories() {
    const categories = JSON.parse(localStorage.getItem('categories')) || [];
    renderCategories(categories);
}

function renderCategories(categories) {
    if (!categoriesList) return;

    if (categories.length === 0) {
        categoriesList.innerHTML = `
            <div class="alert alert-info">
                Henüz kategori bulunmuyor.
            </div>
        `;
        return;
    }

    categoriesList.innerHTML = categories.map(category => `
        <div class="col-md-4 mb-4">
            <div class="card h-100">
                <div class="card-body">
                    <h5 class="card-title">${category.name}</h5>
                    <p class="card-text">${category.description || ''}</p>
                    <div class="d-flex justify-content-between align-items-center">
                        <small class="text-muted">
                            ${category.productCount || 0} ürün
                        </small>
                        <div>
                            <button class="btn btn-primary btn-sm me-2" onclick="editCategory(${category.id})">
                                <i class="fas fa-edit"></i> Düzenle
                            </button>
                            <button class="btn btn-danger btn-sm" onclick="deleteCategory(${category.id})">
                                <i class="fas fa-trash"></i> Sil
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function handleAddCategory(e) {
    e.preventDefault();

    const name = document.querySelector('#categoryName').value;
    const description = document.querySelector('#categoryDescription').value;

    if (!name) {
        showToast('Kategori adı gereklidir', 'danger');
        return;
    }

    const categories = JSON.parse(localStorage.getItem('categories')) || [];
    
    // Kategori adı kontrolü
    if (categories.some(c => c.name.toLowerCase() === name.toLowerCase())) {
        showToast('Bu kategori adı zaten kullanılıyor', 'danger');
        return;
    }

    const newCategory = {
        id: Date.now(),
        name: name,
        description: description,
        created_at: new Date().toISOString()
    };

    categories.push(newCategory);
    localStorage.setItem('categories', JSON.stringify(categories));

    showToast('Kategori başarıyla eklendi', 'success');
    e.target.reset();
    loadCategories();
}

function handleEditCategory(e) {
    e.preventDefault();

    const id = parseInt(document.querySelector('#editCategoryId').value);
    const name = document.querySelector('#editCategoryName').value;
    const description = document.querySelector('#editCategoryDescription').value;

    if (!name) {
        showToast('Kategori adı gereklidir', 'danger');
        return;
    }

    const categories = JSON.parse(localStorage.getItem('categories')) || [];
    const categoryIndex = categories.findIndex(c => c.id === id);

    if (categoryIndex === -1) {
        showToast('Kategori bulunamadı', 'danger');
        return;
    }

    // Kategori adı kontrolü
    if (categories.some(c => c.id !== id && c.name.toLowerCase() === name.toLowerCase())) {
        showToast('Bu kategori adı zaten kullanılıyor', 'danger');
        return;
    }

    categories[categoryIndex] = {
        ...categories[categoryIndex],
        name: name,
        description: description,
        updated_at: new Date().toISOString()
    };

    localStorage.setItem('categories', JSON.stringify(categories));

    showToast('Kategori başarıyla güncellendi', 'success');
    e.target.reset();
    loadCategories();
}

function editCategory(id) {
    const categories = JSON.parse(localStorage.getItem('categories')) || [];
    const category = categories.find(c => c.id === id);

    if (!category) {
        showToast('Kategori bulunamadı', 'danger');
        return;
    }

    document.querySelector('#editCategoryId').value = category.id;
    document.querySelector('#editCategoryName').value = category.name;
    document.querySelector('#editCategoryDescription').value = category.description || '';

    const editModal = new bootstrap.Modal(document.querySelector('#editCategoryModal'));
    editModal.show();
}

function deleteCategory(id) {
    if (!confirm('Bu kategoriyi silmek istediğinizden emin misiniz?')) {
        return;
    }

    const categories = JSON.parse(localStorage.getItem('categories')) || [];
    const categoryIndex = categories.findIndex(c => c.id === id);

    if (categoryIndex === -1) {
        showToast('Kategori bulunamadı', 'danger');
        return;
    }

    // Kategoriye ait ürünleri kontrol et
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const categoryProducts = products.filter(p => p.category === categories[categoryIndex].name);

    if (categoryProducts.length > 0) {
        showToast('Bu kategoriye ait ürünler var. Önce ürünleri başka bir kategoriye taşıyın.', 'danger');
        return;
    }

    categories.splice(categoryIndex, 1);
    localStorage.setItem('categories', JSON.stringify(categories));

    showToast('Kategori başarıyla silindi', 'success');
    loadCategories();
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