# BUR JO’SS

Situs pemesanan untuk satu warung. Katalog awal mengikuti foto papan menu dan memakai foto makanan dari pemilik. Foto tambahan dapat diunggah melalui **Panel admin → Menu**.

## Menjalankan di komputer sendiri

Gunakan Node.js 24 LTS dan npm. Ekstrak ZIP, buka terminal di folder yang berisi `package.json`, lalu jalankan:

```sh
npm ci
npm run db:local
```

Salin `.dev.vars.example` menjadi `.dev.vars`. Pada Windows PowerShell jalankan `Copy-Item .dev.vars.example .dev.vars`. Pada macOS atau Linux jalankan `cp .dev.vars.example .dev.vars`. Lalu jalankan:

```sh
npm run dev -- --host 127.0.0.1
```

Buka `http://127.0.0.1:5173` untuk toko dan `http://127.0.0.1:5173/admin` untuk pengaturan. Mode admin lokal hanya untuk pengembangan pada komputer sendiri. Isi nomor WhatsApp warung atau atur QRIS sebelum mencoba checkout. Data percobaan tersimpan di `.wrangler/state`. Isi awal mencakup katalog dan foto bawaan aplikasi. Perubahan katalog, pesanan pelanggan, unggahan R2, dan kredensial milik warung tersimpan terpisah pada layanan produksi.

## Pemeriksaan

```sh
npm run typecheck
npm test
npm run build
npm audit
```

Tes menggunakan database SQLite sementara, QR uji, dan respons pembayaran simulasi. Untuk uji GPS di perangkat, gunakan HTTPS dengan izin lokasi. Coba juga menolak izin dan mengisi alamat manual.

## Penerapan produksi

Target asli aplikasi adalah ChatGPT Sites dengan Cloudflare Workers, D1 (binding `DB`), dan R2 (binding `BUCKET`). ZIP ini adalah ekspor source dari commit `aaf3804564856bc898cf3360b83e6ecd0e6c6df6` dengan pembaruan dependensi, validasi ukuran permintaan, dan pengamanan akses admin untuk distribusi. Untuk membuat situs terpisah, gunakan identitas proyek baru. Konfigurasi `wrangler.local.json` memakai ID database contoh untuk emulator.

Di ChatGPT Sites, tetapkan `ADMIN_EMAIL` dan `SITES_TRUSTED_INGRESS=yes` pada runtime jika semua permintaan melewati layanan identitas Sites yang memverifikasi pengguna dan mengganti header identitas dari klien. Simpan kunci pembayaran sebagai secret. Di hosting lain, sambungkan autentikasi server yang memverifikasi identitas admin di `isAdmin` terlebih dahulu. Panel produksi secara bawaan menolak akses berbasis header. Biarkan `LOCAL_ADMIN` kosong di produksi. Jalankan migrasi pada database target dan uji satu transaksi sandbox sebelum memakai kredensial produksi.

## Pengaturan awal

- Buka `/admin` dengan akun ChatGPT pengelola. Akses dibatasi ke email yang ditetapkan melalui variabel runtime `ADMIN_EMAIL`.
- Masukkan nomor WhatsApp pada **Pengaturan**. Pelanggan membuka WhatsApp dengan rincian pesanan dan mengirim pesan dari perangkatnya.
- Isi alamat dan jam buka, lalu aktifkan metode ambil sendiri atau antar. Pengantaran menggunakan ongkir tetap yang ditetapkan admin.
- Untuk QRIS, gunakan MIDTRANS_SERVER_KEY sebagai secret runtime serta MIDTRANS_MODE (default sandbox, production untuk pembayaran nyata). Akun merchant perlu memiliki QRIS pada Midtrans Core API. Jangan simpan Server Key di kode atau formulir pelanggan. Deploy ulang setelah mengatur variabel runtime.
- Untuk menerima notifikasi Midtrans setelah situs dibuka bagi pelanggan, gunakan `https://<alamat-situs>/api/midtrans/notification`. Di situs privat, panel dan halaman status pelanggan tetap dapat menyinkronkan status lewat API Midtrans.
- Pastikan akses admin dan metode pembayaran sudah disiapkan sebelum membuka akses untuk pelanggan.

## QRIS warung

Di **Panel admin → Pengaturan → Pembayaran**, pilih **QRIS warung**, lalu masukkan QRIS statis resmi dari penyedia pembayaran warung. Admin dapat memilih gambar, menempel kode atau tangkapan layar, atau memindai melalui kamera. Bagian validasi menunjukkan nama dan kota merchant sebelum menyimpan.

Server mengisi nominal berdasarkan total pesanan, termasuk potongan dan ongkir. Pelanggan memindai atau mengunduh gambar QRIS di halaman status pesanan. Kode ini mengikuti pola konversi [qris-dinamis](https://github.com/verssache/qris-dinamis). Dukungan pembayaran perlu dipastikan dengan penyedia QRIS merchant. Metode ini tidak meminta ID tagihan atau konfirmasi pembayaran dari penyedia.

Admin melihat pembayaran yang masuk melalui aplikasi penyedia, lalu menggunakan **Pesanan → Verifikasi Pembayaran** untuk mencatat referensi transaksi dan menandai pesanan lunas. Referensi yang sama tidak bisa digunakan untuk dua pesanan. Kode yang sudah diunduh pelanggan tetap bisa dipindai setelah pesanan dibatalkan. Midtrans tetap bisa dipilih untuk verifikasi pembayaran otomatis.

## Pengembangan

Gunakan `npm run dev` atau jalankan build dengan `npm run build`. Terapkan migrasi D1 dari `drizzle/` di lingkungan lokal. Database D1 menyimpan katalog, promo, pengaturan, dan pesanan. Foto yang diunggah disimpan di R2.
