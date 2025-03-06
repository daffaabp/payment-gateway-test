# HTTP Basic: Panduan Lengkap

## Daftar Isi
1. [Pendahuluan](#pendahuluan)
2. [Konsep Dasar HTTP](#konsep-dasar-http)
3. [HTTP Methods](#http-methods)
4. [HTTP Headers](#http-headers)
5. [Status Codes](#status-codes)
6. [Request & Response](#request--response)
7. [HTTP Security](#http-security)

## Pendahuluan

HTTP (Hypertext Transfer Protocol) adalah protokol yang menjadi fondasi komunikasi data di World Wide Web. Setelah memahami arsitektur client-server, kita perlu mendalami HTTP karena ini adalah "bahasa" yang digunakan client dan server untuk berkomunikasi.

## Konsep Dasar HTTP

### Apa itu HTTP?
HTTP adalah protokol aplikasi yang memungkinkan komunikasi antara client dan server. Bayangkan HTTP seperti bahasa standar yang digunakan pelayan restoran untuk berkomunikasi dengan dapur:

- **Menu** = HTTP Methods (GET, POST, dll)
- **Nomor Meja** = HTTP Headers
- **Status Pesanan** = HTTP Status Codes

### Karakteristik HTTP
1. **Stateless**
   - Setiap request berdiri sendiri
   - Server tidak menyimpan informasi tentang request sebelumnya
   - Menggunakan cookies/tokens untuk "mengingat" state

2. **Client-Server**
   - Client membuat request
   - Server memberikan response
   - Komunikasi dua arah yang terstruktur

3. **Connectionless**
   - Setiap request/response adalah transaksi terpisah
   - Connection bisa di-reuse (Keep-Alive)
   - Efisien dalam penggunaan resources

## HTTP Methods

### GET
- Mengambil data dari server
- Tidak mengubah data di server
- Parameters di URL
- Contoh: Membaca artikel blog

```http
GET /articles/123 HTTP/1.1
Host: www.blog.com
```

### POST
- Mengirim data baru ke server
- Mengubah state di server
- Data di request body
- Contoh: Submit form registrasi

```http
POST /users HTTP/1.1
Host: www.app.com
Content-Type: application/json

{
    "name": "John Doe",
    "email": "john@example.com"
}
```

### PUT
- Update data yang sudah ada
- Mengganti seluruh resource
- Idempotent (hasil sama meski diulang)
- Contoh: Update profil user

```http
PUT /users/123 HTTP/1.1
Host: www.app.com
Content-Type: application/json

{
    "name": "John Doe Updated",
    "email": "john.new@example.com"
}
```

### PATCH
- Update sebagian data
- Tidak mengganti seluruh resource
- Contoh: Update email saja

```http
PATCH /users/123 HTTP/1.1
Host: www.app.com
Content-Type: application/json

{
    "email": "john.new@example.com"
}
```

### DELETE
- Menghapus resource
- Idempotent
- Contoh: Hapus artikel

```http
DELETE /articles/123 HTTP/1.1
Host: www.blog.com
```

## HTTP Headers

### Request Headers
1. **Authorization**
   - Kredensial untuk autentikasi
   - Format: `Authorization: Bearer <token>`

2. **Content-Type**
   - Tipe data yang dikirim
   - Contoh: `application/json`, `multipart/form-data`

3. **Accept**
   - Tipe response yang diharapkan
   - Contoh: `Accept: application/json`

4. **User-Agent**
   - Identifikasi client
   - Browser/aplikasi yang digunakan

### Response Headers
1. **Content-Type**
   - Tipe data response
   - Contoh: `Content-Type: application/json`

2. **Cache-Control**
   - Aturan caching
   - Contoh: `Cache-Control: max-age=3600`

3. **Set-Cookie**
   - Set cookie di client
   - Untuk session management

## Status Codes

### 2xx (Sukses)
- **200** OK: Request berhasil
- **201** Created: Resource baru dibuat
- **204** No Content: Sukses tanpa content

### 3xx (Redirect)
- **301** Moved Permanently
- **302** Found
- **304** Not Modified

### 4xx (Client Error)
- **400** Bad Request: Request tidak valid
- **401** Unauthorized: Perlu autentikasi
- **403** Forbidden: Tidak punya akses
- **404** Not Found: Resource tidak ada
- **422** Unprocessable Entity: Validasi gagal

### 5xx (Server Error)
- **500** Internal Server Error
- **502** Bad Gateway
- **503** Service Unavailable
- **504** Gateway Timeout

## Request & Response

### Anatomi HTTP Request
```http
POST /api/users HTTP/1.1
Host: api.example.com
Content-Type: application/json
Authorization: Bearer abc123

{
    "name": "John Doe",
    "email": "john@example.com"
}
```

### Anatomi HTTP Response
```http
HTTP/1.1 201 Created
Content-Type: application/json
Cache-Control: no-cache

{
    "id": 123,
    "name": "John Doe",
    "email": "john@example.com"
}
```

## HTTP Security

### 1. HTTPS
- Enkripsi data in transit
- SSL/TLS certificates
- Prevent man-in-the-middle attacks

### 2. Security Headers
- **Content-Security-Policy**
- **X-Frame-Options**
- **X-XSS-Protection**
- **Strict-Transport-Security**

### 3. Authentication Methods
1. **Basic Auth**
   ```
   Authorization: Basic base64(username:password)
   ```

2. **Bearer Token**
   ```
   Authorization: Bearer <jwt_token>
   ```

3. **API Key**
   ```
   X-API-Key: your_api_key
   ```

### 4. Best Practices
- Selalu gunakan HTTPS
- Validasi semua input
- Implement rate limiting
- Gunakan security headers
- Careful error handling
- Proper session management

## Contoh Implementasi

### 1. Fetch API (JavaScript)
```javascript
// GET Request
fetch('https://api.example.com/users')
  .then(response => response.json())
  .then(data => console.log(data));

// POST Request
fetch('https://api.example.com/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer token123'
  },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com'
  })
})
```

### 2. Axios (JavaScript)
```javascript
// GET Request
axios.get('https://api.example.com/users')
  .then(response => console.log(response.data));

// POST Request
axios.post('https://api.example.com/users', {
  name: 'John Doe',
  email: 'john@example.com'
}, {
  headers: {
    Authorization: 'Bearer token123'
  }
});
```

---

Dengan memahami konsep-konsep HTTP di atas, Anda telah memiliki dasar yang kuat untuk mengimplementasikan komunikasi client-server dalam aplikasi web. Pengetahuan ini sangat penting untuk memahami cara kerja payment gateway dan webhook yang akan kita pelajari selanjutnya.
