# Pandigi Frontend

Aplikasi frontend yang dibangun menggunakan Angular untuk platform Pandigi.

## Prasyarat

Sebelum menjalankan project ini, pastikan Anda telah menginstall:

- Node.js (versi LTS terbaru direkomendasikan)
- npm atau yarn
- Angular CLI

## Instalasi

1. Clone repository ini:
```bash
git clone https://github.com/nxstray/pandigi-frontend.git
cd pandigi-frontend
```

2. Install dependencies:
```bash
npm install
```

## Menjalankan Development Server

Untuk menjalankan development server secara lokal:

```bash
ng serve
```

Setelah server berjalan, buka browser dan akses `http://localhost:4200/`. Aplikasi akan otomatis reload ketika ada perubahan pada source files.

## Build Production

Untuk membuild project dalam mode production:

```bash
ng build
```

Hasil build akan tersimpan di direktori `dist/`. Production build secara default sudah dioptimasi untuk performa dan kecepatan.

## Code Scaffolding

Angular CLI menyediakan tools untuk generate komponen baru:

```bash
# Generate component baru
ng generate component nama-component --standalone atau ng g c nama-component --standalone

# Untuk melihat list lengkap schematics yang tersedia
ng generate --help
```

## Testing

### Unit Tests

Untuk menjalankan unit tests menggunakan Karma:

```bash
ng test
```

### End-to-End Tests

Untuk menjalankan end-to-end tests:

```bash
ng e2e
```

Note: Angular CLI tidak menyertakan framework e2e testing secara default. Anda dapat memilih framework yang sesuai dengan kebutuhan.

## Sumber Daya Tambahan

Untuk informasi lebih lanjut tentang Angular CLI:
- [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli)
- [Angular Documentation](https://angular.dev)

---

Project ini dibuat dengan [Angular CLI](https://github.com/angular/angular-cli) versi 19.1.4. SPA Standalone