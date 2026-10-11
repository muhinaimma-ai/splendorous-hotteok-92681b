# ChatSite kwenye Netlify — Maelekezo

## 1. Weka site
- Ingia Netlify → "Add new site" → "Deploy manually" (au "Import from Git").
- Buruta (drag) folda hii yote au ZIP yake kwenye Netlify.

## 2. Weka funguo ya siri ya notifications (MUHIMU!)
Bila hatua hii arifa hazitafika.
- Netlify → Site yako → **Site configuration → Environment variables** → "Add a variable".
- Jina: `VAPID_PRIVATE_JWK`
- Thamani: (funguo ya siri — iko kwenye faili `VAPID-SIRI.txt` uliyopewa; usiiweke kwenye code)
- Hifadhi, kisha **Deploys → Trigger deploy** ili function ipate thamani mpya.

## 3. Jinsi inavyofanya kazi
- Mteja anapofungua site na kuruhusu arifa, kifaa chake hujiandikisha.
- Customer service anapotuma ujumbe, mteja hupata arifa hata site ikifungwa.
- Mteja anapotuma ujumbe, customer service hupata arifa vilevile.
- Function iko kwenye `/api/public/push` (inaelekezwa kwenye Netlify Function).
