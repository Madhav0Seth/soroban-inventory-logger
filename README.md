# 📦 Invilog — Decentralized Inventory Rental and Logging System

## 📝 Project Description

A decentralized peer-to-peer rental platform built on the Stellar blockchain using Soroban smart contracts. Users can list items for rent, manage inventory, and track rental history transparently without intermediaries. All transactions are recorded immutably on-chain, ensuring trust and accountability.

## 🌟 Project Vision

Create a trustless, transparent marketplace for peer-to-peer asset rental, eliminating intermediaries while promoting sustainable sharing-economy practices through blockchain technology.

🔗 **Live Demo:** [soroban-inventory-logger.vercel.app](https://soroban-inventory-logger.vercel.app/)

## 🔐 Contract ID

CAKVDQJ4OEC6KXVDUWIACJV37V6MY3PNASD7V6ASCRVNIET2D5HF5UES

<img width="1917" height="919" alt="{208F5FED-D41C-4992-BA17-75676C0772DC}" src="https://github.com/user-attachments/assets/743bf692-682f-45e8-98c5-0b052912fcbb" />

## ✨ Key Features

- 🧩 Item Management — Add, update, and track inventory with pricing
- 🤝 Rental System — Automated booking with deposit collection and availability control
- 🔁 Return Tracking — Secure return process with timestamp verification
- 📚 Rental History — Complete on-chain audit trail for all transactions
- 🔐 Access Control — Owner authentication and self-rental prevention
- ⏰ Overdue Detection — Automatic late rental identification

## 🔭 Future Scope

- 💸 Payment Integration — Automated XLM/token payments and deposit returns
- ⭐ Rating System — User reviews and reputation scores
- 📱 Web/Mobile App — User-friendly interface with wallet integration
- 🛡️ Insurance Module — Damage protection and dispute resolution
- 🌐 Multi-currency Support — Accept multiple Stellar assets
- 🧾 NFT Integration — Tokenize high-value rental items
- 📊 Analytics Dashboard — Rental income and utilization insights
- 🧭 Enterprise Features — Fleet management and API access

---

## 📁 Repository Layout

- 📦 `contracts/inventory-logger/` — Soroban smart contract (Rust)
- 🎨 `frontend/` — React + Vite SPA for interacting with the contract

## 📋 Prerequisites

- ⚡ Node.js 18+ and pnpm (`corepack enable` recommended)
- 🦊 Freighter wallet extension (for signing transactions)
- 🔧 Rust toolchain and `soroban-cli` (only if you want to build/deploy contracts)

## 🚀 Quick Start (Frontend)

```bash
cd frontend
pnpm install
pnpm dev
# open http://localhost:5173
```

The app connects to Soroban Testnet and uses the contract ID above. Click "Connect Freighter" to enable write operations.

## 🏗️ Build for Production

```bash
cd frontend
pnpm build
pnpm preview
```

The build is code-split into logical chunks (`react`, `wallet`, `stellar`, `vendor`). The Stellar SDK is large by design and is isolated in its own chunk.

## 🔧 Troubleshooting

- ❌ **Freighter not detected**: Ensure the extension is installed and enabled (disable Brave Shields on localhost).
- 🌐 **Network mismatch**: Switch Freighter to Testnet; the app validates the network passphrase.
- 🔢 **Large integers in UI**: The UI serializes BigInt values as strings for readability.
- 📦 **Bundle size warnings**: Expected due to SDK size. Chunking is already configured; you can raise `chunkSizeWarningLimit` in `frontend/vite.config.js`.

## 📄 License

MIT
