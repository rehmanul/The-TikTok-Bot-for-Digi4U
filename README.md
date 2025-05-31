# The TikTok Affiliator Bot for Digi4U 🇬🇧

A custom web automation solution developed for **Digi4U** (UK) to automate the affiliate creator invitation process on **TikTok Shop**. This bot programmatically creates invitation links, selects influencers, and invites them based on criteria like follower count and GMV, using stealth browsing automation.

---

## 🎯 Use Case

> Automate creator outreach for TikTok affiliate campaigns to reduce manual workload and increase campaign velocity for Digi4U’s UK market.

---

## 🛠 Features

- ✅ Create multiple **TikTok affiliate invitation links** (e.g., "Promotion Product 1", "Promotion Product 1-6")
- ✅ Add product, set commission (10%), and configure expiration (1 month)
- ✅ Invite up to **50 creators per link**
- ✅ Automatically **select invitation category** and **follower ranges**
- ✅ Avoid re-inviting creators previously invited
- ✅ Uses stealth Puppeteer + rotating selection
- ✅ Stops when GMV (gross merchandise volume) criteria is hit
- ✅ CLI and Web interface (React + Tailwind + Vite)

---

## ⚙️ Setup Instructions

### 1. Clone & Install

```bash
git clone https://github.com/rehmanul/The-TikTok-Bot-for-Digi4U.git
cd The-TikTok-Bot-for-Digi4U
npm install
pip install -r requirements.txt  # If backend Python exists

# Initialize database tables
npm run db:push
```

### 2. Configure Environment

Create a `.env` file in the project root with your credentials:

```env
PORT=5000
DATABASE_URL=postgres://user:password@host:5432/database
TIKTOK_EMAIL=your-email@example.com
TIKTOK_PASSWORD=your-password
SESSION_SECRET=replace-with-random-string
```

### 3. Run in Development

Start the Express API and Vite client together:

```bash
npm run dev
```

### 4. Build for Production

Compile the client and server bundles:

```bash
npm run build
```

### 5. Start in Production

After building, launch the bot with:

```bash
npm run start
```

### 6. Deploy

The repository includes a `render.yaml` file for deployment to
[Render](https://render.com). Create a new Web Service from this repo and
provide the same environment variables configured above. Render will run the
build and start commands automatically.
