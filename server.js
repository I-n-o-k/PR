const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const xml2js = require('xml2js');

const app = express();
const port = 3000;

app.use(bodyParser.json());
// Melayani file statis dari direktori root (termasuk folder images)
app.use(express.static(path.join(__dirname, '.')));
// Melayani file statis dari folder 'login' secara khusus
app.use('/login', express.static(path.join(__dirname, 'login')));

// Tambahkan rute ini untuk melayani index.html saat mengunjungi URL root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Tambahkan rute ini untuk mengarahkan pengguna ke login.html
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login', 'login.html'));
});

// Endpoint untuk login
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    fs.readFile('users.json', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: 'Internal server error.' });
        }

        const users = JSON.parse(data);
        const user = users.find(u => u.username === username && u.password === password);

        if (user) {
            res.json({ success: true, message: 'Login successful!', role: user.role, username: user.username, userId: user.userId });
        } else {
            res.status(401).json({ success: false, message: 'Invalid username or password.' });
        }
    });
});

// Fungsi untuk menghasilkan ID pengguna acak 6 digit
function generateUserId() {
    return Math.floor(100000 + Math.random() * 900000);
}

// Endpoint baru untuk pendaftaran
app.post('/api/register', (req, res) => {
    const { username, password, name, phone, address } = req.body;

    fs.readFile('users.json', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: 'Internal server error.' });
        }

        const users = JSON.parse(data);
        
        // Cek apakah username sudah ada
        const userExists = users.some(u => u.username === username);
        if (userExists) {
            return res.status(409).json({ success: false, message: 'Username sudah terdaftar.' });
        }
        
        // Buat pengguna baru dengan role 'user'
        const newUser = {
            userId: generateUserId(),
            username: username,
            password: password,
            name: name || '',
            phone: phone || '',
            address: address || '',
            role: 'user'
        };
        
        users.push(newUser);

        // Tulis data pengguna yang diperbarui ke file
        fs.writeFile('users.json', JSON.stringify(users, null, 4), 'utf8', (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ success: false, message: 'Gagal menyimpan data pengguna.' });
            }
            res.json({ success: true, message: 'Pendaftaran berhasil!' });
        });
    });
});

// Endpoint untuk menyimpan invoice baru
app.post('/api/invoices', (req, res) => {
    const newInvoice = req.body;

    fs.readFile('invoices.json', 'utf8', (err, data) => {
        if (err && err.code !== 'ENOENT') { // Abaikan error jika file tidak ada
            console.error(err);
            return res.status(500).json({ success: false, message: 'Internal server error.' });
        }

        const invoices = data ? JSON.parse(data) : [];
        invoices.unshift(newInvoice); // Tambahkan invoice baru di awal array

        fs.writeFile('invoices.json', JSON.stringify(invoices, null, 2), 'utf8', (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ success: false, message: 'Gagal menyimpan invoice.' });
            }
            res.json({ success: true, message: 'Invoice berhasil disimpan.' });
        });
    });
});

// Endpoint untuk admin mengambil semua invoice
app.get('/api/invoices', (req, res) => {
    // Di aplikasi nyata, Anda harus memvalidasi bahwa ini adalah admin
    fs.readFile('invoices.json', 'utf8', (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                // Jika file tidak ada, kembalikan array kosong
                return res.json([]);
            }
            console.error(err);
            return res.status(500).json({ success: false, message: 'Internal server error.' });
        }

        const invoices = JSON.parse(data);
        res.json(invoices);
    });
});


// Endpoint untuk mengambil data profil pengguna
app.get('/api/profile', (req, res) => {
    const { username } = req.query;

    if (!username) {
        return res.status(400).json({ success: false, message: 'Username is required.' });
    }

    fs.readFile('users.json', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: 'Internal server error.' });
        }

        const users = JSON.parse(data);
        const user = users.find(u => u.username === username);

        if (user) {
            // Kirim data profil pengguna (tanpa kata sandi)
            const userProfile = {
                userId: user.userId,
                username: user.username,
                name: user.name,
                phone: user.phone,
                address: user.address,
                role: user.role
            };
            res.json(userProfile);
        } else {
            res.status(404).json({ success: false, message: 'User not found.' });
        }
    });
});

// Endpoint untuk menyimpan data produk yang diedit
app.post('/api/save-products', (req, res) => {
    const updatedProducts = req.body;

    // Pastikan req.body adalah array produk
    if (!Array.isArray(updatedProducts)) {
        return res.status(400).json({ success: false, message: 'Invalid data format.' });
    }

    const rootElement = {
        'data-packages': {
            'package': updatedProducts.map(product => {
                return {
                    provider: product.provider,
                    validity: product.validity,
                    quota: product.quota,
                    price: product.price
                };
            })
        }
    };

    const builder = new xml2js.Builder({
        rootName: 'data-packages'
    });
    const xml = builder.buildObject(rootElement['data-packages']);

    fs.writeFile('harga.xml', xml, (err) => {
        if (err) {
            console.error('Failed to write to harga.xml:', err);
            return res.status(500).json({ success: false, message: 'Failed to save products.' });
        }
        res.json({ success: true, message: 'Products saved successfully.' });
    });
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Server Polaris Acc berjalan!`);
    console.log(`- Akses dari komputer ini: http://localhost:${port}`);
    console.log(`- Untuk akses dari perangkat lain di jaringan yang sama, cari tahu IP lokal komputer ini terlebih dahulu.`);
});