# Perencanaan Implementasi Swagger UI (API Documentation)

Dokumen ini berisi panduan dan instruksi mendetail yang ditujukan untuk model AI lainnya agar dapat mengimplementasikan fitur Swagger UI pada proyek ini. Proyek ini menggunakan **Bun** beserta framework **ElysiaJS**.

## Deskripsi Tugas
Integrasikan dokumentasi API interaktif menggunakan plugin resmi dari ElysiaJS (`@elysiajs/swagger`). Tujuannya adalah agar *end-user* atau *developer* lain dapat melihat, membaca, dan menguji coba endpoint secara langsung dari browser.

---

## Langkah-langkah Implementasi yang Harus Dilakukan AI:

### Tahap 1: Instalasi Dependency
1. Buka terminal pada root folder proyek (jangan merubah path *working directory* utama).
2. Jalankan perintah instalasi dependency resmi Elysia Swagger:
   ```bash
   bun add @elysiajs/swagger
   ```

### Tahap 2: Konfigurasi di Level Aplikasi (`src/app.ts`)
1. Buka file `src/app.ts`.
2. Import plugin swagger dari dependency yang baru saja di-*install*:
   ```typescript
   import { swagger } from '@elysiajs/swagger';
   ```
3. Registrasikan/Gunakan plugin swagger pada instance `app` (Elysia). Letakkan pemanggilan `.use(swagger({...}))` **sebelum** mendefinisikan rute/handler lainnya, misalnya tepat di atas deklarasi `.onError` atau sebelum memanggil *route plugin* lainnya.
4. Tambahkan konfigurasi dasar pada objek swagger tersebut untuk merapikan tampilannya:
   - **`path`**: Setel path swagger ke `/swagger`.
   - **`documentation`**: Atur bagian info yang menyertakan `title` = `"Belajar Vibe Coding API"`, `version` = `"1.0.0"`, dan `description` = `"Dokumentasi interaktif untuk aplikasi manajemen pengguna."`

### Tahap 3: Merapikan Detail Rute & Skema (Opsional Namun Disarankan)
Elysia secara otomatis akan membaca validasi tipe (`t.Object`, dll) sebagai sumber acuan Swagger. Walau demikian, periksa kembali:
1. File `src/route/user.route.ts`: Pastikan deskripsi validasi sudah cukup jelas. Tambahkan hook `{ detail: { summary: "..." } }` jika memungkinkan untuk memberi judul *(summary)* spesifik pada rute register *user*.
2. File `src/route/auth.route.ts`: Lakukan hal serupa pada bagian `login`, `current-user`, dan `logout` agar tiap _route_ memiliki _summary_/_description_ yang mudah dibaca di dalam UI Swagger nanti.

### Tahap 4: Verifikasi & Test Manual
1. Instruksikan *user* untuk mencoba menjalankan *server* menggunakan `bun run dev`.
2. Verifikasi langkah dengan membuka jalur `http://localhost:<PORT_SESUAI_PROJECT>/swagger` di web browser, API seharusnya muncul dalam spesifikasi OpenAPI 3 secara otomatis.
3. Pastikan token `Authorization` Bearer bisa dimasukkan (*Authorize Button* pada UI Swagger dapat muncul secara _out-of-the-box_ dari Elysia).

---
**Catatan untuk model AI pelaksana:**
Harap jalankan perubahan-perubahan ini secara langsung ke dalam file terkait. Fokus utama adalah pada file `package.json` (instalasi package) dan modifikasi pada `src/app.ts`.
