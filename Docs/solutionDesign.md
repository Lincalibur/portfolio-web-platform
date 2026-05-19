# Solution Design Document: Project "Interactive Resume Ecosystem"

## 1. System Architecture Overview

The system is divided into three core layers: **Edge/Infrastructure**, **Backend (ABP Framework)**, and **Frontend (Interactive Story)**.

```
[ Visitor Browser ] 
        │
        ▼ (Port 443 / HTTPS)
[ Cloudflare / Reverse Proxy ] ──(SSL Termination)──► [ Debian Laptop (Docker) ]
                                                              │
                     ┌────────────────────────────────────────┴────────────────────────────────────────┐
                     ▼                                        ▼                                        ▼
         [ Frontend: Interactive UI ]             [ Backend: ABP API ]                       [ Database / Mailer ]
         (Story Blocks & Demos)                   (Auth, Token Gen, Logs)                    (PostgreSQL / SMTP)

```

### Infrastructure Components (The Debian Laptop)

* **Reverse Proxy:** Nginx or Traefik running in Docker to handle SSL termination and forward traffic to the application.
* **Containerization:** Docker Compose to orchestrate the frontend, backend, and database, ensuring easy deployment and environment isolation.
* **Database:** PostgreSQL or SQLite (lightweight for a laptop) to store authorized emails, access tokens, and interaction logs.

---

## 2. Gatekeeper & Security Layer (The Auth Flow)

To protect your detailed career data and capture leads, visitors must authenticate before viewing the full CV.

### Step-by-Step Verification Workflow

1. **Landing Page:** The user lands on a minimal, high-security themed gateway page.
2. **Data Capture:** The user enters their **Company Email** and **Full Name**.
3. **Validation & Token Generation:**
* The ABP backend validates the input (ensuring it's a valid email format).
* It generates a short-lived, single-use 6-digit verification code or a secure GUID token.
* The backend saves the lead details and token status (`Pending`) to the database.


4. **Email Dispatch:** An automated email is triggered via an SMTP provider (like SendGrid or Mailgun) containing the token.
5. **Access Granted:** Once the user inputs the correct code, a JWT (JSON Web Token) is issued to their browser session, granting access to the "Story" route for a set period (e.g., 7 days).
6. **Follow-up Trigger:** A background worker (using ABP's Background Job system) schedules a follow-up email to be sent 24–48 hours later.

---

## 3. Core Application Architecture (ABP Framework)

Using the ABP Framework ensures your backend follows Domain-Driven Design (DDD) best practices.

### Module Breakdown

* **Domain Layer:** Defines entities like `VisitorLead` (Id, Name, Email, Company, Token, IsVerified, CreatedDateTime) and `InteractionLog`.
* **Application Layer:**
* `LeadAppService`: Handles `RequestAccessAsync` (captures info, sends email) and `VerifyTokenAsync` (validates code, returns JWT).
* `MetricsAppService`: Captures anonymous telemetry from the interactive blocks.


* **Infrastructure Layer:** Configures Entity Framework Core for data persistence and handles the MailKit/SMTP integration for sending tokens.

---

## 4. The Interactive Story Layout (Frontend)

The frontend should be a single-page application (SPA) built with Angular, React, or Blazor (which integrates beautifully with ABP). The page flows vertically or horizontally like a timeline, unlocking interactive "Skill Modules" as they scroll.

### Story Blocks & Skill Exhibitions

| Story Stage / Block | The Narrative | The Interactive Element (The "Flex") | Skills Proven |
| --- | --- | --- | --- |
| **01. The Gateway** | "Securing the perimeter." | The email capture and token validation UI. | Cyber Security, UX, API Integration |
| **02. The Pipeline** | "How this code got here." | An interactive, visual CI/CD pipeline graph. Clicking nodes shows actual YAML configurations (GitHub Actions/GitLab CI) used to deploy the site. | Git, YAML, DevOps, Automation |
| **03. System Orchestration** | "Living on the edge." | A mini-dashboard displaying real-time (or cached) server stats of your Debian laptop (CPU, RAM, Docker container statuses) fetched via an API. | Linux Admin, Docker, Bash/Python Scripting |
| **04. Automation Hub** | "Letting scripts do the work." | A terminal emulator interface where the user can click a button to run a simulated Python automation script (e.g., parsing a log file or compiling a report) and see the output in real-time. | Python Scripting, Logic, Backend Architecture |
| **05. Documentation Vault** | "The blueprint of success." | An embedded, beautifully formatted Markdown viewer showing technical specs, architecture diagrams, and user manuals for this exact project. | Technical Writing, Solution Design, Structure |

---

## 5. Security & Hardening Strategy

Because you are hosting this on your home network via a spare laptop, hardening is critical to prevent your local network from being compromised.

* **Network Isolation (DMZ):** Put the laptop on a guest VLAN or separate subnet isolated from your home devices.
* **Cloudflare Tunnel (Highly Recommended):** Instead of opening ports (80/443) on your home router and exposing your public IP, use a **Cloudflare Tunnel (`cloudflared`)**. It creates a secure, outbound-only connection to Cloudflare. Traffic goes from Cloudflare to your laptop without open inbound ports.
* **Rate Limiting:** Implement rate limiting in your Nginx proxy or ABP middleware to prevent malicious actors from spamming your SMTP server with email requests.
* **Fail2Ban:** Install `fail2ban` on the Debian host to automatically block IPs exhibiting malicious behavior (like brute-forcing the token endpoint).

---

## 6. Implementation Roadmap

### Phase 1: Local Environment & Architecture (Weeks 1-2)

* Set up the Debian laptop with Docker and Git.
* Initialize the ABP Framework solution template.
* Design the Database schema for tracking leads and tokens.

### Phase 2: Security & Backend Logic (Weeks 3-4)

* Build the email verification endpoints in ABP.
* Integrate an SMTP provider and test token delivery.
* Set up JWT authentication for the resume routes.

### Phase 3: Frontend & Interactive Blocks (Weeks 5-6)

* Build the landing gate UI.
* Develop the story layout and individual skill components (Terminal emulator, pipeline visualizer).
* Connect frontend components to backend APIs.

### Phase 4: Deployment & Hardening (Week 7)

* Write Docker Compose files to package the entire application.
* Configure Cloudflare Tunnels for secure access.
* Write the comprehensive markdown documentation to embed into your "Documentation Vault" block.