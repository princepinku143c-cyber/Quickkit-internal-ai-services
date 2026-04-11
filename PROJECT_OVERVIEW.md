# 🛠️ QuickKit Global: A-Z Technical & Functional Map

This document provides a complete breakdown of the **QuickKit Global** architecture. It maps out how the code functions, where data lives, and how the user journey flows.

---

## 📂 1. Directory Structure
| Path | Purpose |
| :--- | :--- |
| `src/components/` | Reusable UI blocks like Navbar, Hero, LeadForm. |
| `src/components/catalog/` | Specialized logic for `RoadmapModal` and `CatalogItem`. |
| `src/data/` | Static data like `catalog.ts` (services) and `translations.ts`. |
| `src/constants.ts` | Global configuration (App Name, Emails, Pricing plans). |
| `src/App.tsx` | The core application hub that connects everything. |

---

## 🧬 2. Core Functional Components

### 🧭 **Navbar.tsx**
*   **Logo:** Uses `lucide-react` **Cpu** icon with a custom `animate-pulse-glow`.
*   **Nav:** Handles smooth scrolling to sections (`#hero`, `#services`, `#catalog`, `#roi`).
*   **Style:** Glassmorphism effect that blurs on scroll.

### 🚀 **Hero.tsx**
*   **Main Hook:** The "Command Center" where users type their automation needs.
*   **Action:** Triggers the `RoadmapModal` with a custom prompt.
*   **Design:** Premium slide-up animations and a floating feeling.

### 📊 **ROICalculator.tsx**
*   **Math:** Calculates `Annual Savings = (Hours Saved * Salary * 52) - Maintenance`.
*   **Visual:** Shows a high-impact $ value to "hook" the potential client.

### 🏷️ **CatalogSection.tsx**
*   **Structure:** Groups 10+ premium services into categories (Lead/Sales, Ops, AI Infra).
*   **Pricing:** All services are in **USD** ($) with a Setup fee and a Monthly maintenance fee.

---

## 🦾 3. The "Brain" (Gemini AI Integration)

### 📂 **components/catalog/RoadmapModal.tsx**
This is the heart of the system.
1.  **Input:** Takes a selected service (e.g., "WhatsApp Closer") or a custom prompt.
2.  **AI Request:** Calls **Gemini 1.5 Pro** using the `VITE_GEMINI_API_KEY`.
3.  **Prompting:** Instructs the AI to build a specific **3-Day implementation roadmap**.
4.  **Schema:** The AI outputs JSON so the UI can render:
    *   **Complexity Tier** (Starter/Pro/Enterprise)
    *   **Manual Cost Drain** (Cost of human labor)
    *   **Saved ROI** (Net profit reclaimed)
    *   **Steps:** Exactly what our agency will do on Day 1, Day 2, and Day 3.

---

## 📧 4. Lead Capture & Automation

### 📂 **components/LeadForm.tsx**
*   **Contact:** Prioritizes **Direct Email to Architect**.
*   **Gmail Integration:** Once submitted, it generates a `mailto:` link that opens the user's Gmail with a pre-formatted message: *"Hi, I've reviewed the QuickKit roadmap for [Service] and want to start..."*
*   **Fallback:** Keeps a subtle WhatsApp button for quick DMs.

---

## ⚙️ 5. Technical Stack
*   **React + Vite:** For ultra-fast frontend performance.
*   **Tailwind CSS:** For the futuristic dark-mode and glass-effect UI.
*   **Lucide Icons:** For clean, professional iconography.
*   **Google Gemini SDK:** Directly powers the AI roadmap features.
*   **Vercel:** Optimized for global hosting with environment variable protection.

---

## 🏁 How to Read This Code
- Use **`data/catalog.ts`** to update prices and services.
- Use **`constants.ts`** to change the agency's primary contact email or branding.
- The **`RoadmapModal.tsx`** is where the logic for the AI "Architect" lives.
