# Implementation Plan: Fitur Get Current User (Mendapatkan Data Profil Berdasarkan Token)

## Deskripsi
Dokumen ini disusun sebagai pedoman tahap demi tahap untuk mengimplementasikan fitur pengambilan profil *Current User* menggunakan *Authentication Bearer Token*. Dokumen ini ditujukan sebagai arahan teknis bagi *junior programmer* maupun model asisten AI.

Pola arsitektur (*Layered Architecture*) folder `src/` yang sudah ada akan tetap dipertahankan. Kita akan mulai memperkenalkan lapisan **Middleware** untuk memverifikasi absensi token di setiap HTTP Request. 

Seluruh modifikasi dan pembuatan file sebaiknya tetap mengikuti konvensi penamaan seperti `user.route.ts`, `user.controller.ts`, atau `auth.middleware.ts`.

---

## Tahap 1: Pembuatan Middleware (Pengecekan Header Otorisasi)
**Lokasi Berkas yang disarankan:** `src/middleware/auth.middleware.ts`

API ini mewajibkan pengguna mengirimkan *Headers* `Authorization: Bearer <token>`. Oleh karena itu, kita butuh sebuah "pencegat" atau *Middleware* di lingkungan ElysiaJS:
1. Buat ekstensi Elysia menggunakan mekanisme `.derive()` atau fungsi pembantu khusus.
2. Tangkap objek `headers.authorization`.
3. Validasi apakah format strukturnya berwujud string yang dimulai dengan kata `"Bearer "`.
4. Potong string tersebut untuk hanya mengekstrak bagian `<token>`-nya saja.
5. Bila format cacat, langsung lempar/kembalikan seketika pesan *error*: `"Token is not valid"`.
6. Bila valid, teruskan token tersebut (via variabel lokal/konteks Elysia) agar dapat dibaca oleh *Controller* di layar selanjutnya.

---

## Tahap 2: Logika Bisnis Pencarian Data (Service Layer)
**Lokasi Berkas:** (Bisa ditambahkan ke `src/service/user.service.ts` atau `src/service/auth.service.ts`)

Buatlah metode asinkron bernama `getCurrentUser(token)`:
1. Buat kueri pencarian basis data (menggunakan Drizzle ORM) menuju tabel `sessions` menggunakan klausa pencocokan *where token = <token_input>*. 
2. Karena kita hanya menyimpan `userId` pada tabel `sessions`, jika token ditemukan, lanjutkan untuk melakukan pencarian detail profil pada tabel `users` dengan menyesuaikan ID yang didapat.
   *(Saran efisiensi: Anda bisa langsung menggunakan kapabilitas asupan Join (Inner Join) dari Drizzle antara tabel `sessions` dan tabel `users` secara sekuensial dalam 1 baris kueri).*
3. Apabila token tidak ditemukan di database atau id user sudah tidak eksis, maka secara asinkron **tolak (throw error):** `"Token is not valid"`.
4. Jika profil ada, ekstrak kolom profil tersebut menjadi balasan nilai balik (return): `id`, `username` (nanti dipetakan ke alias `name`), `email`, `createdAt`, dan `updatedAt`. Jangan pernah mengembalikan kolom kata sandi.

---

## Tahap 3: Pemetaan Antarmuka Balasan (Controller Layer)
**Lokasi Berkas:** Misal ditambahkan pada `src/controller/user.controller.ts`

Susun logika di dalam metode baru (misal `UserController.getCurrent`):
1. Serap data teks `token` murni yang sudah diurai oleh *Middleware*.
2. Lempar antrean program ke `Service layer` yang baru saja disusun.
3. **Sukses (*Try block*):**
   Jika tereksekusi penuh, pasang respons dengan *HTTP Status 200* dan rilis profil berwujud JSON berikut (pastikan memetakan properti `username` database menjadi key `name` pada JSON):
   ```json
   {
       "data": {
           "id": 1,
           "name": "nama string username",
           "email": "nama email pengguna",
           "created_at": "timestamp",
           "updated_at": "timestamp"
       }
   }
   ```
4. **Gagal (*Catch error block*):**
   Ubah pengodean *Response status* menjadi `401 Unauthorized`. Rilis mutlak respons galat:
   ```json
   {
       "message": "Token is not valid",
       "data": null
   }
   ```

---

## Tahap 4: Merangkai Ekosistem Pemanggilan (Route Layer)
**Lokasi Berkas:** (Bisa disuntikkan ke rute gabungan misal `src/route/user.route.ts` atau `auth.route.ts` -- pastikan prefiks targetnya berujung pada `/api/users`)

- Tautkan properti URL `.get('/current-user')`. *(Perhatikan rute basis utama/prefix bila disatukan ke file yang sudah ada).*
- Tempel *Middleware* yang mendeteksi ekstensi fungsi pembaca token Elysia buatan Tahap 1 tepat memeluk endpoint GET barusan.
- Titipkan pengarah utamanya (*handler*) memanggil metode `UserController.getCurrent`.

**Pastikan juga** file asal rute ini telah didaftarkan dan di-*use* di dalam file sentral `src/app.ts` selayaknya endpoint sebelumnya.
