// DOM Elements
const loginForm = document.querySelector('#loginForm');
const registerForm = document.querySelector('#registerForm');

// Event Listeners
if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
}

if (registerForm) {
    registerForm.addEventListener('submit', handleRegister);
}

// Functions
function handleLogin(e) {
    e.preventDefault();

    const email = document.querySelector('#email').value;
    const password = document.querySelector('#password').value;
    const rememberMe = document.querySelector('#rememberMe').checked;

    // LocalStorage'dan kullanıcıları al
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Kullanıcıyı bul
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        // Kullanıcı bilgilerini localStorage'a kaydet
        localStorage.setItem('currentUser', JSON.stringify({
            id: user.id,
            name: user.username,
            email: user.email
        }));

        if (rememberMe) {
            localStorage.setItem('rememberMe', 'true');
        }

        showToast('Giriş başarılı!', 'success');
        // Dashboard'a yönlendir
        window.location.href = 'index.html';
    } else {
        showToast('Geçersiz email veya şifre', 'danger');
    }
}

function handleRegister(e) {
    e.preventDefault();

    const name = document.querySelector('#name').value;
    const email = document.querySelector('#email').value;
    const password = document.querySelector('#password').value;
    const confirmPassword = document.querySelector('#confirmPassword').value;

    if (password !== confirmPassword) {
        showToast('Şifreler eşleşmiyor', 'danger');
        return;
    }

    // LocalStorage'dan kullanıcıları al
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Email kontrolü
    if (users.some(u => u.email === email)) {
        showToast('Bu email adresi zaten kayıtlı', 'danger');
        return;
    }

    // Yeni kullanıcı oluştur
    const newUser = {
        id: Date.now(),
        username: name,
        email: email,
        password: password,
        created_at: new Date().toISOString()
    };

    // Kullanıcıyı kaydet
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    showToast('Kayıt başarılı! Giriş yapabilirsiniz.', 'success');
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 2000);
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