const homeMenu = document.getElementById('home-menu');
const riwayatMenu = document.getElementById('riwayat-menu');
const profilMenu = document.getElementById('profil-menu');
const cartMenu = document.getElementById('cart-menu');
const logoutButton = document.getElementById('logout-button');

const productList = document.getElementById('product-list');
const riwayatPembelian = document.getElementById('riwayat-pembelian');
const menuProfil = document.getElementById('menu-profil');
const searchInvoiceInput = document.getElementById('search-invoice');
const productGrid = document.getElementById('product-grid');
const cartSection = document.getElementById('shopping-cart-section');
const editProfileFormSection = document.getElementById('edit-profil-form');

let isAdmin = false;

// Variabel global untuk menyimpan data produk dari XML
let dataPackages = [];
let cart = {};

// Temukan elemen-elemen baru
const checkoutButton = document.getElementById('checkout-button');
const confirmationModal = document.getElementById('confirmation-modal');
const closeModalButton = confirmationModal.querySelector('.close-button');
const confirmPurchaseButton = document.getElementById('confirm-purchase-button');
const modalCancelButton = confirmationModal.querySelector('.cancel-button');
const modalTotalPriceSpan = document.getElementById('modal-total-price');
const editProfileMenu = document.getElementById('edit-profile-menu');
const editProfileForm = document.getElementById('edit-profile-form');
const editNameInput = document.getElementById('edit-name');
const editPhoneInput = document.getElementById('edit-phone');
const editAddressInput = document.getElementById('edit-address');

// Variabel untuk menyimpan riwayat pembelian
let riwayatPesanan = [];

// Tambahkan variabel baru untuk nota
const invoiceSection = document.getElementById('invoice-section');
const invoiceDetails = document.getElementById('invoice-details');
const downloadButton = document.getElementById('download-invoice-button');

// Tambahkan elemen pop-up
const cartSummaryPopup = document.getElementById('cart-summary-popup');
const popupItemCount = document.getElementById('popup-item-count');
const popupTotalPrice = document.getElementById('popup-total-price');


const providerLogos = {
    "Telkomsel": "images/telkomsel-logo-full.png",
    "Axis": "images/axis-logo.png",
    "Three": "images/three-logo.png",
    "Indosat": "images/indosat-logo.png",
    "XL": "images/xl-logo.png",
    "Smartfren": "images/smartfren-logo.png",
    "By.u": "images/byu-logo.png"
};

// Fungsi untuk cek status login saat halaman dimuat
function checkLoginStatus() {
    const userRole = sessionStorage.getItem('userRole');
    if (!userRole) {
        // Redirect ke halaman login jika belum login
        window.location.href = 'login/login.html';
    } else {
        // Jika sudah login, cek apakah admin
        if (userRole === 'admin') {
            isAdmin = true; // Set isAdmin ke true
            riwayatMenu.textContent = 'Invoice'; // Ubah teks menu Riwayat menjadi Invoice
            // Ubah ikon keranjang menjadi status admin
            cartMenu.innerHTML = `<span class="admin-status-text">Admin</span>`;
            cartMenu.classList.add('admin-status-button');
            cartMenu.removeAttribute('href'); // Hapus link agar tidak bisa diklik
        } else {
            isAdmin = false; // Set isAdmin ke false
            riwayatMenu.textContent = 'Riwayat'; // Pastikan teks menu adalah Riwayat untuk pengguna biasa
            // Pastikan ikon keranjang ditampilkan untuk pengguna biasa
            cartMenu.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="cart-icon">
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="M1 1h4l2.68 12.06a2 2 0 0 0 2 1.94h9.32a2 2 0 0 0 2-1.94L23 6H6"></path>
                </svg>`;
            cartMenu.classList.remove('admin-status-button');
            cartMenu.href = '#';
        }
        // Tampilkan konten utama
        document.body.style.display = 'block';
        // Memuat profil pengguna
        loadUserProfile();
    }
}

// Fungsi untuk logout
function handleLogout() {
    sessionStorage.removeItem('userRole');
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('userId');
}

function formatRupiah(angka) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(angka);
}

function createProductElement(product, index) {
    const productBox = document.createElement('div');
    productBox.className = 'product-box';
    productBox.dataset.productIndex = index;

    const logoSrc = providerLogos[product.provider] || 'placeholder.png';
    const logoHtml = `<img src="${logoSrc}" alt="Logo ${product.provider}" class="product-full-logo">`;

    const formattedPrice = formatRupiah(product.price);
    const providerName = product.provider === "Telkomsel" ? "Tsel" : product.provider;
    const productName = `${providerName} ${product.quota} ${product.validity}`;
    const currentQuantity = cart[index] ? cart[index].quantity : 0;

    productBox.innerHTML = `
        ${logoHtml}
        <div class="product-bottom-text">
            <p class="product-name">${productName}</p>
            <p class="product-price">${formattedPrice}</p>
        </div>
        <div class="quantity-controls">
            <button class="btn-minus" data-action="minus">-</button>
            <span class="product-quantity">${currentQuantity}</span>
            <button class="btn-plus" data-action="plus">+</button>
        </div>
        <button class="edit-button ${isAdmin ? '' : 'hidden'}">Edit</button>
    `;
    
    return productBox;
}

function renderAllProducts(data) {
    productGrid.innerHTML = '';
    
    data.forEach((product, index) => {
        const productElement = createProductElement(product, index);
        productGrid.appendChild(productElement);
    });
}

// Fungsi untuk memuat data profil pengguna
async function loadUserProfile() {
    const username = sessionStorage.getItem('username');
    if (username) {
        try {
            const response = await fetch(`/api/profile?username=${username}`);
            const profile = await response.json();
            document.getElementById('profile-display-name').textContent = profile.name || profile.username;
            document.getElementById('profile-display-id').textContent = profile.userId;
            document.getElementById('profile-phone').textContent = profile.phone || '-';
            document.getElementById('profile-address').textContent = profile.address || '-';
            editNameInput.value = profile.name || '';
            editPhoneInput.value = profile.phone || '';
            editAddressInput.value = profile.address || '';
        } catch (error) {
            console.error('Gagal memuat profil pengguna:', error);
        }
    }
}


function renderCart() {
    const cartItemsList = document.getElementById('cart-items');
    const totalPriceSpan = document.getElementById('total-price');
    
    cartItemsList.innerHTML = '';
    let totalPrice = 0;
    
    for (const index in cart) {
        if (cart.hasOwnProperty(index)) {
            const item = cart[index];
            const listItem = document.createElement('li');
            const subtotal = item.product.price * item.quantity;
            
            listItem.innerHTML = `
                <span>${item.product.name} (x${item.quantity})</span>
                <span>${formatRupiah(subtotal)}</span>
            `;
            cartItemsList.appendChild(listItem);
            
            totalPrice += subtotal;
        }
    }
    
    totalPriceSpan.textContent = formatRupiah(totalPrice);
}

// Fungsi untuk merender riwayat pembelian
function renderHistory() {
    riwayatPembelian.innerHTML = '<h2>Riwayat Pembelian</h2>';
    if (riwayatPesanan.length === 0) {
        riwayatPembelian.innerHTML += '<p>Belum ada riwayat pembelian.</p>';
        return;
    }
    riwayatPesanan.forEach((order, index) => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item clickable-history-item';
        historyItem.dataset.orderId = order.id; // Tambahkan data-order-id
        historyItem.innerHTML = `
            <h3>Pesanan #${riwayatPesanan.length - index}</h3>
            <p>Tanggal: ${order.date}</p>
            <p>Total: ${formatRupiah(order.totalPrice)}</p>
        `;
        riwayatPembelian.appendChild(historyItem);
    });
}


function hideAllSections() {
    productList.style.display = 'none';
    riwayatPembelian.style.display = 'none';
    menuProfil.style.display = 'none';
    cartSection.style.display = 'none';
    editProfileFormSection.style.display = 'none';
    invoiceSection.style.display = 'none';
}

// Fungsi untuk membuat nota dan menampilkannya
function generateAndShowInvoice(order) {
    const invoiceContent = document.createElement('pre');
    const date = new Date().toLocaleString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    }).replace(/\./g, ':'); // Replace periods with colons for consistency

    let invoiceText = `------------\n`;
    invoiceText += `         Polaris Acc - Invoice        \n`;
    invoiceText += `------------\n`;
    invoiceText += `Tanggal: ${date}\n`;
    invoiceText += `No. Pesanan: #${order.id}\n`;
    invoiceText += `\n`;
    invoiceText += `Item:\n`;

    // Group items by provider
    const groupedByProvider = {};
    order.items.forEach(item => {
        const productData = dataPackages.find(p => p.name === item.name);
        const provider = productData ? productData.provider : 'Unknown Provider';
        if (!groupedByProvider[provider]) {
            groupedByProvider[provider] = [];
        }
        groupedByProvider[provider].push(item);
    });

    // Iterate through the grouped providers and their items
    for (const provider in groupedByProvider) {
        if (groupedByProvider.hasOwnProperty(provider)) {
            const displayedProvider = provider === "Telkomsel" ? "Tsel" : provider;
            invoiceText += `• ${displayedProvider}\n`;
            groupedByProvider[provider].forEach(item => {
                const subtotal = item.price * item.quantity;
                
                const originalProduct = dataPackages.find(p => p.name === item.name);
                const displayedName = originalProduct ? `${originalProduct.quota} ${originalProduct.validity}` : item.name;

                const paddedName = `- ${displayedName}`.padEnd(15);
                const paddedQuantity = `x ${String(item.quantity).padStart(2)}`;
                const paddedPrice = `= ${formatRupiah(subtotal).padStart(10)}`;
                invoiceText += `${paddedName}${paddedQuantity} ${paddedPrice}\n`;
            });
        }
    }

    invoiceText += `\n`;
    invoiceText += `Total Harga: ${formatRupiah(order.totalPrice)}\n`;
    invoiceText += `------------\n`;
    invoiceText += `    Terima kasih telah berbelanja!    \n`;
    invoiceText += `------------\n`;

    invoiceDetails.textContent = invoiceText;
    hideAllSections();
    invoiceSection.style.display = 'block';

    // Konversi nota ke gambar menggunakan html2canvas
    html2canvas(document.querySelector('#invoice-details')).then(canvas => {
        const imageData = canvas.toDataURL('image/png');
        downloadButton.href = imageData;
    });
}

// Fungsi baru untuk menyimpan perubahan ke server
async function saveChanges() {
    try {
        const simplifiedProducts = dataPackages.map(p => {
            return {
                provider: p.provider,
                validity: p.validity,
                quota: p.quota,
                price: p.price
            };
        });

        const response = await fetch('/api/save-products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(simplifiedProducts)
        });

        const result = await response.json();
        if (response.ok) {
            alert(result.message);
        } else {
            alert('Gagal menyimpan perubahan: ' + result.message);
        }
    } catch (error) {
        console.error('Error saving changes:', error);
        alert('Terjadi kesalahan saat menyimpan perubahan.');
    }
}


// Event listener untuk tombol unduh dan kirim WA
downloadButton.addEventListener('click', function(event) {
    event.preventDefault(); // Mencegah aksi default dari link

    // 1. Trigger download gambar
    const link = document.createElement('a');
    link.href = downloadButton.href;
    link.download = downloadButton.download;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // 2. Kirim nota ke WhatsApp Admin
    const adminPhoneNumber = '6282280052830'; // Ganti dengan nomor WA admin yang benar
    const invoiceText = document.getElementById('invoice-details').textContent;
    const whatsappUrl = `https://wa.me/${adminPhoneNumber}?text=${encodeURIComponent(invoiceText)}`;
    window.open(whatsappUrl, '_blank');
});

// Event listener untuk pengaturan akun
editProfileMenu.addEventListener('click', function(event) {
    event.preventDefault();
    hideAllSections();
    editProfileFormSection.style.display = 'block';
});

// Event listener untuk membatalkan edit profil
document.getElementById('cancel-edit-profile').addEventListener('click', function(event) {
    event.preventDefault();
    hideAllSections();
    menuProfil.style.display = 'block';
});

// Event listener untuk formulir edit profil
editProfileForm.addEventListener('submit', async function(event) {
    event.preventDefault();

    const username = sessionStorage.getItem('username');
    const name = editProfileForm.name.value;
    const phone = editProfileForm.phone.value;
    const address = editProfileForm.address.value;

    // Kirim data ke server untuk diupdate (contoh)
    console.log('Data yang akan diupdate:', { username, name, phone, address });
    alert('Profil berhasil diupdate (simulasi).');

    // Kembali ke tampilan profil
    hideAllSections();
    menuProfil.style.display = 'block';
    loadUserProfile();
});


// Fungsi untuk memuat data dari file XML
async function loadData() {
    try {
        const response = await fetch('harga.xml');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const xmlText = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, "text/xml");
        
        const packages = xmlDoc.getElementsByTagName("package");
        const loadedDataPackages = [];
        
        for (let i = 0; i < packages.length; i++) {
            const pkg = packages[i];
            const provider = pkg.getElementsByTagName("provider")[0].textContent;
            const validity = pkg.getElementsByTagName("validity")[0].textContent;
            const quota = pkg.getElementsByTagName("quota")[0].textContent;
            const price = parseFloat(pkg.getElementsByTagName("price")[0].textContent);
            
            loadedDataPackages.push({ 
                provider, 
                validity, 
                quota, 
                price, 
                name: `${provider} ${quota} ${validity}` // Menyesuaikan format nama
            });
        }
        dataPackages = loadedDataPackages; // Menyimpan data ke variabel global
        renderAllProducts(dataPackages);
    } catch (error) {
        console.error('Ada masalah saat memuat data:', error);
        productGrid.innerHTML = '<p>Gagal memuat produk. Mohon periksa file harga.xml dan pastikan Anda menggunakan server lokal.</p>';
    }
}

// Fungsi untuk menangani proses checkout dan membuat nota
async function handleCheckout() {
    let totalPrice = 0;
    let orderItems = [];
    const username = sessionStorage.getItem('username');
    const userId = sessionStorage.getItem('userId');

    // Mengumpulkan data produk di keranjang
    for (const index in cart) {
        if (cart.hasOwnProperty(index)) {
            const item = cart[index];
            totalPrice += item.product.price * item.quantity;
            orderItems.push({
                name: item.product.name,
                quantity: item.quantity,
                price: item.product.price
            });
        }
    }
    
    // Simpan pesanan ke riwayat
    const newOrder = {
        id: Date.now(),
        date: new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }),
        totalPrice: totalPrice,
        items: orderItems,
        user: { // Tambahkan informasi pengguna
            username: username,
            userId: userId
        }
    };
    riwayatPesanan.unshift(newOrder); // Tambahkan di awal array
    
    // Kirim invoice ke server
    try {
        await fetch('/api/invoices', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newOrder)
        });
    } catch (error) {
        console.error('Gagal mengirim invoice ke server:', error);
        // Lanjutkan proses meskipun gagal mengirim, agar tidak mengganggu user
    }

    generateAndShowInvoice(newOrder);

    // Reset keranjang
    cart = {};
    renderCart();
    renderAllProducts(dataPackages);
    
    // Tutup modal
    confirmationModal.style.display = 'none';
}

function showCartSummaryPopup() {
    let totalItems = 0;
    let totalPrice = 0;

    for (const index in cart) {
        if (cart.hasOwnProperty(index)) {
            totalItems += cart[index].quantity;
            totalPrice += cart[index].product.price * cart[index].quantity;
        }
    }

    if (totalItems > 0) {
        popupItemCount.textContent = totalItems;
        popupTotalPrice.textContent = formatRupiah(totalPrice);
        cartSummaryPopup.style.display = 'block';
        setTimeout(() => {
            cartSummaryPopup.classList.add('show');
        }, 10); // sedikit delay agar transisi berjalan
    } else {
        hideCartSummaryPopup();
    }
}

function hideCartSummaryPopup() {
    cartSummaryPopup.classList.remove('show');
    setTimeout(() => {
        cartSummaryPopup.style.display = 'none';
    }, 500); // Sesuai dengan durasi transisi
}


// Event listener untuk tombol "Beli Sekarang"
checkoutButton.addEventListener('click', function() {
    let totalPrice = 0;
    for (const index in cart) {
        if (cart.hasOwnProperty(index)) {
            const item = cart[index];
            totalPrice += item.product.price * item.quantity;
        }
    }

    if (totalPrice === 0) {
        alert('Keranjang belanja Anda kosong!');
        return;
    }

    modalTotalPriceSpan.textContent = formatRupiah(totalPrice);
    confirmationModal.style.display = 'flex';
});

// Event listener untuk tombol "Ya, Beli" di modal
confirmPurchaseButton.addEventListener('click', function() {
    handleCheckout();
    hideCartSummaryPopup(); // Tambahkan ini saat checkout berhasil
});

// Event listener untuk tombol "Batal" dan tombol tutup (x) di modal
closeModalButton.addEventListener('click', function() {
    confirmationModal.style.display = 'none';
});

modalCancelButton.addEventListener('click', function() {
    confirmationModal.style.display = 'none';
});

// Event listener untuk klik di luar modal
window.addEventListener('click', function(event) {
    if (event.target === confirmationModal) {
        confirmationModal.style.display = 'none';
    }
});


homeMenu.addEventListener('click', function(event) {
    event.preventDefault();
    hideAllSections();
    productList.style.display = 'block';
    showCartSummaryPopup(); // Tampilkan pop-up saat kembali ke beranda
});

riwayatMenu.addEventListener('click', async function(event) {
    event.preventDefault();
    hideAllSections();
    riwayatPembelian.style.display = 'block';
    hideCartSummaryPopup(); // Sembunyikan pop-up saat masuk ke riwayat

    if (isAdmin) {
        // Mode Admin: Tampilkan semua invoice dari server
        riwayatPembelian.innerHTML = '<h2>Semua Invoice Pengguna</h2>';
        try {
            const response = await fetch('/api/invoices');
            const allInvoices = await response.json();

            if (allInvoices.length === 0) {
                riwayatPembelian.innerHTML += '<p>Belum ada invoice yang dibuat oleh pengguna.</p>';
                return;
            }

            allInvoices.forEach((order) => {
                const historyItem = document.createElement('div');
                historyItem.className = 'history-item clickable-history-item';
                historyItem.dataset.orderId = order.id;
                historyItem.innerHTML = `
                    <h3>Pesanan dari: ${order.user.username || 'N/A'}</h3>
                    <p>Tanggal: ${order.date}</p>
                    <p>Total: ${formatRupiah(order.totalPrice)}</p>
                `;
                riwayatPembelian.appendChild(historyItem);
            });
            // Simpan juga ke riwayat lokal agar bisa diklik
            riwayatPesanan = allInvoices;
        } catch (error) {
            console.error('Gagal mengambil data invoice:', error);
            riwayatPembelian.innerHTML += '<p>Gagal memuat data invoice dari server.</p>';
        }
    } else {
        // Mode Pengguna Biasa: Tampilkan riwayat pribadi
        renderHistory();
    }
});

searchInvoiceInput.addEventListener('input', function() {
    const searchTerm = this.value.toLowerCase();
    const filteredInvoices = riwayatPesanan.filter(order => {
        const username = order.user.username ? order.user.username.toLowerCase() : '';
        const date = order.date ? order.date.toLowerCase() : '';
        const totalPrice = order.totalPrice ? formatRupiah(order.totalPrice).toLowerCase() : '';
        return username.includes(searchTerm) ||
               date.includes(searchTerm) ||
               totalPrice.includes(searchTerm);
    });

    riwayatPembelian.innerHTML = '<h2>Semua Invoice Pengguna</h2>';
    if (filteredInvoices.length === 0) {
        riwayatPembelian.innerHTML += '<p>Tidak ada invoice yang cocok dengan pencarian.</p>';
        return;
    }

    filteredInvoices.forEach(order => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item clickable-history-item';
        historyItem.dataset.orderId = order.id;
        historyItem.innerHTML = `
            <h3>Pesanan dari: ${order.user.username || 'N/A'}</h3>
            <p>Tanggal: ${order.date}</p>
            <p>Total: ${formatRupiah(order.totalPrice)}</p>
        `;
        riwayatPembelian.appendChild(historyItem);
    });

    // Simpan juga ke riwayat lokal agar bisa diklik
    riwayatPesanan = filteredInvoices;
});


// Event listener untuk item riwayat yang bisa diklik
riwayatPembelian.addEventListener('click', function(event) {
    const target = event.target.closest('.clickable-history-item');
    if (target) {
        const orderId = target.dataset.orderId;
        const order = riwayatPesanan.find(o => o.id == orderId);
        if (order) {
            generateAndShowInvoice(order);
            hideCartSummaryPopup(); // Sembunyikan pop-up saat melihat nota
        }
    }
});

profilMenu.addEventListener('click', function(event) {
    event.preventDefault();
    hideAllSections();
    menuProfil.style.display = 'block';
    loadUserProfile(); // Panggil fungsi baru untuk memuat profil
    hideCartSummaryPopup(); // Sembunyikan pop-up saat masuk ke profil
});

cartMenu.addEventListener('click', function(event) {
    event.preventDefault();
    if (isAdmin) return; // Do nothing if admin
    hideAllSections();
    cartSection.style.display = 'block';
    renderCart();
    hideCartSummaryPopup(); // Sembunyikan pop-up saat masuk ke keranjang
});

logoutButton.addEventListener('click', handleLogout);

productGrid.addEventListener('click', function(event) {
    const target = event.target;

    if (target.classList.contains('edit-button') && isAdmin) {
        const productBox = target.closest('.product-box');
        const productIndex = productBox.dataset.productIndex;
        
        const product = dataPackages[productIndex];
        const currentName = product.name;
        const currentPrice = product.price;

        const newName = prompt('Masukkan nama produk baru (contoh: Telkomsel 2GB 1Hari):', currentName);
        const newPrice = prompt('Masukkan harga baru:', currentPrice);
        
        if (newName !== null && newName.trim() !== '') {
            const parts = newName.split(' ');
            if (parts.length >= 3) {
                product.provider = parts[0];
                product.quota = parts[1];
                product.validity = parts[2];
                product.name = newName;
            } else {
                alert("Format nama produk salah. Gunakan format 'Provider Kuota MasaBerlaku'.");
            }
        }
        
        if (newPrice !== null && newPrice.trim() !== '') {
            const newPriceValue = parseInt(newPrice.replace(/\D/g, ''));
            if (!isNaN(newPriceValue)) {
                product.price = newPriceValue;
            } else {
                alert("Harga harus berupa angka.");
            }
        }
        
        renderAllProducts(dataPackages);
        saveChanges();
    }
    
    if (target.classList.contains('btn-minus') || target.classList.contains('btn-plus')) {
        const productBox = target.closest('.product-box');
        const productIndex = parseInt(productBox.dataset.productIndex);
        const quantitySpan = productBox.querySelector('.product-quantity');
        
        let currentQuantity = parseInt(quantitySpan.textContent);
        
        if (target.dataset.action === 'plus') {
            currentQuantity++;
        } else if (target.dataset.action === 'minus' && currentQuantity > 0) {
            currentQuantity--;
        }
        
        quantitySpan.textContent = currentQuantity;
        
        if (currentQuantity > 0) {
            cart[productIndex] = {
                product: dataPackages[productIndex],
                quantity: currentQuantity
            };
        } else {
            delete cart[productIndex];
        }
        
        renderCart();
        showCartSummaryPopup(); // Panggil fungsi pop-up
    }
});

document.addEventListener('DOMContentLoaded', function() {
    checkLoginStatus();
    loadData(); // Memuat data dari file XML saat halaman dimuat
    productList.style.display = 'block';
});