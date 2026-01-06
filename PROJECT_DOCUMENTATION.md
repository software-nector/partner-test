# Purna Gummies Reward & Review System - Official Documentation

## 1. Project Overview
A premium, AI-powered ecosystem designed to incentivize customers to leave high-quality product reviews on marketplaces (Amazon, Flipkart, etc.) in exchange for instant cashback and free products. The system is built with a heavy focus on **fraud prevention** and **forensic verification**.

---

## 2. Core Features (Implemented)

### A. Authentication & User Flow
*   **Dual-Channel Login**: WhatsApp OTP (Primary) for verified mobile identity, with Email/Password and Google OAuth as fallbacks.
*   **Mobile-First Dashboard**: Users see their stats, pending claims, and "How to Earn" guides in a sleek glassmorphic UI.
*   **QR Code Auto-fill**: Scanned QR codes automatically pre-fill the coupon code and identify the product name for the user.

### B. AI Forensic Verification (The "Brains")
*   **GPT-4o Vision Integration**: The system doesn't just "read" screenshots; it audits them.
*   **Forgery Detection**: Specifically searches for Photoshop markers, font mismatches, and pixel inconsistencies in the reviewer's name or rating.
*   **Multi-Point Analysis**: Checks if the review is 5-star, matches the marketplace (Amazon/Flipkart), and includes the correct product.
*   **Decision Logs**: Admins can see the AI's step-by-step reasoning for every approval.

### C. The Multi-Layer Fraud Shield (Security)
*   **Image Hashing (SHA256)**: Prevents the same screenshot from being used across different accounts or multiple times.
*   **UPI Identity Lock**: Each UPI ID is locked to a single user. If a user tries to use a UPI ID already linked to another person, the system blocks it.
*   **IP Red Flags**: Tracks user IP addresses. If multiple accounts claim rewards from the same device/Wi-Fi, a "RED FLAG" alert pulses on the Admin Dashboard.
*   **Encrypted QR Tokens**: Replaced guessable SKU-SERIAL URLs with 12-character cryptographic tokens.

### D. Cloud Infrastructure
*   **Google Drive Storage**: All proof-of-purchase screenshots are automatically uploaded to Google Drive via service account, ensuring server storage stays light and data is permanent.
*   **PDF Batch Generation**: Admin can generate 500+ QR codes at once, producing a high-quality PDF ready for printing inside product packs.

---

## 3. Technology Stack
*   **Backend**: Python FastAPI (High performance, async execution).
*   **Frontend**: React.js with Tailwind CSS & Framer Motion (Premium aesthetics).
*   **Database**: MySQL with SQLAlchemy ORM and Alembic migrations.
*   **AI**: OpenAI GPT-4o Vision API.
*   **Storage**: Google Drive API v3.
*   **Auth**: JWT (JSON Web Tokens) with Phone/Email support.

---

## 4. Current Refinements & Optimizations (Done)
*   **PDF Header Fix**: Corrected Content-Disposition headers to allow downloads with special characters.
*   **QR Reclamation**: If an Admin rejects a claim, the QR code is automatically "Freed" so the user can try again with a correct image.
*   **UPI Validation**: Intelligent frontend regex check (detects name@bank) + Backend uniqueness check.

---

---

## 6. Role Requirements & SOP (Standard Operating Procedure)

### A. THE USER (The Customer)
**Objective**: Purchase, Review, and Earn.
*   **Step 1: Scans QR**: Customer finds the encrypted QR code inside the Purna Gummies pack.
*   **Step 2: Instant Login**: Authenticats via WhatsApp OTP (or Google/Email). Coupon code is automatically detected.
*   **Step 3: Marketplace Review**: Customer goes to Amazon/Flipkart/Meesho, gives 5 stars + photo, and submits.
*   **Step 4: Submission**: Customer uploads the screenshot on the dashboard and enters a valid UPI ID (validated in real-time).
*   **Step 5: Status Tracking**: User can see if their reward is "Pending", "Approved", or "Rejected" (with reason).

### B. THE ADMIN (Store Owner)
**Objective**: Monitor, Audit, and Dispatch Payments.
*   **Step 1: QR Generation**: Generates high-quality PDF batches of single-use encrypted tokens for printing.
*   **Step 2: Intelligence Audit**:
    *   **Level 1**: Check **AI Decision Log** for forensic forgery signs.
    *   **Level 2**: Check **Red Flags** (Is the same IP or UPI used by multiple accounts?).
    *   **Level 3**: View high-resolution proof on Google Drive.
*   **Step 3: Approval/Rejection**: 
    *   **Approve**: Validates the claim for payout.
    *   **Reject**: Automatically "Frees" the QR code so the customer can try again if the error was minor.
*   **Step 4: Bulk Payout**: Selects all "Approved" rewards and executes a bulk payment (with Transaction ID recording).

---

## 7. Performance & Limits
*   **OTP Rate Limit**: Max 1 OTP every 2 minutes per number.
*   **QR Security**: Tokens are 128-bit hashed (impossible to guess/brute-force).
*   **Image Limit**: Max 5MB per upload (Auto-optimized during Drive upload).

---

---

## 9. Deep-Dive: User Requirements & Restrictions

### A. Core Eligibility (How to qualify)
To successfully claim a reward, a user must meet these **Three Pillars**:
1.  **Identity Uniqueness**: 
    -   Must use a verified WhatsApp number.
    -   One account per Physical Link (IP/Device). Using 5 phones on 1 Wi-Fi will trigger a **Red Flag**.
2.  **The Perfect Review**:
    -   **Rating**: Must be a 5-Star review.
    -   **Visual Proof**: Must include at least 1 photo of the product in the review.
    -   **Text**: Must have a meaningful comment (not just "good").
    -   **Marketplace Match**: If the QR prefix is `AMZ`, the review must be on Amazon.
3.  **The Payout Lock**:
    -   **UPI Uniqueness**: A single UPI ID cannot be used by two different accounts. This prevents "Identity Cloning".

### B. Hard Restrictions (Immediate Rejection)
The system will automatically or manually reject a claim if:
*   **Duplicate Image**: The SHA256 hash of the screenshot matches an existing entry in our database.
*   **Forensic Forgery**: GPT-4o detects "Photoshop artifacts", font mismatches, or edited pixel zones.
*   **SKU Mismatch**: User scans a QR from "Apple Gummies" but submits a review for "Hair Vitamins".
*   **Expired/Used QR**: User attempts to use a token that has already been successfully "Paid".

### C. Soft Restrictions (Account Warning / Pending)
*   **IP Clashing**: If 3 users claim from the same IP, they are moved to "Manual Hold" for Admin to verify there isn't a scam ring.
*   **Name Mismatch**: If the name on the Amazon Review is totally different from the User's Name, it stays "Pending" for Admin notes.

---

## 10. The Reward Lifecycle (Stages)

A reward claim moves through these technical states:
1.  **Submitting**: User uploads data. Image is hashed and saved to Google Drive.
2.  **AI Analysis**: GPT-4o audits the image. 
    -   If 100% clean → **Auto-Approved**.
    -   If suspicious → **Pending (Flagged)**.
3.  **Admin Audit**: (Optional for auto-approved) Admin verifies the payout details and Red Flags.
4.  **Disbursement**: Paid via UPI. QR is permanently closed.
5.  **Reclamation**: If Rejected, the QR is "Unlocked" and the user is notified to re-submit corrected proof.

---

## 11. Future Roadmap (What's Next?)

### Phase 6: Automated Payouts
*   **Razorpay Payouts Integration**: Move from "Manual Audit -> Paid" to "Admin Click -> Bank Transfer" via Razorpay API.
*   **Real-time Name Verification**: Use Razorpay VPA Validation to show the user's actual bank name before they even submit.

### Phase 7: Advanced CRM & Notifications
*   **Post-Verification WhatsApp Support**: Send a WhatsApp message automatically when the's AI/Admin approves their reward.
*   **Loyalty Levels**: Give more cashback to "Top Reviewers" (users who have submitted 3+ valid reviews).

### Phase 8: Gamification
*   **Leaderboard**: Show top influencers contributing reels.
*   **Spin the Wheel**: Offer a chance for double cashback after a successful verification.

---
**Last Updated**: January 06, 2026
**Status**: Beta Production Live 🚀
