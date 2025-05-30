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
