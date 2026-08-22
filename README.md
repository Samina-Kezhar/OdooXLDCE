# 🌍 GlobeTrotter - Empowering Personalized Travel Planning

> A modern, intelligent, and interactive travel planning web application built for the Odoo Hackathon.

![GlobeTrotter Banner](https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80)

---

## ✨ Features & Screen Breakdown

### 1. 🔐 Authentication (Login / Signup)
- Seamless tab toggle between Login and Signup.
- Live **Password Strength Meter** evaluating length, casing, numbers, and symbols.
- RFC 5322 Email regex validation and password confirmation match checks.
- **Edge Cases Handled**:
  - Offline submission alert (*"No internet connection"* toast).
  - Simulated `409 Conflict` duplicate email handling (`taken@globetrotter.io`).
  - Fast-track **1-Click Demo Login** for rapid evaluation.

### 2. 🏠 Dashboard / Traveler Hub
- Dynamic time-of-day greeting (*"Good morning / afternoon / evening, Alex!"*).
- Summary KPI Cards: Total Journeys, Days Planned, Curated Activities, Estimated Budget.
- Upcoming Trip countdown hero card with budget utilization progress bar.
- Recommended Destinations showcase with ratings and 1-click itinerary starter.
- **Edge Cases Handled**:
  - **Inviting Empty State**: Illustrated prompt with starter templates when 0 trips exist.
  - Network error simulation with skeleton loaders and retry button.

### 3. ➕ Create Trip
- Trip title, multi-city destination, date range pickers, budget target, currency selector, travel style tags, and description.
- Curated high-resolution cover photo presets.
- **Edge Cases Handled**:
  - Start date past-date warning & End date before Start date blocker.
  - **10MB Image File Guard**: Client-side validation preventing uploads >10MB with DataURL conversion for instant offline preview.

### 4. 🗺️ My Trips (Trip List)
- Filterable card grid (*All, Upcoming, Ongoing, Past*).
- Live keyword search across destinations, titles, and notes.
- Actions: Edit Itinerary, Budget Breakdown, 1-Click Clone/Duplicate, Public Share, and Delete.
- **Edge Cases Handled**:
  - **Pagination Controls**: Configurable page size (6 trips/page) with next/previous navigation.
  - **Safe Deletion Modal**: Prevents accidental loss through explicit confirmation dialog.

### 5 & 6. 📝 Itinerary Builder & Reader View
- Multi-city stops with arrival and departure dates.
- Day-by-day activity planner with category icons (*Sightseeing, Food, Transport, Stay, Adventure, Culture, Shopping, Nightlife*).
- Drag handles and ▲/▼ reordering controls.
- **Conflict Detection Algorithm**: Detects overlapping time intervals on the same day and flags them with an amber border and alert banner.
- **Reader View**: 3 layout modes (*Detailed Cards, Chronological Timeline, Compact List*) with print-ready stylesheet.
- **Edge Cases Handled**:
  - Modifying trip dates prompts the user if scheduled activities fall outside the new window.

### 7 & 8. 🔍 City & Activity Search
- Search across 20+ global cities and 50+ curated activities.
- Category filter pills, continent filters, and max cost slider.
- Saved Wishlist bookmarks (❤️).
- **Edge Cases Handled**:
  - **300ms Debounced Input**: Eliminates typing lag.
  - **Empty Search Graphics**: Friendly illustration with a 1-click filter reset button.
  - Direct **"Add to Trip"** modal targeting any active trip and day.

### 9. 📊 Trip Budget & Cost Breakdown
- Total Target Budget, Actual Planned Expenses, Remaining Balance, and Average Daily Spend.
- **Category Donut Chart**: Native HTML5 Canvas interactive donut chart with legend and percentages.
- **Daily Spend Bar Chart**: Daily spending timeline with a dashed target budget ceiling line.
- Over-budget days alert list.
- **Edge Cases Handled**:
  - **Division-by-Zero Safety**: Handles $0 budget or 0 activities cleanly without `NaN` or `Infinity`.
  - Multi-Currency formatting (*USD $, EUR €, GBP £, INR ₹, JPY ¥, CHF, CAD $, AUD $*).

### 10. 📅 Calendar & Timeline Flow
- Chronological expandable day stream.
- **Edge Cases Handled**:
  - **Time Zone Awareness**: Toggle between *Destination Local Time* and *Device Local Time*.

### 11. 🔗 Public Share View
- Clean read-only presentation for public sharing.
- **"Copy Trip to My Account"** 1-click cloning.
- Clipboard share link copy with toast notification.
- Social sharing shortcuts (*WhatsApp, X/Twitter, Print/PDF*).

### 12. ⚙️ Profile & Settings
- Avatar selector, profile editor, default currency setting.
- **Dark & Light Glassmorphic Theme Switcher** (live CSS custom property updates).
- Saved Wishlist manager, JSON backup export, and demo seed data reset.

### 13. 📈 Admin Analytics
- High-level platform KPIs (*12,480+ Active Travelers, Top 5 Booked Destinations rankings, 99.98% System Uptime*).

---

## 🛠️ Tech Stack & Aesthetics

- **Core**: Vanilla HTML5, CSS3, JavaScript (ES6+) with **zero build step or third-party dependencies**.
- **Design System**: Midnight Dark Glassmorphism & Crystal Light Glassmorphism with Google Fonts (`Outfit`, `Inter`, `JetBrains Mono`).
- **Data Persistence**: Reactive `localStorage` StateStore with pub/sub events and simulated Spring Boot REST API client (`/api/*`).

---

## 🚀 Getting Started

### Running Locally

Clone the repository and start any static HTTP server (e.g., Python):

```bash
# Clone the repository
git clone https://github.com/Samina-Kezhar/OdooXLDCE.git

# Navigate to directory
cd OdooXLDCE

# Run local HTTP server
python -m http.server 8080
```

Open your browser at **`http://localhost:8080`**.
