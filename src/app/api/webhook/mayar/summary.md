# Implementasi Webhook Mayar: Panduan Lengkap

## Daftar Isi
1. [Pengenalan](#pengenalan)
2. [Struktur Kode](#struktur-kode)
3. [Alur Kerja](#alur-kerja)
4. [Keamanan](#keamanan)
5. [Penanganan Event](#penanganan-event)
6. [Error Handling](#error-handling)
7. [Best Practices](#best-practices)
8. [Istilah Teknis](#istilah-teknis)
9. [Analisis Kode Baris per Baris](#analisis-kode)
10. [Input Output Flow](#input-output-flow)

## Pengenalan

Webhook adalah mekanisme yang memungkinkan Mayar mengirimkan notifikasi real-time ke aplikasi kita saat terjadi event tertentu (seperti pembayaran berhasil atau subscription diaktifkan). Ini lebih efisien daripada polling karena kita tidak perlu terus-menerus mengecek status.

## Struktur Kode

### 1. File Utama (`src/app/api/webhook/mayar/route.ts`)
```typescript
// Endpoint untuk menerima webhook dari Mayar
export async function POST(req: Request) {
    // Handler untuk request POST
}
```

### 2. File Pendukung (`src/lib/subscription.ts`)
```typescript
// Fungsi-fungsi untuk mengelola subscription dan token
export async function addTokensByPackage(userId: string, packageType: string)
export async function verifyLicense(licenseCode: string)
export async function updateSubscription(userId: string, licenseCode: string, expiredAt: Date)
```

## Alur Kerja

1. **Penerimaan Webhook**
   - Mayar mengirim POST request ke endpoint webhook kita
   - Request berisi signature di header dan payload di body
   - Endpoint: `/api/webhook/mayar`

2. **Verifikasi Signature**
   ```typescript
   // Verifikasi bahwa webhook benar-benar dari Mayar
   function verifyWebhookSignature(signature: string): boolean {
       const webhookSecret = process.env.MAYAR_WEBHOOK_SECRET;
       return signature === webhookSecret;
   }
   ```

3. **Pemrosesan Data**
   - Parse body request menjadi JSON
   - Ekstrak event dan data
   - Cek tipe event (testing/payment.success/subscription.activated)

4. **Penanganan Event**
   ```typescript
   switch (event) {
       case "payment.success":
           // Tambah token sesuai paket
           await addTokensByPackage(user.id, data.package);
           break;
       case "subscription.activated":
           // Update status subscription
           await updateSubscription(user.id, data.licenseCode, new Date(data.expiredAt));
           break;
   }
   ```

## Keamanan

1. **Verifikasi Signature**
   - Setiap webhook memiliki signature unik
   - Signature dikirim dalam header `x-callback-token`
   - Wajib diverifikasi untuk memastikan autentisitas

2. **Environment Variables**
   ```env
   MAYAR_WEBHOOK_SECRET=your_webhook_secret
   MAYAR_API_KEY=your_api_key
   MAYAR_PRODUCT_ID=your_product_id
   ```

## Penanganan Event

### 1. Event Testing
```typescript
if (event === "testing") {
    return NextResponse.json({ success: true });
}
```

### 2. Event Payment Success
- Menambah token user sesuai paket yang dibeli
- Silver: 5 token
- Gold: 100 token

### 3. Event Subscription Activated
- Membuat atau update data subscription user
- Menyimpan license code dan tanggal expired
- Mengaktifkan status subscription

## Error Handling

1. **Validasi Request**
   - Cek method (harus POST)
   - Cek signature
   - Cek payload format

2. **Validasi Data**
   - Cek email customer
   - Cek user exists
   - Cek tipe event valid

3. **Response Codes**
   - 200: Success
   - 401: Invalid signature
   - 404: User not found
   - 500: Internal error

## Best Practices

1. **Logging**
   - Log semua headers untuk debugging
   - Log event dan data yang diterima
   - Log error dengan detail

2. **Keamanan**
   - Selalu verifikasi signature
   - Gunakan HTTPS
   - Simpan secrets di environment variables

3. **Error Handling**
   - Handle semua kemungkinan error
   - Berikan response yang sesuai
   - Jangan expose detail error ke response

4. **Testing**
   - Test dengan event testing
   - Verifikasi penanganan berbagai event
   - Monitor logs untuk troubleshooting

## Contoh Payload

### 1. Event Testing
```json
{
    "event": "testing",
    "data": {
        "id": "123456789",
        "status": "SUCCESS",
        "customerEmail": "example.customer@myr.id"
    }
}
```

### 2. Event Payment Success
```json
{
    "event": "payment.success",
    "data": {
        "package": "silver",
        "customerEmail": "user@example.com"
    }
}
```

### 3. Event Subscription Activated
```json
{
    "event": "subscription.activated",
    "data": {
        "licenseCode": "LICENSE123",
        "expiredAt": "2024-12-31T23:59:59Z",
        "customerEmail": "user@example.com"
    }
}
```

## Penggunaan

1. **Setup di Mayar Dashboard**
   - Login ke dashboard Mayar
   - Masuk ke menu Webhook
   - Daftarkan URL webhook: `https://your-domain.com/api/webhook/mayar`
   - Salin webhook secret ke environment variables

2. **Testing**
   - Gunakan fitur Test Webhook di dashboard Mayar
   - Monitor logs untuk verifikasi
   - Cek response status

3. **Monitoring**
   - Pantau logs secara berkala
   - Setup alert untuk error
   - Monitor status subscription dan token

## Tips Tambahan

1. **Debugging**
   - Gunakan console.log strategis
   - Monitor request headers dan body
   - Cek signature matching

2. **Maintenance**
   - Update webhook secret secara berkala
   - Backup data subscription
   - Monitor penggunaan token

3. **Scaling**
   - Handle multiple events
   - Implement rate limiting
   - Queue heavy processing

## Kesimpulan

Implementasi webhook Mayar ini memungkinkan:
1. Pemrosesan pembayaran real-time
2. Manajemen subscription otomatis
3. Penambahan token sesuai paket
4. Keamanan transaksi
5. Monitoring dan debugging yang efektif

Dengan mengikuti panduan ini, Anda dapat mengimplementasikan webhook Mayar dengan aman dan efisien untuk berbagai use case pembayaran dan subscription.

## Istilah Teknis

### HTTP Request Components

1. **Headers**
   - Bagian dari HTTP request yang berisi informasi tambahan
   - Seperti surat dengan kop surat yang berisi informasi pengirim
   - Contoh header dalam webhook Mayar:
     ```plaintext
     x-callback-token: 6448723dd03497dee4d504e1...
     content-type: application/json
     user-agent: node-fetch/1.0
     ```

2. **Body**
   - Isi utama dari request yang dikirim
   - Seperti isi surat yang berisi pesan utama
   - Dalam webhook, berisi data event dalam format JSON
   - Contoh:
     ```json
     {
         "event": "payment.success",
         "data": {
             "customerEmail": "user@example.com",
             "package": "silver"
         }
     }
     ```

3. **Payload**
   - Istilah lain untuk body/data yang dikirim
   - Berisi informasi yang akan diproses
   - Dalam konteks webhook, payload adalah data event dari Mayar

### Keamanan dan Autentikasi

1. **Signature**
   - Tanda tangan digital untuk memverifikasi keaslian request
   - Dikirim melalui header `x-callback-token`
   - Berfungsi seperti stempel/tanda tangan di surat
   - Memastikan request benar-benar dari Mayar
   - Contoh:
     ```typescript
     const signature = req.headers.get("x-callback-token");
     // 6448723dd03497dee4d504e1b97078d2912b2e9f4bcb4d1998ee8bc6e640a1c3...
     ```

2. **x-callback-token**
   - Header khusus yang berisi signature
   - Dikirim oleh Mayar di setiap webhook
   - Harus dicocokkan dengan webhook secret kita
   - Format: string panjang (hex)

3. **Webhook Secret**
   - Kunci rahasia yang digunakan untuk verifikasi
   - Disimpan di environment variables
   - Jangan pernah share atau expose ke publik
   - Contoh:
     ```env
     MAYAR_WEBHOOK_SECRET=6448723dd03497dee4d504e1...
     ```

### Format Data

1. **JSON (JavaScript Object Notation)**
   - Format data yang digunakan dalam webhook
   - Mudah dibaca manusia dan mesin
   - Contoh:
     ```json
     {
         "key": "value",
         "array": [1, 2, 3],
         "object": {
             "nested": "data"
         }
     }
     ```

2. **Event**
   - Jenis notifikasi yang dikirim
   - Menentukan aksi yang perlu dilakukan
   - Contoh: "payment.success", "subscription.activated"

3. **Data**
   - Informasi detail tentang event
   - Berisi data yang diperlukan untuk pemrosesan
   - Contoh: email customer, package type, amount

### HTTP Methods

1. **POST**
   - Method HTTP yang digunakan webhook
   - Digunakan untuk mengirim data ke server
   - Webhook selalu menggunakan POST request

2. **Response**
   - Jawaban yang dikirim balik ke Mayar
   - Berisi status dan message
   - Format:
     ```json
     {
         "success": true,
         "message": "Webhook processed successfully"
     }
     ```

### Status Codes

1. **200 OK**
   - Request berhasil diproses
   - Webhook diterima dan dihandle dengan baik

2. **401 Unauthorized**
   - Signature tidak valid
   - Autentikasi gagal

3. **404 Not Found**
   - User tidak ditemukan
   - Resource tidak tersedia

4. **500 Internal Server Error**
   - Terjadi error di server
   - Proses webhook gagal

### Environment Variables

1. **Process Environment**
   - Variabel sistem yang menyimpan konfigurasi
   - Diakses melalui `process.env`
   - Contoh:
     ```typescript
     const secret = process.env.MAYAR_WEBHOOK_SECRET;
     ```

2. **Dotenv (.env)**
   - File untuk menyimpan environment variables
   - Format: KEY=VALUE
   - Tidak di-commit ke repository
   - Contoh:
     ```env
     MAYAR_WEBHOOK_SECRET=secret123
     MAYAR_API_KEY=key123
     MAYAR_PRODUCT_ID=prod123
     ```

### Logging

1. **Console Log**
   - Output untuk debugging
   - Membantu trace alur program
   - Contoh:
     ```typescript
     console.log("Headers:", headers);
     console.log("Event:", event);
     console.error("Error:", error);
     ```

2. **Error Log**
   - Mencatat error yang terjadi
   - Membantu troubleshooting
   - Contoh:
     ```typescript
     console.error("Webhook error:", error);
     ```

### Database Operations

1. **Prisma Client**
   - ORM untuk interaksi dengan database
   - Digunakan untuk CRUD operations
   - Contoh:
     ```typescript
     await prisma.chatToken.upsert({
         where: { userId },
         create: { /* ... */ },
         update: { /* ... */ }
     });
     ```

2. **Transactions**
   - Operasi database yang atomic
   - Memastikan data consistency
   - Contoh:
     ```typescript
     await prisma.$transaction([
         operation1,
         operation2
     ]);
     ```

### NextResponse

1. **Response Object**
   - Object untuk mengirim response HTTP
   - Digunakan di Next.js API routes
   - Contoh:
     ```typescript
     return NextResponse.json(
         { success: true },
         { status: 200 }
     );
     ```

2. **Status**
   - HTTP status code
   - Menandakan hasil request
   - Contoh:
     ```typescript
     return NextResponse.json(
         { error: "Invalid signature" },
         { status: 401 }
     );
     ```

## Analisis Kode

### Import Statements
```typescript
import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import { addTokensByPackage, updateSubscription } from "@/lib/subscription";
import { NextResponse } from "next/server";
```

**Penjelasan**:
1. `crypto`: Modul Node.js untuk operasi kriptografi (tidak digunakan dalam versi final)
2. `prisma`: Client database untuk operasi CRUD
3. `addTokensByPackage, updateSubscription`: Fungsi helper untuk manajemen token dan subscription
4. `NextResponse`: Utilitas Next.js untuk mengirim HTTP response

### Fungsi Verifikasi Signature
```typescript
function verifyWebhookSignature(signature: string): boolean {
    const webhookSecret = process.env.MAYAR_WEBHOOK_SECRET;
    
    console.log("Webhook Secret exists:", !!webhookSecret);
    console.log("Webhook Secret length:", webhookSecret?.length || 0);
    
    if (!webhookSecret) {
        console.error("MAYAR_WEBHOOK_SECRET is not defined");
        return false;
    }
    
    console.log("Received signature:", signature);
    console.log("Expected webhook secret:", webhookSecret);
    console.log("Signature match:", signature === webhookSecret);
    
    return signature === webhookSecret;
}
```

**Langkah-langkah**:
1. Terima parameter signature dari header
2. Ambil webhook secret dari environment
3. Log informasi untuk debugging
4. Validasi keberadaan webhook secret
5. Bandingkan signature dengan secret
6. Return hasil perbandingan

### Handler Utama POST
```typescript
export async function POST(req: Request) {
    try {
        // Step 1: Log Headers
        console.log("Headers:", Object.fromEntries(req.headers.entries()));
        
        // Step 2: Ambil Signature
        const signature = req.headers.get("x-callback-token");
        console.log("Signature from header:", signature);
        
        // Step 3: Ambil Body
        const body = await req.text();
        console.log("Body length:", body.length);
        console.log("Body preview:", body.substring(0, 100));
        
        // Step 4: Validasi Signature
        if (!signature) {
            return NextResponse.json(
                { error: "Invalid signature" },
                { status: 401 }
            );
        }
        
        if (!verifyWebhookSignature(signature)) {
            return NextResponse.json(
                { error: "Invalid signature" },
                { status: 401 }
            );
        }
        
        // Step 5: Parse JSON
        const payload = JSON.parse(body);
        const { event, data } = payload;
        
        // Step 6: Handle Testing Event
        if (event === "testing") {
            return NextResponse.json({ success: true });
        }
        
        // Step 7: Validasi Email
        const userEmail = data.customerEmail || data.customer?.email;
        if (!userEmail) {
            return NextResponse.json(
                { error: "No customer email provided" },
                { status: 400 }
            );
        }
        
        // Step 8: Cari User
        const user = await prisma.user.findUnique({
            where: { email: userEmail }
        });
        
        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }
        
        // Step 9: Handle Events
        switch (event) {
            case "payment.success":
                await addTokensByPackage(user.id, data.package);
                break;
            case "subscription.activated":
                await updateSubscription(
                    user.id,
                    data.licenseCode,
                    new Date(data.expiredAt)
                );
                break;
        }
        
        // Step 10: Return Success
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Webhook error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
```

## Input Output Flow

### Input Flow

1. **Request Masuk**
   ```plaintext
   POST /api/webhook/mayar
   Headers:
   - x-callback-token: [signature]
   - content-type: application/json
   Body: 
   {
       "event": "payment.success",
       "data": {
           "customerEmail": "user@example.com",
           "package": "silver"
       }
   }
   ```

2. **Proses Internal**
   ```plaintext
   ┌── Terima Request
   │   └── Log Headers
   │
   ├── Validasi Signature
   │   ├── Cek x-callback-token
   │   └── Verifikasi dengan secret
   │
   ├── Parse Body
   │   ├── Convert text ke JSON
   │   └── Ekstrak event & data
   │
   ├── Validasi Data
   │   ├── Cek email
   │   └── Cek user exists
   │
   └── Proses Event
       ├── payment.success → Tambah Token
       └── subscription.activated → Update Subscription
   ```

3. **Database Operations**
   ```plaintext
   payment.success:
   ┌── Cari user by email
   └── Update token count
       └── silver: +5 token
       └── gold: +100 token

   subscription.activated:
   ┌── Cari user by email
   └── Create/Update subscription
       ├── Set license code
       ├── Set expiry date
       └── Activate status
   ```

### Output Flow

1. **Successful Response**
   ```json
   // HTTP 200 OK
   {
       "success": true
   }
   ```

2. **Error Responses**
   ```json
   // HTTP 401 Unauthorized
   {
       "error": "Invalid signature"
   }

   // HTTP 404 Not Found
   {
       "error": "User not found"
   }

   // HTTP 400 Bad Request
   {
       "error": "No customer email provided"
   }

   // HTTP 500 Internal Server Error
   {
       "error": "Internal server error"
   }
   ```

3. **Logging Output**
   ```plaintext
   Headers: {x-callback-token: "...", content-type: "application/json", ...}
   Signature from header: ...
   Body length: 123
   Body preview: {"event":"payment.success",...}
   Webhook Secret exists: true
   Webhook Secret length: 128
   Signature match: true
   Event: payment.success
   Looking for user with email: user@example.com
   Processing payment.success for user: user_123
   ```

### Side Effects

1. **Token Update**
   ```sql
   -- Dalam database setelah payment.success
   UPDATE chat_token 
   SET remaining = remaining + 5 
   WHERE user_id = 'user_123';
   ```

2. **Subscription Update**
   ```sql
   -- Dalam database setelah subscription.activated
   INSERT INTO user_subscription (
       user_id, 
       license_code,
       expired_at,
       is_active
   ) VALUES (
       'user_123',
       'LICENSE123',
       '2024-12-31T23:59:59Z',
       true
   );
   ```

### Error Handling Flow

```plaintext
try {
    ├── Validasi Input
    │   └── Return early jika invalid
    │
    ├── Proses Event
    │   └── Update Database
    │
    └── Return Success
}
catch (error) {
    ├── Log Error
    └── Return 500
}
```

## Tutorial Detail untuk Pemula

### Pengenalan Webhook untuk Pemula

Bayangkan webhook seperti seorang kurir yang mengantar paket:
- Mayar adalah pengirim paket (sender)
- Aplikasi kita adalah penerima paket (receiver)
- Webhook adalah kurirnya
- Paket berisi informasi pembayaran (payload)
- Tanda tangan kurir adalah signature untuk keamanan

#### Mengapa Kita Butuh Webhook?
1. **Tanpa Webhook**:
   ```plaintext
   Seperti kita harus bolak-balik ke kantor pos untuk cek paket:
   - Apakah ada pembayaran masuk?
   - Sudah dibayar belum ya?
   - Cek lagi... cek lagi...
   - Capek dan tidak efisien!
   ```

2. **Dengan Webhook**:
   ```plaintext
   Seperti kurir langsung mengantar ke rumah:
   - Ada pembayaran → Langsung diberi tahu
   - Pembayaran sukses → Langsung update
   - Tidak perlu cek manual
   - Hemat waktu dan tenaga!
   ```

### Penjelasan Kode Baris per Baris

#### 1. Import Statement
```typescript
import crypto from "node:crypto";
```
**Penjelasan Detail**:
- Ini seperti membawa alat yang kita butuhkan sebelum kerja
- `crypto` adalah alat untuk keamanan (seperti gembok dan kunci)
- `node:` di depan artinya ini alat bawaan Node.js
- Kita butuh ini untuk memeriksa keamanan webhook

```typescript
import { prisma } from "@/lib/prisma";
```
**Penjelasan Detail**:
- Ini seperti membawa buku catatan (database)
- `prisma` adalah alat untuk menulis dan membaca dari database
- `@/lib/prisma` adalah lokasi dimana alat ini disimpan
- Kita butuh ini untuk menyimpan dan mengambil data user

```typescript
import { addTokensByPackage, updateSubscription } from "@/lib/subscription";
```
**Penjelasan Detail**:
- Ini seperti membawa prosedur kerja
- `addTokensByPackage`: Cara menambah token ke user
- `updateSubscription`: Cara update langganan user
- Keduanya adalah fungsi yang sudah disiapkan di file lain

```typescript
import { NextResponse } from "next/server";
```
**Penjelasan Detail**:
- Ini seperti format surat balasan resmi
- `NextResponse` adalah cara Next.js mengirim jawaban
- Kita butuh ini untuk membalas setiap webhook yang masuk

#### 2. Fungsi Verifikasi Signature

```typescript
function verifyWebhookSignature(signature: string): boolean {
```
**Penjelasan Detail**:
- Ini seperti prosedur memeriksa tanda tangan
- `signature`: Tanda tangan yang dikirim Mayar
- `boolean`: Hasilnya hanya dua: benar (true) atau salah (false)

```typescript
const webhookSecret = process.env.MAYAR_WEBHOOK_SECRET;
```
**Penjelasan Detail**:
- Ini seperti mengambil kunci rahasia dari tempat aman
- `process.env`: Tempat menyimpan informasi rahasia
- `MAYAR_WEBHOOK_SECRET`: Nama kunci rahasianya
- Kunci ini harus cocok dengan yang ada di Mayar

```typescript
console.log("Webhook Secret exists:", !!webhookSecret);
```
**Penjelasan Detail**:
- Ini seperti mencatat di buku: "Apakah kunci ada?"
- `!!webhookSecret`: Mengubah nilai jadi true/false
- Membantu kita debug kalau ada masalah

#### 3. Handler Utama POST

```typescript
export async function POST(req: Request) {
```
**Penjelasan Detail**:
- Ini seperti membuka loket penerimaan paket
- `async`: Bisa menangani banyak paket sekaligus
- `req`: Paket yang diterima dari Mayar

```typescript
try {
```
**Penjelasan Detail**:
- Ini seperti prosedur keamanan
- Kalau ada yang salah, kita punya cara mengatasinya
- Melindungi aplikasi dari error

##### Step 1: Memeriksa Headers
```typescript
console.log("Headers:", Object.fromEntries(req.headers.entries()));
```
**Penjelasan Detail**:
- Headers seperti informasi di amplop surat
- Berisi: siapa pengirim, jenis isi, dll
- Kita catat untuk keperluan debug

##### Step 2: Memeriksa Signature
```typescript
const signature = req.headers.get("x-callback-token");
```
**Penjelasan Detail**:
- Mengambil tanda tangan dari amplop
- `x-callback-token`: Tempat Mayar meletakkan tanda tangan
- Harus ada dan harus valid

##### Step 3: Membaca Isi Paket
```typescript
const body = await req.text();
```
**Penjelasan Detail**:
- Membuka dan membaca isi paket
- `await`: Tunggu sampai selesai dibaca
- `text()`: Ambil dalam bentuk teks

[... dan seterusnya untuk setiap bagian kode ...]

### Contoh Alur Lengkap

#### 1. Saat Pembayaran Sukses
```plaintext
1. Mayar: "Halo! Ada pembayaran sukses nih!"
   ├── Kirim webhook ke endpoint kita
   └── Sertakan tanda tangan (signature)

2. Aplikasi Kita: "Oke, cek dulu ya..."
   ├── Periksa tanda tangan
   ├── Baca informasi pembayaran
   └── Cari user yang bayar

3. Proses Pembayaran:
   ├── "Oh, ini paket Silver!"
   ├── "Tambah 5 token ya..."
   └── "Update di database..."

4. Selesai:
   ├── "Sudah diproses!"
   └── "Kirim response sukses ke Mayar"
```

#### 2. Saat Ada Error
```plaintext
1. Mayar kirim webhook tapi...
   ├── Tanda tangan salah
   └── ATAU user tidak ditemukan
   └── ATAU format data salah

2. Aplikasi Kita:
   ├── "Waduh, ada yang tidak beres..."
   ├── Catat error di log
   └── Kirim pesan error ke Mayar

3. Response Error:
   ├── 401: "Tanda tangan salah!"
   ├── 404: "User tidak ketemu!"
   └── 500: "Ada masalah internal!"
```

### Visualisasi Database

#### 1. Tabel Chat Token
```sql
-- Sebelum pembayaran
SELECT * FROM chat_token WHERE user_id = 'user_123';
┌──────────┬─────────────┐
│ user_id  │ remaining   │
├──────────┼─────────────┤
│ user_123 │     2      │
└──────────┴─────────────┘

-- Setelah pembayaran Silver
SELECT * FROM chat_token WHERE user_id = 'user_123';
┌──────────┬─────────────┐
│ user_id  │ remaining   │
├──────────┼─────────────┤
│ user_123 │     7      │  -- Tambah 5 token
└──────────┴─────────────┘
```

#### 2. Tabel Subscription
```sql
-- Setelah aktivasi subscription
SELECT * FROM user_subscription WHERE user_id = 'user_123';
┌──────────┬────────────┬────────────┬──────────┐
│ user_id  │ license     │ expired_at │ is_active│
├──────────┼────────────┼────────────┼──────────┤
│ user_123 │ LICENSE123  │ 2024-12-31 │   true   │
└──────────┴────────────┴────────────┴──────────┘
```

### Tips Debug untuk Pemula

1. **Cek Log Headers**
   ```typescript
   // Tambahkan ini untuk lihat detail request
   console.log("DETAIL REQUEST:");
   console.log("- URL:", req.url);
   console.log("- Method:", req.method);
   console.log("- Headers:", headers);
   ```

2. **Cek Isi Body**
   ```typescript
   // Tambahkan ini untuk lihat isi webhook
   console.log("ISI WEBHOOK:");
   console.log("- Event:", event);
   console.log("- Data:", JSON.stringify(data, null, 2));
   ```

3. **Cek Database**
   ```typescript
   // Tambahkan ini setelah update token
   console.log("UPDATE TOKEN:");
   console.log("- User:", user.id);
   console.log("- Package:", data.package);
   console.log("- Token Ditambah:", tokenAmount);
   ```

### Checklist Implementasi untuk Pemula

1. **Persiapan**
   - [ ] Setup Next.js project
   - [ ] Install dependencies
   - [ ] Siapkan database
   - [ ] Buat file webhook

2. **Konfigurasi**
   - [ ] Set webhook URL di Mayar
   - [ ] Copy webhook secret
   - [ ] Set environment variables
   - [ ] Test koneksi database

3. **Implementasi**
   - [ ] Copy kode webhook
   - [ ] Sesuaikan dengan kebutuhan
   - [ ] Tambah logging
   - [ ] Test dengan Postman

4. **Testing**
   - [ ] Test webhook dari Mayar
   - [ ] Cek log errors
   - [ ] Verifikasi database
   - [ ] Test semua scenarios

### Troubleshooting Umum

1. **Error: Invalid Signature**
   ```plaintext
   Penyebab:
   - Webhook secret salah
   - Environment variable tidak terset
   - Format signature salah

   Solusi:
   1. Cek .env file
   2. Cek webhook secret di Mayar
   3. Restart aplikasi
   ```

2. **Error: User Not Found**
   ```plaintext
   Penyebab:
   - Email tidak cocok
   - Database error
   - Format email salah

   Solusi:
   1. Cek format email
   2. Cek database connection
   3. Cek query user
   ```

3. **Error: Internal Server Error**
   ```plaintext
   Penyebab:
   - Kode error
   - Database down
   - Memory issue

   Solusi:
   1. Cek error logs
   2. Cek database status
   3. Restart server
   ```

## Otomatisasi Update dari Mayar

### Jenis Event yang Bisa Di-update Otomatis

1. **Event Pembayaran**
   ```plaintext
   ┌── payment.created
   │   └── Saat link pembayaran dibuat
   │
   ├── payment.pending
   │   └── Saat customer mulai proses bayar
   │
   ├── payment.success
   │   └── Saat pembayaran berhasil
   │   └── Trigger: Update token user
   │
   ├── payment.failed
   │   └── Saat pembayaran gagal
   │   └── Trigger: Catat di log
   │
   └── payment.expired
       └── Saat pembayaran kedaluwarsa
       └── Trigger: Hapus pending order
   ```

2. **Event Subscription**
   ```plaintext
   ┌── subscription.created
   │   └── Saat subscription baru dibuat
   │
   ├── subscription.activated
   │   └── Saat subscription aktif
   │   └── Trigger: Update status & tanggal expired
   │
   ├── subscription.renewed
   │   └── Saat subscription diperpanjang
   │   └── Trigger: Update tanggal expired
   │
   ├── subscription.cancelled
   │   └── Saat subscription dibatalkan
   │   └── Trigger: Update status jadi non-aktif
   │
   └── subscription.expired
       └── Saat subscription berakhir
       └── Trigger: Update status & hapus akses
   ```

### Timeline Update Otomatis

#### 1. Saat User Beli Paket Silver
```plaintext
1. User Klik Bayar
   └── Redirect ke payment page Mayar

2. User Pilih Metode Pembayaran
   ├── Event: payment.created
   └── Status: PENDING

3. User Transfer
   ├── Event: payment.success
   └── Webhook dipanggil:
       ├── Cek signature
       ├── Update token (+5)
       └── Catat transaksi

4. User Dapat Token
   ├── Token bertambah otomatis
   └── Bisa langsung dipakai
```

#### 2. Saat User Berlangganan
```plaintext
1. User Beli Subscription
   └── Redirect ke payment page Mayar

2. Pembayaran Sukses
   ├── Event: payment.success
   └── Event: subscription.activated
   └── Webhook dipanggil 2 kali:
       ├── Update token
       └── Aktifkan subscription

3. Update Otomatis di Aplikasi
   ├── Status: "ACTIVE"
   ├── Expired: [tanggal_expired]
   └── License: [kode_lisensi]

4. Saat Mendekati Expired
   ├── Event: subscription.expiring_soon
   └── Bisa kirim notifikasi ke user
```

### Contoh Update Database Otomatis

#### 1. Update Token (Event: payment.success)
```sql
-- Sebelum webhook
SELECT * FROM chat_token WHERE user_id = 'user_123';
┌──────────┬─────────────┐
│ user_id  │ remaining   │
├──────────┼─────────────┤
│ user_123 │     2      │
└──────────┴─────────────┘

-- Webhook diterima & diproses
UPDATE chat_token 
SET remaining = remaining + 5 
WHERE user_id = 'user_123';

-- Setelah webhook (otomatis)
SELECT * FROM chat_token WHERE user_id = 'user_123';
┌──────────┬─────────────┐
│ user_id  │ remaining   │
├──────────┼─────────────┤
│ user_123 │     7      │
└──────────┴─────────────┘
```

#### 2. Update Subscription (Event: subscription.activated)
```sql
-- Webhook diterima & diproses
INSERT INTO user_subscription (
    user_id,
    license_code,
    expired_at,
    is_active
) VALUES (
    'user_123',
    'LICENSE123',
    '2024-12-31',
    true
);

-- Status berlangganan otomatis aktif
SELECT * FROM user_subscription;
┌──────────┬────────────┬────────────┬──────────┐
│ user_id  │ license    │ expired_at │ is_active│
├──────────┼────────────┼────────────┼──────────┤
│ user_123 │ LICENSE123 │ 2024-12-31 │   true   │
└──────────┴────────────┴────────────┴──────────┘
```

### Yang Perlu Diperhatikan

1. **Idempotency (Pencegahan Duplikasi)**
   ```typescript
   // Cek apakah event sudah diproses
   const isProcessed = await prisma.webhookLog.findUnique({
       where: { eventId: payload.id }
   });

   if (isProcessed) {
       return NextResponse.json({ 
           message: "Event already processed" 
       });
   }

   // Catat event yang sudah diproses
   await prisma.webhookLog.create({
       data: {
           eventId: payload.id,
           event: payload.event,
           processedAt: new Date()
       }
   });
   ```

2. **Validasi Data**
   ```typescript
   // Pastikan data lengkap
   if (!payload.data || !payload.event) {
       return NextResponse.json(
           { error: "Invalid payload" },
           { status: 400 }
       );
   }

   // Pastikan jumlah token valid
   if (tokenAmount <= 0) {
       console.error("Invalid token amount:", tokenAmount);
       return NextResponse.json(
           { error: "Invalid token amount" },
           { status: 400 }
       );
   }
   ```

3. **Error Recovery**
   ```typescript
   try {
       // Proses webhook dalam transaction
       await prisma.$transaction(async (tx) => {
           // Update token
           await tx.chatToken.update({...});
           
           // Catat history
           await tx.tokenHistory.create({...});
           
           // Catat webhook log
           await tx.webhookLog.create({...});
       });
   } catch (error) {
       // Jika gagal, semua perubahan dibatalkan
       console.error("Transaction failed:", error);
       return NextResponse.json(
           { error: "Transaction failed" },
           { status: 500 }
       );
   }
   ```

### Best Practices untuk Update Otomatis

1. **Logging Semua Event**
   ```typescript
   // Catat setiap event yang masuk
   await prisma.webhookLog.create({
       data: {
           event: payload.event,
           payload: JSON.stringify(payload),
           status: "RECEIVED",
           receivedAt: new Date()
       }
   });

   // Update status setelah diproses
   await prisma.webhookLog.update({
       where: { id: logId },
       data: {
           status: "PROCESSED",
           processedAt: new Date()
       }
   });
   ```

2. **Monitoring Update**
   ```typescript
   // Monitor waktu proses
   const startTime = Date.now();
   await processWebhook(payload);
   const processTime = Date.now() - startTime;

   // Alert jika terlalu lama
   if (processTime > 5000) {
       await sendAlert({
           type: "SLOW_WEBHOOK",
           message: `Webhook processing took ${processTime}ms`
       });
   }
   ```

3. **Backup & Recovery**
   ```typescript
   // Simpan backup payload
   await prisma.webhookBackup.create({
       data: {
           payload: JSON.stringify(payload),
           createdAt: new Date()
       }
   });

   // Bisa direplay jika gagal
   async function replayWebhook(backupId: string) {
       const backup = await prisma.webhookBackup.findUnique({
           where: { id: backupId }
       });
       
       if (backup) {
           const payload = JSON.parse(backup.payload);
           await processWebhook(payload);
       }
   }
   ```

### Contoh Skenario Update Otomatis

1. **User Beli Token**
   ```plaintext
   User          Mayar          Aplikasi
    │              │                │
    ├─ Beli Token ─┤                │
    │              │                │
    │              │                │
    │              │    Update DB   │
    │              │   ┌─────────┐  │
    │              │   │ +5 Token│  │
    │              │   └─────────┘  │
    │              │                │
    │◄─ Notifikasi ─────────────────┤
    │                               │
    └─ Bisa Langsung Pakai Token ──►│
   ```

2. **Subscription Expired**
   ```plaintext
   Mayar          Aplikasi        User
    │                │             │
    ├── Webhook ────►│             │
    │                │             │
    │                ├─ Update DB ─┤
    │                │  - Status   │
    │                │  - Access   │
    │                │             │
    │                ├─ Notify ───►│
    │                │             │
    │                └─────────────┤
   ```

### Tips Implementasi Update Otomatis

1. **Gunakan Queue untuk Event Berat**
   ```typescript
   // Jika proses update berat
   if (isHeavyProcess(event)) {
       await addToQueue({
           event,
           payload,
           priority: "high"
       });
       return NextResponse.json({ queued: true });
   }
   ```

2. **Retry Mechanism**
   ```typescript
   async function processWithRetry(payload, maxRetries = 3) {
       let retries = 0;
       while (retries < maxRetries) {
           try {
               await processWebhook(payload);
               break;
           } catch (error) {
               retries++;
               if (retries === maxRetries) throw error;
               await wait(1000 * retries);
           }
       }
   }
   ```

3. **Notifikasi ke User**
   ```typescript
   // Setelah update berhasil
   async function notifyUser(userId: string, event: string) {
       await prisma.notification.create({
           data: {
               userId,
               type: event,
               message: getEventMessage(event),
               isRead: false
           }
       });
   }
   ```

### Kesimpulan

Update otomatis dari Mayar:
1. Terjadi real-time saat ada event
2. Tidak perlu cek manual
3. Data selalu sinkron
4. Perlu handling yang baik
5. Perlu monitoring dan logging

## Penjelasan Detail Webhook Route.ts untuk Pemula

### Pendahuluan: Apa itu Webhook?

Bayangkan webhook seperti seorang petugas pos khusus yang:
1. Selalu siap menerima paket (notifikasi) dari Mayar
2. Memeriksa keaslian paket (verifikasi)
3. Memproses isi paket (menambah token/update subscription)
4. Mengirim konfirmasi ke pengirim (response)

### Penjelasan Kode Baris per Baris

#### 1. Setup Awal (Import)
```typescript
import { prisma } from "@/lib/prisma";
import { addTokensByPackage, updateSubscription } from "@/lib/subscription";
import { NextResponse } from "next/server";
```
**Penjelasan Sederhana:**
- Seperti menyiapkan alat-alat sebelum bekerja:
  - `prisma`: Buku catatan untuk menyimpan data (database)
  - `addTokensByPackage`: Alat untuk menambah token
  - `updateSubscription`: Alat untuk update langganan
  - `NextResponse`: Alat untuk membalas pesan

#### 2. Fungsi Verifikasi Tanda Tangan
```typescript
function verifyWebhookSignature(signature: string): boolean {
    const webhookSecret = process.env.MAYAR_WEBHOOK_SECRET;
    // ...
}
```
**Analogi:**
- Ini seperti petugas keamanan yang memeriksa KTP:
  - `signature`: KTP yang ditunjukkan tamu (Mayar)
  - `webhookSecret`: Data KTP yang kita punya
  - Fungsi ini memastikan tamu benar-benar dari Mayar

**Detail Langkah:**
1. Ambil webhook secret dari "brankas" (environment variables)
2. Catat di log apakah secret ada dan berapa panjangnya
3. Bandingkan dengan tanda tangan yang diterima
4. Beri tahu hasilnya (benar/salah)

#### 3. Fungsi Utama POST
```typescript
export async function POST(req: Request) {
    try {
        // ...
    } catch (error) {
        // ...
    }
}
```
**Analogi:**
- Seperti loket pelayanan di kantor pos:
  - `POST`: Hanya melayani pengiriman paket
  - `async`: Bisa melayani sambil mengerjakan hal lain
  - `try-catch`: Prosedur keselamatan kerja

#### 4. Memeriksa Headers
```typescript
console.log("Headers:", Object.fromEntries(req.headers.entries()));
const signature = req.headers.get("x-callback-token");
```
**Analogi:**
- Seperti memeriksa amplop surat:
  - Headers = informasi di amplop (pengirim, tujuan, dll)
  - `x-callback-token` = stempel resmi dari Mayar
  - Logging = mencatat di buku untuk jaga-jaga

#### 5. Membaca Body Request
```typescript
const body = await req.text();
console.log("Raw Body:", body);
```
**Analogi:**
- Seperti membuka dan membaca isi surat:
  - `req.text()`: Membuka amplop
  - Logging isi: Memfotokopi surat untuk arsip
  - `await`: Tunggu sampai selesai baca

#### 6. Verifikasi Keamanan
```typescript
if (!signature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
}
```
**Analogi:**
- Seperti prosedur keamanan:
  - Cek ada tidaknya stempel resmi
  - Kalau tidak ada, tolak surat
  - 401 = "Maaf, identitas tidak valid"

#### 7. Parse JSON dan Cek Event
```typescript
const payload = JSON.parse(body);
const { event, data } = payload;
```
**Analogi:**
- Seperti menerjemahkan surat:
  - JSON.parse = menerjemahkan bahasa komputer
  - `event` = jenis berita (pembayaran/langganan)
  - `data` = detail beritanya

#### 8. Handle Event Testing
```typescript
if (event === "testing") {
    return NextResponse.json({ success: true });
}
```
**Analogi:**
- Seperti latihan pengiriman:
  - Mayar: "Halo, ini cuma test ya!"
  - Kita: "Oke, diterima!"
  - Tidak perlu diproses lebih lanjut

#### 9. Validasi Email dan Cari User
```typescript
const userEmail = data.customerEmail || data.customer?.email;
const user = await prisma.user.findUnique({
    where: { email: userEmail }
});
```
**Analogi:**
- Seperti mencari penerima paket:
  - Email = alamat penerima
  - `findUnique` = cari di buku tamu
  - Kalau tidak ketemu = paket tidak bisa diantar

#### 10. Proses Event Berdasarkan Jenisnya
```typescript
switch (event) {
    case "payment.success":
    case "payment.received": {
        // Proses pembayaran
    }
    case "subscription.activated": {
        // Proses langganan
    }
}
```
**Analogi:**
- Seperti memilah jenis paket:
  - Pembayaran = tambah token
  - Langganan = update status member
  - Default = paket jenis lain

#### 11. Menambah Token (Payment Success)
```typescript
const packageType = data.membershipTierName?.toLowerCase().includes("silver") 
    ? "silver" 
    : "gold";
await addTokensByPackage(user.id, packageType);
```
**Analogi:**
- Seperti mengisi pulsa:
  - Cek jenis paket (Silver/Gold)
  - Tambah token sesuai paket
  - Catat di sistem

#### 12. Update Subscription
```typescript
await updateSubscription(
    user.id,
    data.licenseCode,
    new Date(data.expiredAt)
);
```
**Analogi:**
- Seperti perpanjang membership:
  - Catat kode member baru
  - Set tanggal expired
  - Aktifkan status member

#### 13. Error Handling
```typescript
catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
    );
}
```
**Analogi:**
- Seperti prosedur darurat:
  - Terjadi masalah = catat di log
  - Beritahu Mayar ada masalah
  - Status 500 = "Maaf, ada masalah internal"

### Flow Lengkap dengan Analogi Sehari-hari

Bayangkan webhook seperti kantor pos khusus:

1. **Penerimaan Paket (Request Masuk)**
   ```plaintext
   Mayar (Pengirim) ──> Kantor Pos (Webhook) ──> Aplikasi (Penerima)
   ```

2. **Pemeriksaan Keamanan (Verifikasi)**
   ```plaintext
   - Cek stempel resmi (signature)
   - Cek identitas pengirim (Mayar)
   - Cek kelengkapan dokumen (payload)
   ```

3. **Pemrosesan Paket (Handle Event)**
   ```plaintext
   Jika Pembayaran:
   - Cek jenis paket (Silver/Gold)
   - Tambah token ke akun user
   - Catat transaksi

   Jika Langganan:
   - Update status member
   - Set tanggal expired
   - Aktifkan fitur premium
   ```

4. **Konfirmasi (Response)**
   ```plaintext
   - Sukses = "Paket diterima dan diproses"
   - Gagal = "Maaf, ada masalah" + detail error
   ```

### Tips Debug untuk Pemula

1. **Cek Log Headers**
   ```typescript
   // Lihat informasi di "amplop"
   console.log("DETAIL KIRIMAN:");
   console.log("- Dari:", req.headers.get("user-agent"));
   console.log("- Tanda Tangan:", signature);
   ```

2. **Cek Isi Webhook**
   ```typescript
   // Lihat isi "paket"
   console.log("ISI PAKET:");
   console.log("- Jenis:", event);
   console.log("- Detail:", data);
   ```

3. **Cek Proses Token**
   ```typescript
   // Lihat proses "pengisian pulsa"
   console.log("UPDATE TOKEN:");
   console.log("- User:", user.id);
   console.log("- Paket:", packageType);
   console.log("- Jumlah Token:", tokenAmount);
   ```

### Kesimpulan

Webhook route.ts adalah seperti kantor pos digital yang:
1. Menerima notifikasi dari Mayar
2. Memastikan keamanan dan keaslian
3. Memproses pembayaran dan langganan
4. Mengupdate data user secara otomatis
5. Memberi konfirmasi ke Mayar

Dengan sistem ini, user tidak perlu:
1. Refresh halaman terus-menerus
2. Cek status pembayaran manual
3. Menunggu admin memproses

Semua terjadi otomatis dan real-time! 🚀
