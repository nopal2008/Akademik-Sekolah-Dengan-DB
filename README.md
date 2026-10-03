<<<<<<< HEAD
# Sistem Akademik SMK

Aplikasi sistem akademik sederhana berbasis web untuk sekolah, terdiri dari frontend Vue 3 dan backend Express dengan database SQLite.
=======
﻿# Sistem Akademik Sekolah (SMK)

Aplikasi manajemen akademik sekolah menengah kejuruan (SMK) dengan **frontend Vue 3** dan **backend REST API Node.js**. Proyek ini mendukung manajemen siswa, guru, kelas, jadwal, nilai, absensi, pengumuman, pesan, dan pembayaran.
>>>>>>> 33425f7 (Fitur: Implementasi Role-Based Access Control (RBAC))

## Fitur

<<<<<<< HEAD
- Autentikasi pengguna
- Manajemen siswa
- Manajemen guru
- Jadwal pelajaran
- Nilai siswa
- Absensi
- Pengumuman
- Tagihan/billing
- Pengaturan sistem
=======
| Modul | Keterangan |
|-------|------------|
| Autentikasi | Login & register untuk siswa, guru, orang tua; admin dari email guru khusus |
| Siswa & kelas | CRUD siswa, kelas, jurusan |
| Guru & mapel | CRUD guru, mata pelajaran, penugasan guru–mapel |
| Jadwal | Jadwal per kelas, guru, hari |
| Nilai | Input nilai tugas, UTS, UAS, praktik |
| Absensi | Presensi hadir/izin/sakit/alpha |
| Pengumuman | Buat/edit pengumuman oleh guru |
| Pesan | Komunikasi antar user |
| Pembayaran | Tagihan dan status pembayaran |
>>>>>>> 33425f7 (Fitur: Implementasi Role-Based Access Control (RBAC))

## Stack Teknologi

<<<<<<< HEAD
- Frontend: Vue 3, Vite, TypeScript, Pinia, Tailwind CSS
- Backend: Node.js, Express, SQLite, JWT

## Prerequisite

- Node.js 18+
- npm 9+
=======
```
Frontend (Vue 3 + Vite)  <-->  Backend (Express + Sequelize)  <-->  MySQL
Port 5173 (dev)         API /api -> port 5000       database sekolah_db
```

## Tech Stack

**Frontend**
- Vue 3
- Vue Router
- Pinia
- Axios
- Chart.js
- Vite

**Backend**
- Node.js
- Express 5
- Sequelize
- MySQL (`mysql2`)
- JWT, bcryptjs, Joi, Helmet, Swagger

## Struktur Folder

```
akademik_sekolah/
├── README.md
├── frontend/
│   ├── src/
│   │   ├── views/
│   │   ├── components/
│   │   ├── layouts/
│   │   ├── router/
│   │   ├── stores/
│   │   └── services/api.js
│   ├── package.json
│   └── vite.config.js
└── backend/
    ├── models/
    ├── controllers/
    ├── routes/
    ├── middlewares/
    ├── scripts/
    ├── config/
    ├── app.js
    └── package.json
```

## Database

- **Mesin:** MySQL
- **Nama database:** `sekolah_db`
- **Tabel utama:** `classes`, `parents`, `teachers`, `students`, `subjects`, `teacher_subjects`, `schedules`, `grades`, `attendances`, `announcements`, `messages`, `payments`
- **Catatan:** akun login tersebar di `students`, `teachers`, `parents`

Jika tersedia, buka `database.txt` untuk skema tabel dan skrip SQL.

## Persyaratan

- Node.js 18+
- MySQL
- npm
>>>>>>> 33425f7 (Fitur: Implementasi Role-Based Access Control (RBAC))

## Instalasi

<<<<<<< HEAD
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
=======
### Backend
>>>>>>> 33425f7 (Fitur: Implementasi Role-Based Access Control (RBAC))

## Konfigurasi Environment

Contoh variabel yang digunakan:

- Backend: `PORT`, `CORS_ORIGIN`, `JWT_SECRET`
- Frontend: `VITE_API_BASE_URL`, `VITE_APP_NAME`

<<<<<<< HEAD
## Struktur Proyek
=======
Jalankan database init (opsional):
>>>>>>> 33425f7 (Fitur: Implementasi Role-Based Access Control (RBAC))

- backend/: server API Express dan database SQLite
- frontend/: aplikasi Vue 3 untuk antarmuka pengguna

<<<<<<< HEAD
## Catatan

- File database lokal akan dibuat otomatis saat backend dijalankan.
- Jangan pernah mengunggah file `.env` yang berisi secret asli ke GitHub.
=======
Jalankan backend:

```powershell
npm run dev
```

Akses API:
- `http://localhost:5000`
- Swagger: `http://localhost:5000/api-docs`

### Frontend

```powershell
cd frontend
npm install
npm run dev -- --host 0.0.0.0
```

Akses frontend:
- `http://localhost:5173`
- `http://192.168.40.18:5173` (akses dari jaringan lokal)

> Frontend sudah disiapkan untuk memproxy `/api` ke `http://localhost:5000`.

### Seed Data (Opsional)

```powershell
cd backend
node scripts/seedUsers.js
```

## Role Pengguna

| Role | Tabel | Keterangan |
|------|-------|------------|
| `student` | students | Melihat nilai, jadwal, absensi sendiri |
| `teacher` | teachers | CRUD akademik, nilai, absensi, jadwal |
| `parent` | parents | Melihat anak dan pembayaran |
| `admin` | teacher + ADMIN_EMAIL | Admin ditentukan dari email guru khusus |

Token JWT dikirim via header: `Authorization: Bearer <token>`

## API Utama

| Prefix | Fungsi |
|--------|--------|
| `/auth` | login, register, profile |
| `/students` | data siswa |
| `/teachers` | data guru |
| `/parents` | data orang tua |
| `/subjects` | mata pelajaran |
| `/classes` | kelas |
| `/teacher-subjects` | guru-mapel |
| `/schedules` | jadwal |
| `/grades` | nilai |
| `/attendances` | absensi |
| `/announcements` | pengumuman |
| `/messages` | pesan |
| `/payments` | pembayaran |

Lihat Swagger setelah backend berjalan untuk dokumentasi endpoint.

## GitHub

Contoh upload ke GitHub:

```powershell
git remote add origin https://github.com/USERNAME/REPO.git
git branch -M main
git push -u origin main
```

## Catatan Penting

- Jangan commit `backend/.env`, `frontend/.env`, atau `node_modules/`.
- `frontend/vite.config.js` siap untuk host `0.0.0.0`.
- `backend/app.js` sudah bind ke semua interface ketika `HOST` tidak diatur.


Admin (Teacher role):
  Email: admin@example.com
  Password: Password123

Teacher:
  Email: teacher@example.com
  Password: Password123

Parent:
  Email: parent@example.com
  Password: Password123

Student:
  Email: student@example.com
  Password: Password123
>>>>>>> 33425f7 (Fitur: Implementasi Role-Based Access Control (RBAC))
