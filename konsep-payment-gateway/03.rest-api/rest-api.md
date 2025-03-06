# REST API: Panduan Lengkap

## Daftar Isi
1. [Pendahuluan](#pendahuluan)
2. [Konsep Dasar REST](#konsep-dasar-rest)
3. [RESTful Resources](#restful-resources)
4. [API Endpoints](#api-endpoints)
5. [Request & Response Format](#request--response-format)
6. [Best Practices](#best-practices)
7. [Implementasi](#implementasi)

## Pendahuluan

REST (Representational State Transfer) adalah standar arsitektur untuk merancang API yang memanfaatkan protokol HTTP. Setelah memahami HTTP basic, kita akan mempelajari bagaimana menerapkannya dalam pembuatan API yang RESTful.

## Konsep Dasar REST

### Apa itu REST API?
REST API adalah gaya arsitektur yang menggunakan HTTP methods untuk mengakses dan memanipulasi resources. Bayangkan seperti perpustakaan:

- **Buku** = Resource
- **Katalog** = API Endpoints
- **Kartu Perpustakaan** = Authentication
- **Sistem Peminjaman** = HTTP Methods

### Prinsip REST
1. **Stateless**
   - Setiap request harus mengandung semua informasi yang diperlukan
   - Tidak bergantung pada request sebelumnya
   - Server tidak menyimpan state client

2. **Client-Server**
   - Pemisahan antara UI dan data storage
   - Client dan server bisa berkembang independen
   - Meningkatkan skalabilitas

3. **Cacheable**
   - Response bisa di-cache
   - Meningkatkan performa
   - Mengurangi beban server

4. **Uniform Interface**
   - Resource identification
   - Resource manipulation through representations
   - Self-descriptive messages
   - HATEOAS (Hypertext As The Engine Of Application State)

## RESTful Resources

### Resource Naming
- Gunakan kata benda, bukan kata kerja
- Gunakan bentuk jamak
- Gunakan lowercase
- Gunakan hyphen (-) untuk pemisah kata

```
✅ Baik:
/users
/blog-posts
/order-items

❌ Buruk:
/getUser
/BlogPosts
/order_items
```

### Resource Hierarchy
```
/users                    # List semua users
/users/123               # User specific
/users/123/orders        # Orders milik user 123
/users/123/orders/456    # Order 456 milik user 123
```

## API Endpoints

Mari kita bayangkan sebuah toko online untuk memahami CRUD operations dan endpoints:

### CRUD Operations (Create, Read, Update, Delete)

Bayangkan kita mengelola produk di toko online:

1. **Create (POST) - Menambah Produk Baru**
```http
# Seperti menambahkan produk baru ke etalase
POST /api/products
Content-Type: application/json

{
    "nama": "Sepatu Nike Air",
    "harga": 1500000,
    "stok": 10,
    "kategori": "sepatu"
}

# Server akan memberikan ID unik untuk produk baru
Response:
{
    "id": "P123",
    "nama": "Sepatu Nike Air",
    "harga": 1500000,
    "stok": 10,
    "kategori": "sepatu"
}
```

2. **Read (GET) - Melihat Produk**
```http
# Melihat semua produk (seperti melihat seluruh etalase)
GET /api/products

# Melihat satu produk spesifik (seperti melihat detail satu produk)
GET /api/products/P123
```

3. **Update (PUT/PATCH) - Mengubah Produk**
```http
# PUT: Mengubah seluruh data produk (seperti mengganti produk dengan yang baru)
PUT /api/products/P123
{
    "nama": "Sepatu Nike Air Max",
    "harga": 2000000,
    "stok": 5,
    "kategori": "sepatu"
}

# PATCH: Mengubah sebagian data (seperti hanya mengubah harga)
PATCH /api/products/P123
{
    "harga": 1800000
}
```

4. **Delete (DELETE) - Menghapus Produk**
```http
# Menghapus produk dari etalase
DELETE /api/products/P123
```

### Query Parameters (Parameter URL)

Bayangkan Anda sedang mencari produk di toko online:

1. **Filtering (Penyaringan)**
```http
# Mencari produk kategori sepatu dengan harga di bawah 1 juta
GET /api/products?kategori=sepatu&harga_max=1000000

# Mencari produk yang sedang diskon
GET /api/products?is_diskon=true
```

2. **Sorting (Pengurutan)**
```http
# Urutkan dari termurah
GET /api/products?sort=harga

# Urutkan dari termahal dan terbaru
GET /api/products?sort=-harga,tanggal
```

3. **Pagination (Pembagian Halaman)**
```http
# Tampilkan 10 produk di halaman 1
GET /api/products?page=1&per_page=10

# Seperti di toko online: "Menampilkan 10 dari 100 produk"
Response:
{
    "data": [...],
    "meta": {
        "current_page": 1,
        "total_pages": 10,
        "total_items": 100
    }
}
```

## Request & Response Format

### Contoh Real: Proses Pemesanan

1. **Request: Membuat Pesanan Baru**
```http
POST /api/orders
Content-Type: application/json
Authorization: Bearer token123 # Token pembeli

{
    "items": [
        {
            "product_id": "P123",
            "quantity": 2
        }
    ],
    "alamat_pengiriman": {
        "jalan": "Jl. Merdeka No. 123",
        "kota": "Jakarta",
        "kode_pos": "12345"
    },
    "metode_pembayaran": "bank_transfer"
}
```

2. **Response: Pesanan Berhasil**
```http
HTTP/1.1 201 Created
Content-Type: application/json

{
    "data": {
        "order_id": "ORD123",
        "status": "menunggu_pembayaran",
        "total_harga": 3000000,
        "waktu_pemesanan": "2024-03-05T12:00:00Z",
        "detail_pembayaran": {
            "bank": "BCA",
            "nomor_rekening": "1234567890",
            "batas_waktu": "2024-03-06T12:00:00Z"
        }
    },
    "meta": {
        "status": "success"
    }
}
```

3. **Response: Kasus Error**
```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
    "error": {
        "kode": "STOK_HABIS",
        "pesan": "Maaf, stok produk tidak mencukupi",
        "detail": {
            "product_id": "P123",
            "stok_tersedia": 1,
            "stok_diminta": 2
        }
    }
}
```

## Best Practices (Praktik Terbaik)

### 1. Versioning (Versi API)
```http
# Versi 1: Format lama
GET /api/v1/products
Response: { "nama": "Sepatu Nike", "harga": 1000000 }

# Versi 2: Format baru dengan detail tambahan
GET /api/v2/products
Response: { 
    "nama": "Sepatu Nike", 
    "harga": { 
        "normal": 1000000,
        "diskon": 800000
    }
}
```

### 2. Error Handling (Penanganan Error)
```http
# Error Validasi
{
    "error": {
        "kode": "VALIDASI",
        "pesan": "Data tidak valid",
        "detail": {
            "email": "Format email tidak valid",
            "telepon": "Nomor telepon harus 10-12 digit"
        }
    }
}

# Error Server
{
    "error": {
        "kode": "SERVER_ERROR",
        "pesan": "Terjadi kesalahan pada server",
        "reference_id": "ERR123" # Untuk tracking
    }
}
```

### 3. Authentication (Autentikasi)
```http
# Menggunakan JWT Token
GET /api/orders
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

# Menggunakan API Key
GET /api/products
X-API-Key: sk_live_123456789
```

## Implementasi di Next.js

### Contoh: API Route untuk Produk

```javascript
// pages/api/products/[id].js
export default async function handler(req, res) {
    const { id } = req.query;
    const { method } = req;

    try {
        switch (method) {
            case 'GET':
                // Ambil detail produk
                const product = await db.products.findById(id);
                if (!product) {
                    return res.status(404).json({
                        error: {
                            kode: 'NOT_FOUND',
                            pesan: 'Produk tidak ditemukan'
                        }
                    });
                }
                return res.status(200).json({ data: product });

            case 'PATCH':
                // Validasi input
                const { harga, stok } = req.body;
                if (harga < 0 || stok < 0) {
                    return res.status(400).json({
                        error: {
                            kode: 'VALIDASI',
                            pesan: 'Harga dan stok tidak boleh negatif'
                        }
                    });
                }

                // Update produk
                const updated = await db.products.update(id, req.body);
                return res.status(200).json({ data: updated });

            default:
                res.setHeader('Allow', ['GET', 'PATCH']);
                return res.status(405).json({
                    error: {
                        kode: 'METHOD_TIDAK_DIIZINKAN',
                        pesan: `Metode ${method} tidak diizinkan`
                    }
                });
        }
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({
            error: {
                kode: 'SERVER_ERROR',
                pesan: 'Terjadi kesalahan pada server',
                reference_id: error.id
            }
        });
    }
}
```

## Tips Penting

1. **Konsistensi**
   - Gunakan format response yang sama di semua endpoint
   - Gunakan penamaan yang konsisten (contoh: selalu gunakan snake_case)
   - Selalu sertakan kode dan pesan error yang jelas

2. **Keamanan**
   - Selalu validasi input dari user
   - Gunakan HTTPS
   - Batasi akses dengan authentication
   - Terapkan rate limiting untuk mencegah abuse

3. **Performa**
   - Gunakan pagination untuk data yang banyak
   - Cache data yang jarang berubah
   - Optimalkan query database

4. **Monitoring**
   - Log semua error
   - Pantau response time
   - Track penggunaan API
   - Set up alerting untuk masalah kritis

---

Dengan contoh-contoh di atas, diharapkan Anda bisa lebih memahami bagaimana REST API bekerja dalam konteks aplikasi nyata. Selanjutnya, kita akan mempelajari bagaimana menerapkan konsep-konsep ini dalam integrasi payment gateway.
