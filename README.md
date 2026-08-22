# 🌍 GlobeTrotter - Your Personal Travel Companion

Hey there! 👋 Welcome to **GlobeTrotter**, a modern and intelligent travel planning web app we built for the Odoo Hackathon. 

Planning a multi-city trip can be a massive headache—juggling dates, tracking budgets across different currencies, and making sure you don't double-book your time. We built GlobeTrotter to fix exactly that. It's designed to be your personalized travel hub where you can map out your entire journey, track every penny, and even share your itinerary with friends.

![GlobeTrotter Banner](https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80)

---

## ✨ What can it do?

### 1. 🔐 Secure Authentication
- Simple Login and Sign Up flows with password strength meters.
- Includes a fast-track **1-Click Demo Login** if you just want to poke around without creating an account!

### 2. 🏠 Personalized Dashboard
- A dynamic home base that greets you and tracks your total journeys, planned days, and estimated budget.
- Shows a countdown for your next upcoming trip!

### 3. 📝 Itinerary Builder & Trip Manager
- Plan multi-city stops, pick dates, set budgets, and choose your travel style.
- Day-by-day activity planner with drag-and-drop reordering.
- **Smart Conflict Detection**: The app will actually warn you if you accidentally overlap activities on the same day!

### 4. 📊 Budget & Cost Breakdown
- Visual donut charts and daily spending bars to see exactly where your money is going.
- Multi-currency support. 

### 5. 🔗 Public Sharing
- Built-in one-click public share links so you can send your itinerary to family and friends.
- They can even clone your trip into their own account to use it as a template!

---

## 🛠️ Tech Stack

We originally started with a static frontend, but we've recently upgraded the architecture to be a full-stack application!
- **Frontend**: Vanilla HTML5, CSS3 (Custom Glassmorphism design), and JavaScript (ES6+). Zero third-party dependencies!
- **Backend**: Java Spring Boot 3 & Spring Security 6.
- **Database**: H2 File-based Database (local storage).

---

## 🚀 How to Run the Code Locally

If you're an external judge or just someone who wants to run the code on your own machine, you don't need any complex setup. The project uses the Maven Wrapper, so you just need **Java 17 or higher** installed.

### Step-by-Step Instructions:

**1. Clone the repository**
Open your terminal or command prompt and run:
```bash
git clone https://github.com/Samina-Kezhar/OdooXLDCE.git
cd OdooXLDCE
```

**2. Start the Backend Server**
Since this is a Spring Boot application, you can start it instantly using the included Maven wrapper. 

If you are on **Windows**:
```cmd
.\mvnw.cmd spring-boot:run
```

If you are on **Mac or Linux**:
```bash
./mvnw spring-boot:run
```

*Note: The first time you run this, Maven might take a minute or two to download the required dependencies. Just let it do its thing!*

**3. Open the App**
Once you see `Started GlobeTrotterApplication` in the terminal, open your favorite web browser and go to:
👉 **`http://localhost:8080`**

That's it! You can now create an account or use the quick demo login to explore the app. Enjoy your trip! ✈️
