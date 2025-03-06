# Webhook: Panduan Super Lengkap untuk Pemula

## Daftar Isi
1. [Pengenalan Webhook](#pengenalan-webhook)
2. [Cara Kerja Webhook](#cara-kerja-webhook)
3. [Implementasi Webhook](#implementasi-webhook)
4. [Keamanan Webhook](#keamanan-webhook)
5. [Error Handling](#error-handling)
6. [Best Practices](#best-practices)

## Pengenalan Webhook (Dijelaskan Super Detail)

### Apa itu Webhook? 

Bayangkan Anda punya toko online. Ada dua cara untuk tau status pembayaran customer:

1. **Cara Tradisional (Polling)**
```plaintext
Seperti Anda bolak-balik cek kotak pos:
└── Setiap 5 menit
    ├── Buka aplikasi bank
    ├── Cek mutasi
    ├── Cocokkan pembayaran
    └── Update status order
    
Masalah:
- Capek cek terus-menerus
- Boros resource server
- Ada delay informasi
- Bisa miss pembayaran
```

2. **Cara Modern (Webhook)**
```plaintext
Seperti punya asisten pribadi:
└── Payment Gateway
    ├── Terima pembayaran
    ├── Langsung kabari Anda
    ├── Update otomatis
    └── Tidak perlu cek manual

Keuntungan:
- Real-time update
- Hemat resource
- Tidak ada delay
- Tidak ada yang terlewat
```

### Kenapa Harus Pakai Webhook?

1. **Efisiensi Sistem**
```plaintext
Tanpa Webhook:
Server Anda ──(cek)──➜ Payment Gateway (1000x per hari)
- Boros bandwidth
- Boros processing power
- Boros biaya server

Dengan Webhook:
Payment Gateway ──(notify)──➜ Server Anda (hanya saat ada update)
- Hemat bandwidth
- Hemat processing
- Hemat biaya
```

2. **Real-time Business**
```plaintext
Contoh Kasus Toko Online:
1. Customer bayar di Mayar
2. Mayar kirim webhook ke toko
3. Sistem toko otomatis:
   - Update status order
   - Kirim invoice
   - Kirim email konfirmasi
   - Update stok produk
   - Catat di laporan keuangan
```

3. **Automasi Proses**
```plaintext
Contoh Automasi dengan Webhook:
└── Payment Success
    ├── Generate Invoice PDF
    ├── Kirim ke Email Customer
    ├── Update Inventory
    ├── Create Shipping Label
    └── Notify Admin
```

## Cara Kerja Webhook

### Flow Dasar
```plaintext
1. Trigger Event di Payment Gateway
   │
2. Payment Gateway Kirim Notifikasi
   │
3. Server Kita Terima Notifikasi
   │
4. Proses & Update Data
   │
5. Kirim Response
```

### Contoh Real-World
```plaintext
Pembayaran di Toko Online:
1. Customer bayar ➜ Payment Gateway proses
2. Payment Success ➜ Payment Gateway kirim webhook
3. Server toko terima webhook
4. Update status order
5. Kirim email ke customer
```

## Implementasi Webhook

### 1. Setup Endpoint
```typescript
// pages/api/webhook/mayar.ts
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    // Hanya terima POST request
    if (req.method !== 'POST') {
        return res.status(405).json({
            message: 'Method tidak diizinkan'
        });
    }

    try {
        // Terima webhook
        const webhookData = req.body;
        
        // Proses webhook
        await processWebhook(webhookData);
        
        // Kirim response sukses
        return res.status(200).json({
            message: 'Webhook diterima'
        });
    } catch (error) {
        console.error('Webhook error:', error);
        return res.status(500).json({
            message: 'Terjadi kesalahan'
        });
    }
}
```

### 2. Proses Webhook
```typescript
// utils/webhook.ts
async function processWebhook(data: WebhookData) {
    // 1. Validasi data
    if (!isValidWebhook(data)) {
        throw new Error('Data webhook tidak valid');
    }

    // 2. Update order
    const order = await db.orders.findUnique({
        where: { id: data.order_id }
    });

    if (!order) {
        throw new Error('Order tidak ditemukan');
    }

    // 3. Update status
    await db.orders.update({
        where: { id: data.order_id },
        data: { 
            status: data.payment_status,
            updatedAt: new Date()
        }
    });

    // 4. Kirim notifikasi
    if (data.payment_status === 'paid') {
        await sendPaymentSuccessEmail(order.customer_email);
    }
}
```

### 3. Handle Different Events
```typescript
// utils/webhookHandler.ts
async function handleWebhookEvent(event: string, data: any) {
    switch (event) {
        case 'payment.success':
            await handlePaymentSuccess(data);
            break;
            
        case 'payment.failed':
            await handlePaymentFailed(data);
            break;
            
        case 'payment.expired':
            await handlePaymentExpired(data);
            break;
            
        default:
            console.log(`Event tidak dikenal: ${event}`);
    }
}

async function handlePaymentSuccess(data: PaymentData) {
    // 1. Update order status
    await updateOrderStatus(data.orderId, 'PAID');
    
    // 2. Create invoice
    await generateInvoice(data.orderId);
    
    // 3. Send notification
    await sendCustomerNotification(data.orderId, 'payment_success');
    
    // 4. Update inventory
    await updateProductInventory(data.orderId);
}
```

## Keamanan Webhook

### 1. Verifikasi Signature
```typescript
// utils/security.ts
import crypto from 'crypto';

function verifyWebhookSignature(
    payload: string,
    signature: string,
    secretKey: string
): boolean {
    const expectedSignature = crypto
        .createHmac('sha256', secretKey)
        .update(payload)
        .digest('hex');
    
    return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
    );
}

// Penggunaan:
const isValid = verifyWebhookSignature(
    JSON.stringify(req.body),
    req.headers['x-mayar-signature'] as string,
    process.env.WEBHOOK_SECRET!
);

if (!isValid) {
    return res.status(401).json({
        message: 'Signature tidak valid'
    });
}
```

### 2. Validasi IP
```typescript
// middleware/ipFilter.ts
const ALLOWED_IPS = [
    '123.45.67.89',
    '98.76.54.32'
];

function validateIpAddress(req: NextApiRequest): boolean {
    const clientIp = req.headers['x-forwarded-for'] || 
                    req.socket.remoteAddress;
                    
    return ALLOWED_IPS.includes(clientIp as string);
}
```

## Error Handling

### 1. Retry Mechanism
```typescript
// utils/retry.ts
async function withRetry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3
): Promise<T> {
    let lastError: Error;
    
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error as Error;
            await wait(Math.pow(2, i) * 1000); // Exponential backoff
        }
    }
    
    throw lastError!;
}

// Penggunaan:
await withRetry(async () => {
    await processWebhook(webhookData);
});
```

### 2. Error Logging
```typescript
// utils/logger.ts
function logWebhookError(error: Error, webhookData: any) {
    console.error('Webhook Error:', {
        timestamp: new Date(),
        error: error.message,
        stack: error.stack,
        webhookData: webhookData,
        environment: process.env.NODE_ENV
    });
}
```

## Best Practices

### 1. Idempotency
```typescript
// utils/idempotency.ts
async function processWebhookIdempotent(
    webhookId: string,
    process: () => Promise<void>
) {
    // Cek apakah webhook sudah diproses
    const processed = await db.webhookLogs.findUnique({
        where: { id: webhookId }
    });
    
    if (processed) {
        return; // Skip jika sudah diproses
    }
    
    // Proses webhook
    await process();
    
    // Catat webhook sudah diproses
    await db.webhookLogs.create({
        data: {
            id: webhookId,
            processedAt: new Date()
        }
    });
}
```

### 2. Quick Response
```typescript
// Baik ✅
async function handleWebhook(req, res) {
    // Kirim response dulu
    res.status(200).json({ received: true });
    
    // Proses di background
    await processWebhookAsync(req.body);
}

// Kurang Baik ❌
async function handleWebhook(req, res) {
    // Proses dulu (bisa lama)
    await processWebhook(req.body);
    
    // Baru kirim response
    res.status(200).json({ processed: true });
}
```

### 3. Monitoring
```typescript
// utils/monitor.ts
interface WebhookMetrics {
    received: number;
    processed: number;
    failed: number;
    avgProcessTime: number;
}

class WebhookMonitor {
    private metrics: WebhookMetrics = {
        received: 0,
        processed: 0,
        failed: 0,
        avgProcessTime: 0
    };
    
    recordWebhook(status: 'received' | 'processed' | 'failed') {
        this.metrics[status]++;
    }
    
    recordProcessTime(ms: number) {
        this.metrics.avgProcessTime = 
            (this.metrics.avgProcessTime + ms) / 2;
    }
    
    getMetrics(): WebhookMetrics {
        return this.metrics;
    }
}
```

## Istilah-istilah Penting dalam Webhook

### 1. Konsep Dasar

#### Signature
```plaintext
Signature = Tanda Tangan Digital
- Memastikan keaslian pengirim
- Mencegah manipulasi data
- Dibuat dengan secret key

Contoh:
HMAC-SHA256(payload + secret_key) = a1b2c3d4...
```

#### Payload
```plaintext
Payload = Isi Paket
- Data yang dikirim
- Biasanya format JSON
- Berisi informasi event

Contoh Payload:
{
    "event": "payment.success",
    "order_id": "ORD123",
    "amount": 100000,
    "status": "paid"
}
```

#### Headers
```plaintext
Headers = Informasi Tambahan
- X-Signature: Tanda tangan digital
- Content-Type: Jenis konten
- User-Agent: Identitas pengirim

Contoh Headers:
X-Signature: a1b2c3d4...
Content-Type: application/json
X-Webhook-ID: webhook_123
```

### 2. Jenis-jenis Webhook

#### Berdasarkan Sinkronisasi
```plaintext
1. Synchronous Webhook
   - Menunggu response
   - Blocking operation
   - Timeout risk

2. Asynchronous Webhook
   - Fire and forget
   - Non-blocking
   - Better performance
```

#### Berdasarkan Metode
```plaintext
1. Push Webhook
   - Server kirim ke client
   - Real-time update
   - Contoh: Payment notification

2. Pull Webhook
   - Client request ke server
   - Periodic check
   - Contoh: Status check
```

#### Berdasarkan Event
```plaintext
1. Single Event
   - Satu event per webhook
   - Simple processing
   - Contoh: payment.success

2. Batch Events
   - Multiple events
   - Bulk processing
   - Contoh: daily_transactions
```

### 3. Format Webhook

#### JSON Format
```json
{
    "webhook_id": "whk_123",
    "event_type": "payment.success",
    "created_at": "2024-03-06T12:00:00Z",
    "data": {
        "order_id": "ORD123",
        "amount": 100000,
        "currency": "IDR",
        "status": "paid"
    },
    "metadata": {
        "customer_id": "CUS123",
        "payment_method": "va"
    }
}
```

#### XML Format
```xml
<webhook>
    <webhook_id>whk_123</webhook_id>
    <event_type>payment.success</event_type>
    <data>
        <order_id>ORD123</order_id>
        <amount>100000</amount>
    </data>
</webhook>
```

#### Form Data
```plaintext
webhook_id=whk_123
event_type=payment.success
order_id=ORD123
amount=100000
```

### 4. Mengamankan Webhook

#### Authentication Methods
```typescript
// 1. Basic Auth
const authHeader = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');

// 2. Bearer Token
const headers = {
    'Authorization': `Bearer ${token}`
};

// 3. Custom Header
const headers = {
    'X-API-Key': apiKey
};
```

#### Encryption
```