# Plan: Blog Post Cover Image Relevance

## Current State
- **102 posts** menggunakan placeholder acak dari `picsum.photos/seed/<slug>/1200/600`
- Gambar **tidak relevan** dengan judul atau isi konten
- Semua gambar adalah inline markdown di `content` field
- Tidak ada field `coverImage` di schema `BlogPost`

## Target State
- Setiap post memiliki **cover image yang relevan** dengan konten
- Gambar di-generate otomatis saat build time
- Fallback elegan untuk post tanpa gambar
- Zero biaya, tetap compatible dengan static export + Firebase Spark

---

## Opsi Strategi Gambar

### Opsi A: AI Generation (PRIORITAS)
**Tools:** Hugging Face Inference API (free tier) atau OpenAI DALL-E
**Cara kerja:**
- Build script mengambil `title + excerpt + tags` → prompt AI
- AI generate gambar relevan
- Simpan ke `public/blog-covers/{slug}.jpg`
- Update `blog.json` dengan path `coverImage`

**Pros:** Sangat relevan, unik per post
**Cons:** Perlu API key, rate limit, waktu build bertambah

### Opsi B: Keyword-based Unsplash (CAMPURAN)
**Tools:** Unsplash Source API (`source.unsplash.com/featured/?<keyword>`)
**Cara kerja:**
- Ekstrak keyword dari tags/title
- Fetch gambar dari Unsplash berdasarkan keyword
- Simpan & cache di `public/blog-covers/`

**Pros:** Gratis, tanpa auth, cepat
**Cons:** Kurang presisi, bergantung pada keyword yang tepat

### Opsi C: Generated OG Images (FALLBACK)
**Tools:** Sharp + SVG (100% offline)
**Cara kerja:**
- Generate gambar 1200x600 dengan gradient cyberpunk
- Overlay judul post dengan typography neon
- Simpan ke `public/blog-covers/{slug}.jpg`

**Pros:** 100% offline, relevant (ada judul), konsisten dengan tema
**Cons:** Bukan "foto" sunguhan, tapi tetap menarik

---

## Rekomendasi: Hybrid Approach

Gunakan **kombinasi Opsi A + C**:

1. **Primary:** Coba AI generation via Hugging Face Inference API
   - Model: `stabilityai/stable-diffusion-xl-base-1.0` (free on HF)
   - Prompt: "cyberpunk digital art, [title], [excerpt snippet], neon lights, futuristic"
   - Timeout: 30 detik per image
   - Fallback ke Opsi C jika gagal/timeout

2. **Fallback:** Generated OG image dengan Sharp
   - Gradient: cyan → violet → magenta (sesuai tema site)
   - Overlay: judul post dengan efek glow
   - Font: Inter/SF Pro (bundle di script)

---

## Implementation Plan

### Phase 1: Schema & Infrastructure
- [ ] Tambah field `coverImage?: string` ke `BlogPost` & `BlogInput`
- [ ] Tambah field `coverImageAlt?: string`
- [ ] Buat direktori `public/blog-covers/` (gitignore, di-generate saat build)
- [ ] Tambah dependency `sharp` untuk image processing

### Phase 2: Build Script
- [ ] Buat `scripts/gen-cover-images.mjs`
- [ ] Baca `blog.json`, filter post published
- [ ] Untuk setiap post:
  - Skip jika `coverImage` sudah ada
  - Coba AI generation via HF Inference API
  - Jika gagal → generate OG image dengan Sharp
  - Simpan ke `public/blog-covers/{slug}.jpg`
  - Update `blog.json` dengan path baru
- [ ] Wire ke `prebuild` script di `package.json`

### Phase 3: Rendering
- [ ] Update `BlogPostView.tsx`:
  - Tampilkan `coverImage` sebagai thumbnail/header jika ada
  - Tetap tampilkan inline markdown images di konten
- [ ] Update `BlogCard.tsx` (jika ada) untuk pakai `coverImage`
- [ ] Update `blog-seed.ts` untuk include `coverImage`

### Phase 4: Existing Posts
- [ ] Run `npm run gen:cover-images` untuk generate semua 102 posts
- [ ] Verify output di `public/blog-covers/`
- [ ] Commit updated `blog.json` + generated images

### Phase 5: Polish
- [ ] Add lazy loading + blur placeholder untuk cover images
- [ ] Add error boundary untuk gambar yang gagal load
- [ ] Dokumentasi cara regenerate images jika needed

---

## Tech Stack

| Component | Tool | Biaya |
|-----------|------|-------|
| AI Generation | Hugging Face Inference API | Free tier (100 req/day) |
| Image Processing | Sharp | Open source |
| Storage | `public/blog-covers/` | Free (static hosting) |
| Fallback | Generated OG images | Free |

---

## Constraints Check
- ✅ Static export compatible
- ✅ Firebase Spark compatible (no server needed)
- ✅ Zero ongoing cost (free tier APIs + local generation)
- ✅ Build-time only (no runtime overhead)
- ✅ Existing inline markdown images tetap jalan
- ✅ Backward compatible (field optional)

---

## Risk & Mitigation

| Risk | Mitigation |
|------|------------|
| HF API rate limit | Fallback ke OG image generation (Opsi C) |
| Build time meningkat | Parallel processing + cache existing images |
| Image size besar | Sharp compression + WebP conversion |
| API key exposure | Gunakan `.env.local` + gitignore |

---

## Next Steps
1. Approve hybrid approach
2. Add `coverImage` field ke schema
3. Implement build script
4. Generate images untuk existing posts
5. Update rendering components
