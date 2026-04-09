# 🌸 Flower Calculator

<p align="center">
  <h1 align="center">🌸 Flower Calculator</h1>
  <p align="center">Fast, modern & offline-first flower payout calculator</p>
</p>

---

## 🚀 Live App

https://audaykumarr-flower-calculator.vercel.app

---

## ⚡ What's New (Optimized Version)

- 🚀 Removed backend dependency (Render)
- ⚡ Fully migrated to Supabase
- 🔥 Ultra-fast manual save mode (no lag)
- 📌 Sticky action bar (Save / Reset / History)
- 📅 Dynamic cycle days (not fixed 15 days)
- 💾 Local draft auto-save
- 📊 Batch database updates (optimized writes)
- 💎 Premium share card UI
- 📲 WhatsApp native image sharing
- 🔔 Custom toast notifications (no alerts)

---

## 📦 Tech Stack

- Next.js (App Router)
- React
- Tailwind CSS
- Supabase (Database)
- html-to-image (Share feature)

---

## 📁 Project Structure

flower-calculator/  
│── app/  
│   ├── page.tsx  
│   ├── history/  
│   ├── history/[id]/  
│   ├── history/[id]/summary  
│── lib/  
│   ├── supabase.ts  
│── public/  
│── styles/  
│── package.json  

---

## ⚙️ Setup (Local)

1. Clone repo  
git clone https://github.com/audaykumarr/flower-calculator.git  
cd flower-calculator  

2. Install dependencies  
npm install  

3. Create `.env.local`  

Add:

NEXT_PUBLIC_SUPABASE_URL=your_url  
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key  

4. Run app  
npm run dev  

Open:
http://localhost:3000  

---

## 🧠 Features

- 🌸 Daily flower entry tracking  
- 💰 Automatic payout calculation  
- 📉 Commission handling  
- 📜 History tracking  
- ✏️ Edit previous entries  
- ⚡ Ultra-fast performance (no lag)  
- 💾 Local draft save  
- 📲 WhatsApp share (image)  
- 💎 Premium UI  

---

## 🔥 Performance Improvements

- Reduced API calls using batch upsert  
- Removed unnecessary re-renders  
- Memoized calculations  
- Eliminated backend latency  
- Instant UI updates  

---

## 📲 Sharing Feature

- Generates **premium payout card**
- Supports:
  - WhatsApp
  - Telegram
  - Native share (mobile)
- Fallback: image download

---

## ⚠️ Notes

- No backend required  
- Works even on slow networks  
- Supabase handles all data  
- `.env.local` is ignored  

---

## 🚀 Deployment (Vercel)

1. Push to GitHub  
2. Go to https://vercel.com  
3. Import project  
4. Add env variables:

NEXT_PUBLIC_SUPABASE_URL  
NEXT_PUBLIC_SUPABASE_ANON_KEY  

5. Deploy 🚀  

---

## 👨‍💻 Author

Uday Kumar  
