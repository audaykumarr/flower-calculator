<p align="center">
  <h1 align="center">🌸 Flower Calculator Frontend</h1>
  <p align="center">Modern UI for calculating flower payouts with commission</p>
</p>

---

## 🚀 Live App

https://audaykumarr-flower-calculator.vercel.app

---

## 📦 Tech Stack

- Next.js (App Router)
- React
- Tailwind CSS
- Axios

---

## 📁 Project Structure

flower-calculator/  
│── app/      
│   ├── page.tsx       
│   ├── history/       
│   ├── history/[id]/        
│   ├── history/[id]/summary        
│── public/       
│── styles/       
│── .env.local       
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

NEXT_PUBLIC_API_URL=https://audaykumarr-flower-backend.onrender.com/ 

4. Run app  
npm run dev -- --webpack  

Open:
http://localhost:3000  

---

## 🔗 API Connection

Uses:

process.env.NEXT_PUBLIC_API_URL

---

## 🧠 Features

- Daily entry tracking  
- Commission calculation  
- History tracking  
- Edit entries  
- WhatsApp sharing  
- Auto-save  

---

## ⚠️ Notes

- `.env.local` is ignored  
- Backend must be live  
- Render free tier may sleep  

---

## 🚀 Deployment (Vercel)

1. Push to GitHub  
2. Go to https://vercel.com  
3. Import project  
4. Add env:

NEXT_PUBLIC_API_URL=https://audaykumarr-flower-backend.onrender.com/  

5. Deploy 🚀  

---

## 👨‍💻 Author

Uday Kumar
