# Sistem Akademik SMK

Aplikasi sistem akademik sederhana berbasis web untuk sekolah, terdiri dari frontend Vue 3 dan backend Express dengan database SQLite.

## Fitur

- Autentikasi pengguna
- Manajemen siswa
- Manajemen guru
- Jadwal pelajaran
- Nilai siswa
- Absensi
- Pengumuman
- Tagihan/billing
- Pengaturan sistem

## Stack Teknologi

- Frontend: Vue 3, Vite, TypeScript, Pinia, Tailwind CSS
- Backend: Node.js, Express, SQLite, JWT

## Prerequisite

- Node.js 18+
- npm 9+

## Instalasi

1. Clone repository
2. Install dependency backend:
   ```bash
   cd backend
   npm install
   ```
3. Install dependency frontend:
   ```bash
   cd ../frontend
   npm install
   ```
4. Salin file environment contoh dan sesuaikan nilai yang dibutuhkan:
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```
5. Jalankan backend:
   ```bash
   cd backend
   npm run dev
   ```
6. Jalankan frontend:
   ```bash
   cd frontend
   npm run dev
   ```

## Konfigurasi Environment

Contoh variabel yang digunakan:

- Backend: `PORT`, `CORS_ORIGIN`, `JWT_SECRET`
- Frontend: `VITE_API_BASE_URL`, `VITE_APP_NAME`

## Struktur Proyek

- backend/: server API Express dan database SQLite
- frontend/: aplikasi Vue 3 untuk antarmuka pengguna

## Catatan

- File database lokal akan dibuat otomatis saat backend dijalankan.
- Jangan pernah mengunggah file `.env` yang berisi secret asli ke GitHub.
