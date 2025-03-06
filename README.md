# 🤖 Kelas Inovatif AI Chat Platform

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5-blue)](https://www.prisma.io/)
[![MySQL](https://img.shields.io/badge/MySQL-8-orange)](https://www.mysql.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Mayar](https://img.shields.io/badge/Mayar-Payment-green)](https://mayar.id)

Platform pembelajaran AI pertama di Indonesia dengan fitur chat AI yang dilengkapi sistem subscription dan manajemen token.

## ✨ Fitur Utama

### 💬 Chat AI
- Interface chat yang modern dan responsif
- Sistem token untuk mengontrol penggunaan
- Auto-scroll dan loading states
- Riwayat chat yang tersimpan

### 💳 Sistem Subscription
- Paket Silver dan Gold
- Integrasi dengan Mayar Payment Gateway
- Manajemen lisensi otomatis
- Notifikasi status pembayaran

### 🔐 Autentikasi & Keamanan
- Protected routes dengan middleware
- Session management dengan iron-session
- Secure webhook handling
- Token-based access control

### 💰 Manajemen Token
- Token default untuk user baru
- Top-up token melalui subscription
- Tracking penggunaan token
- Notifikasi saldo token rendah

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, Shadcn UI
- **Backend**: Next.js API Routes
- **Database**: MySQL dengan Prisma ORM
- **Authentication**: Iron Session
- **Payment**: Mayar Payment Gateway
- **State Management**: React Hooks
- **Development**: ESLint, Prettier

## 📋 Prerequisites

Sebelum memulai, pastikan Anda telah menginstall:

- Node.js (v18.17 atau lebih tinggi)
- pnpm (v8 atau lebih tinggi)
- MySQL (v8 atau lebih tinggi)
- Git

## 🚀 Installation

1. Clone repository
```bash
git clone https://github.com/yourusername/your-repo-name.git
cd your-repo-name
```

2. Install dependencies
```bash
pnpm install
```

3. Setup environment variables
```bash
cp .env.example .env
```

4. Setup database
```bash
pnpm prisma generate
pnpm prisma db push
```

5. Run development server
```bash
pnpm dev
```

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| DATABASE_URL | MySQL connection string | mysql://user:pass@localhost:3306/dbname |
| NEXTAUTH_SECRET | Secret for session | your-secret-key |
| MAYAR_API_KEY | Mayar API Key | your-mayar-api-key |
| MAYAR_WEBHOOK_SECRET | Mayar Webhook Secret | your-webhook-secret |
| MAYAR_PRODUCT_ID | Mayar Product ID | your-product-id |
| NEXT_PUBLIC_PAYMENT_LINK | Mayar Payment Link | https://mayar.id/pay/... |

## 📦 Project Structure

```
src/
├── app/                    # Next.js app router
│   ├── api/               # API routes
│   ├── auth/              # Auth pages
│   ├── chat/              # Chat interface
│   ├── dashboard/         # Dashboard pages
│   └── thank-you/         # Payment callback page
├── components/            # Reusable components
├── lib/                   # Utility functions
└── prisma/               # Database schema
```

## 🔄 API Routes

### Webhook Endpoint
```typescript
POST /api/webhook/mayar
```
Menerima notifikasi dari Mayar untuk:
- Pembayaran sukses
- Aktivasi subscription
- Pembaruan status

### Chat Token
```typescript
GET /api/chat/token
```
Mengambil informasi token user:
- Sisa token
- Status subscription
- Riwayat penggunaan

## 💳 Subscription Plans

### Silver Package
- 5 token chat
- Akses fitur dasar
- Durasi 1 bulan
- Harga: Rp 10.000

### Gold Package
- 100 token chat
- Akses fitur premium
- Durasi 12 bulan
- Harga: Rp 30.000

## 🔒 Security

- Semua rute sensitif dilindungi middleware
- Webhook diverifikasi dengan signature
- Data sensitif disimpan dengan aman
- Session management yang secure

## 🤝 Contributing

1. Fork repository
2. Create feature branch
```bash
git checkout -b feature/amazing-feature
```
3. Commit changes
```bash
git commit -m 'feat: add amazing feature'
```
4. Push to branch
```bash
git push origin feature/amazing-feature
```
5. Open Pull Request

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📞 Support

Jika Anda memiliki pertanyaan atau mengalami masalah, silakan:
- Buka issue di GitHub
- Hubungi support@kelasinovatif.id
- Kunjungi [dokumentasi](https://docs.kelasinovatif.id)

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org)
- [Prisma](https://www.prisma.io)
- [Mayar](https://mayar.id)
- [Shadcn UI](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com)

---

Made with ❤️ by Kelas Inovatif Team
