# 🎨 Frontend (React + Vite)

A modern single-page app to read from and write to the Inventory Logger Soroban contract. It supports Freighter wallet for transaction signing.

## 🛠️ Stack

- ⚛️ React 18, Vite 5
- 🦊 Freighter wallet (`@stellar/freighter-api`)
- 📦 Generated Soroban client (vendored at `src/packages/inventory_logger`)

## 🚀 Setup

```bash
pnpm install
pnpm dev
# open http://localhost:5173
```

## 💡 Usage

1. 🌐 Open the app and click "Connect Freighter".
2. 📖 Use the Read panels to fetch items, rentals, counts, and checks.
3. ✍️ Use the Write panel to:
   - ➕ Add an item
   - 📝 Issue a rental (with client-side checks for renter, availability, and minimum deposit)
   - 🔙 Return a rental

## 🏗️ Build

```bash
pnpm build
pnpm preview
```

Build output is code-split into:

- ⚛️ `react-*.js` (React runtime)
- 🦊 `wallet-*.js` (Freighter API)
- ⭐ `stellar-*.js` (Stellar SDK & Soroban libs)
- 📚 `vendor-*.js` (remaining third-party)
- 🎯 `index-*.js` (application code)

## ⚙️ Configuration

- 🔗 Contract/network come from the generated client's `networks.testnet`.
- 🚀 Vite optimizations are in `vite.config.js` (manualChunks and warning limits).

## 🔧 Troubleshooting

- ❌ **Freighter not found**: Ensure extension is installed and enabled; disable Brave Shields on localhost.
- 🌐 **Network mismatch**: Switch Freighter to Testnet.
- 🔢 **BigInt in JSON**: The UI displays large numbers as strings for readability.
- 📦 **Large chunk warnings**: Expected because of the Stellar SDK. Already split into separate chunk; limit can be adjusted in `vite.config.js`.

## 📜 Scripts

- 🟢 `pnpm dev` — start dev server
- 🔨 `pnpm build` — production build
- 👀 `pnpm preview` — preview production build

## 📄 License

MIT
