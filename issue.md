# Implementation Plan: Fitur User Registration

## Deskripsi
Dokumen ini disusun untuk mengarahkan implementasi pembuatan fitur pendaftaran pengguna baru (API *Create User*). Silakan ikuti instruksi secara runut dari awal hingga akhir, pastikan setiap lapisan (*layer*) tetap saling terpisah (*loosely coupled*).

---

## 1. Re-strukturisasi Folder & Konvensi Nama
Pada direktori `src/`, atur ulang/buat folder mengikuti arsitektur modular berikut:
- **`route/`**: Untuk mendefinisikan *endpoint* API dan validasi.
- **`service/`**: Tempat menyatukan *business logic* (pemeriksaan kondisi, enkripsi).
- **`model/`**: Untuk menampung definisi *schema* tabel database Drizzle ORM.
- **`controller/`**: Menangani permintaan (HTTP/ekstraksi *body*) dan mengatur respons.
- **`middleware/`**: Penengah pemrosesan HTTP (*guard, auth* dsb, jika ada).
- **`config/`**: Variabel konfigurasi atau inisialisasi koneksi dasar.
- **`utils/`**: Tempat penulisan *helper function*, seperti fungsi *hash*.
- **`app.ts`**: Menampung instansiasi induk ElysiaJS.

**Aturan Penamaan File:** Gunakan *pattern* `<nama_fitur>.<layer>.ts`, contoh: `user.route.ts`, `user.model.ts`, `user.controller.ts`.

---

## 2. Pembuatan Model Database (Drizzle)
**Berkas:** `src/model/user.model.ts`
Implementasikan *database schema* Drizzle untuk tabel `users` dengan struktur persis seperti di bawah ini:
- `id`: tipe *integer* (int), atur sebagai *primary key* dan *auto increment*.
- `username`: tipe *varchar* maksimal 255 karakter, bersifat *not null*.
- `email`: tipe *varchar* maksimal 255 karakter, bersifat *not null* (atur agar *unique* untuk keamanan ekstra).
- `password`: tipe *varchar* maksimal 255 karakter, bersifat *not null* (dirancang untuk menampung *hash bcrypt*).
- `created_at`: tipe *timestamp*, atur default ke *current_timestamp*.
- `updated_at`: tipe *timestamp*, default ke *current_timestamp* dan di-_update_ secara otomatis bila ada perubahan (`on update current_timestamp`).

> **Penting:** Setelah skema ini dibuat, Anda (atau sistem) wajib melakukan sinkronisasi database (`drizzle-kit push` atau migrasi) terlebih dahulu.

---

## 3. Pembuatan Skrip Utilitas (Bcrypt)
**Berkas:** `src/utils/password.util.ts`
Buat fungsi utilitas (misal: `hashPassword`) yang menerima *plain text password* dan mengembalikan nilai *string* berupa rentetan *hash* menggunakan algoritma `bcrypt`. (Bisa memanfaatkan modul kriptografi internal *Bun* yaitu `Bun.password.hash`).

---

## 4. Pembuatan Business Logic (Service)
**Berkas:** `src/service/user.service.ts`
Buat fungsi kelas atau modul `UserService` yang memiliki metode *Create User*:
1. **Validasi Eksistensi:** Panggil Drizzle ORM untuk mengecek tabel `users` apakah *email* atau *username* yang diinput **sudah digunakan**.
   - Jika sudah ada, lemparkan error (*throw new Error*) dengan pesan `"User already exists"`.
2. **Kriptografi:** Jika tidak ada duplikasi, panggil utilitas *hashPassword* untuk mengubah *password* *plain text*.
3. **Persistensi Database:** *Insert* data pendaftar baru (*username, email, hashed_password*) ke dalam tabel `users` menggunakan Drizzle.
4. **Sukses:** Kembalikan data pendaftar *(id, username, email, created_at, updated_at)* dan *pastikan data password tidak ikut dikembalikan*.

---

## 5. Pembuatan Controller
**Berkas:** `src/controller/user.controller.ts`
Fungsi kontroler menjembatani *route request* dengan `UserService`:
- Ambil *username*, *email*, dan *password* dari HTTP *Body*.
- Eksekusi *Service* penyimpan pengguna.
- Tangani kondisi *Error*: Jika servis membuang (*throw*) error `"User already exists"`, kembalikan JSON HTTP 400 (*Bad Request*) berformat:
  ```json
  {
      "message": "User already exists",
      "data": null
  }
  ```
- Tangani kondisi Berhasil (*Success*): Kembalikan JSON HTTP 201 (*Created*) berformat (isi `data` sesuai pengembalian API):
  ```json
  {
      "message": "User created successfully",
      "data": {
          "id": 1,
          "username": "username",
          "email": "email",
          "created_at": "created_at_value",
          "updated_at": "updated_at_value"
      }
  }
  ```

---

## 6. Pemasangan Route & Aplikasi Utama
**Berkas:** `src/route/user.route.ts`
- Buat spesifikasi Elysia *group routing* dengan awalan *(prefix)* `/api/v1`.
- Definisikan metode `POST /user` yang memanggil `UserController` di atas.
- Lakukan penyaringan tipe *Body payload* bawaan Elysia (*Elysia TypeBox / t*) agar harus berupa struktur objek JSON:
  - `username` (string)
  - `email` (string)
  - `password` (string)

**Berkas Induk:** `src/app.ts` atau `src/index.ts`
Kumpulkan semua komponen. Gabungkan `user.route.ts` ke dalam antrean inisialisasi server (*App* Elysia) utama sebelum menjalankan proses `app.listen()`.

---
**Instruksi Eksekusi:** Harap kerjakan sesuai tahap (1-6) untuk meminimalisasi *error circular dependency* atau kebingungan modularitas kode.
