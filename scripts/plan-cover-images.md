# Plan: Blog Post Cover Image Relevance

## Current State
- **Schema** sudah memiliki field `coverImage` dan `coverImageAlt` di `BlogPost` & `BlogInput`
- **Build script** `scripts/gen-cover-images.mjs` sudah dibuat dan dijalankan
- **104 cover images** sudah di-generate di `public/blog-covers/`
- **blog.json** sudah di-update dengan path `coverImage` untuk setiap post
- **Rendering** sudah di-update di `BlogPostView.tsx` dan `blog/page.tsx`
- **thumbnail-generator.ts** sudah prefer `coverImage` sebelum fallback placeholder
- **package.json** sudah include `gen-cover-images.mjs` di `prebuild`
- **Inline markdown images** sudah dihapus dari `content` field (102 posts cleaned)
- **public/blog-covers/** di-gitignore (regenerated setiap build)

## Target State
- Setiap post punya **cover image** yang menampilkan judul dengan gradient cyberpunk
- Tidak ada inline markdown images yang tidak relevan
- Visual konsisten dengan brand PdskWork
- Zero biaya, compatible dengan static export + Firebase Spark

---

## Implementasi Saat Ini

### Yang Sudah Selesai
1. **Schema update**: `coverImage?: string` dan `coverImageAlt?: string`
2. **Build script**: Generate 1200x630 JPG dengan Sharp + SVG gradient
3. **Cover images**: 104 files di `public/blog-covers/`
4. **Rendering**: Cover image ditampilkan di blog card dan post detail
5. **Prebuild integration**: `npm run prebuild` otomatis regenerate cover images
6. **Gitignore**: `public/blog-covers/` di-gitignore
7. **Content cleanup**: Semua inline `picsum.photos` images dihapus dari `blog.json`

### Yang Tersisa (Opsional)
- **Cover image enhancement**: Saat ini hanya title overlay yang konsisten
- **Keyword-based themes**: Bisa ditambahkan di masa depan jika ingin variasi visual per topik

---

## Tech Stack

| Component | Tool | Status |
|-----------|------|--------|
| Image Generation | Sharp + SVG | ✅ Done |
| Schema | BlogPost interface | ✅ Done |
| Storage | `public/blog-covers/` | ✅ Done |
| Rendering | BlogPostView + BlogCard | ✅ Done |
| Build Integration | prebuild script | ✅ Done |
| Content Cleanup | clean-blog-images.mjs | ✅ Done |

---

## Constraints Check
- ✅ Static export compatible
- ✅ Firebase Spark compatible
- ✅ Zero ongoing cost
- ✅ Build-time only
- ✅ Backward compatible
- ✅ No broken image references

---

## Next Steps
1. Commit & push perubahan terbaru
2. Test build dengan `npm run build`
3. Optional: Tambah keyword-based color themes jika diperlukan
