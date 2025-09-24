document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');
    const formTitle = document.getElementById('form-title');
    const formSubtitle = document.getElementById('form-subtitle');
    const formButton = document.getElementById('form-button');
    const switchToRegister = document.getElementById('switch-to-register');
    const switchToLogin = document.getElementById('switch-to-login');
    const nameInput = document.getElementById('name-input');
    const phoneInput = document.getElementById('phone-input');
    const addressInput = document.getElementById('address-input');

    let isLoginMode = true;

    // Jika sudah login, redirect ke halaman utama
    if (sessionStorage.getItem('userRole')) {
        window.location.href = '/index.html';
    }
    
    // Fungsi untuk beralih mode formulir
    function switchFormMode(mode) {
        if (mode === 'register') {
            isLoginMode = false;
            formTitle.textContent = 'Buat Akun Baru';
            formSubtitle.textContent = 'Isi data di bawah untuk mendaftar.';
            formButton.textContent = 'Daftar';
            switchToRegister.style.display = 'none';
            switchToLogin.style.display = 'block';
            nameInput.style.display = 'block';
            phoneInput.style.display = 'block';
            addressInput.style.display = 'block';
        } else {
            isLoginMode = true;
            formTitle.textContent = 'Selamat Datang Kembali';
            formSubtitle.textContent = 'Silakan login untuk melanjutkan.';
            formButton.textContent = 'Masuk';
            switchToRegister.style.display = 'block';
            switchToLogin.style.display = 'none';
            nameInput.style.display = 'none';
            phoneInput.style.display = 'none';
            addressInput.style.display = 'none';
        }
        errorMessage.textContent = '';
        errorMessage.style.display = 'none';
        loginForm.reset();
    }

    switchToRegister.addEventListener('click', function(event) {
        event.preventDefault();
        switchFormMode('register');
    });

    switchToLogin.addEventListener('click', function(event) {
        event.preventDefault();
        switchFormMode('login');
    });

    loginForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        errorMessage.textContent = '';
        errorMessage.style.display = 'none';

        const username = loginForm.username.value;
        const password = loginForm.password.value;
        const url = isLoginMode ? '/api/login' : '/api/register';
        
        let body = { username, password };
        if (!isLoginMode) {
            body.name = loginForm.name.value;
            body.phone = loginForm.phone.value;
            body.address = loginForm.address.value;
        }

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            const data = await response.json();

            if (response.ok && data.success) {
                if (isLoginMode) {
                    sessionStorage.setItem('userRole', data.role);
                    sessionStorage.setItem('username', data.username);
                    sessionStorage.setItem('userId', data.userId);
                    window.location.href = '/index.html';
                } else {
                    alert('Pendaftaran berhasil! Silakan masuk dengan akun Anda.');
                    switchFormMode('login');
                }
            } else {
                errorMessage.textContent = data.message || (isLoginMode ? 'Login gagal. Periksa username dan password Anda.' : 'Pendaftaran gagal.');
                errorMessage.style.display = 'block';
            }
        } catch (error) {
            console.error('Error:', error);
            errorMessage.textContent = 'Terjadi kesalahan. Mohon coba lagi nanti.';
            errorMessage.style.display = 'block';
        }
    });
});