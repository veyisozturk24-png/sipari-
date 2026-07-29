# Siparİş yayın rehberi

## 1. Railway: API ve PostgreSQL

1. Railway'de GitHub deposundan yeni bir proje oluşturun.
2. Aynı projeye PostgreSQL ekleyin.
3. API servisine aşağıdaki değişkenleri ekleyin:
   - `DATABASE_URL`: Railway PostgreSQL servisinin bağlantı değişkeni
   - `JWT_SECRET`: en az 32 karakterlik rastgele gizli anahtar
   - `JWT_EXPIRES_IN`: `8h`
   - `CORS_ORIGIN`: Vercel web alan adınız (ör. `https://uygulama.vercel.app`)
   - `PORT`: `3001`
4. Railway, kökteki `railway.json` ve `apps/api/Dockerfile` dosyalarını kullanır.
5. Yayın öncesinde Prisma migrasyonları otomatik olarak çalışır.
6. API servisinin Networking bölümünden public domain oluşturun.
7. `https://api-alan-adiniz/health` ile sağlık kontrolü yapın.

## 2. Vercel: web uygulaması

1. Aynı GitHub deposunu Vercel'e aktarın.
2. Vercel ayarlarında proje kökünü depo kökü olarak bırakın.
3. Aşağıdaki değişkeni ekleyin:
   - `NEXT_PUBLIC_API_URL`: Railway API public domain'i
4. Yayınlayın ve `/giris` sayfasından yeni bir işletme hesabı oluşturun.

## 3. Yayın sonrası kontrol

1. Yeni işletme hesabı oluşturun.
2. Ürün, müşteri ve sipariş ekleyin.
3. Siparişi hazırlama, kargoya verme ve teslim etme adımlarından geçirin.
4. Dashboard, sipariş ve kargo ekranlarının yalnızca bu işletmenin verisini gösterdiğini doğrulayın.

Gizli anahtarları veya `.env` dosyalarını Git'e eklemeyin.
