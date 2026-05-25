# 🚀 Interactive Resume Ecosystem

An advanced, self-hosted interactive CV website built on **ABP Framework** and hosted locally on a **Debian** server. This project serves as a living portfolio, demonstrating full-stack engineering, DevOps, automation, and cybersecurity principles.

---

## 🔑 Core Features & Flow

### 🛡️ 1. Secure Gatekeeper Layer

* **Lead Capture:** Captures corporate email & name before granting access.
* **MFA Verification:** Generates and dispatches a short-lived **Auth Token** via SMTP.
* **Session Management:** Issues a secure, time-bound JWT upon successful verification.
* **Nurture Loop:** Automates follow-up tracking using ABP Background Workers.

### 🎭 2. Interactive Story Blocks

* **🔒 Cyber Security Vault:** Zero-trust architecture, Cloudflare Tunnels (no open router ports), and brute-force mitigation.
* **🐍 Python Automation Hub:** An embedded terminal mock demonstrating real-time log-parsing scripts.
* **⚙️ DevOps & Git Pipeline:** Interactive UI visualization of the **Git/YAML** CI/CD deployment pipeline.
* **🐧 System Orchestration:** Real-time container metrics (CPU/RAM/Docker stats) streamed straight from the Debian host.
* **📚 Live Documentation:** An architecture blueprint viewer rendering the solution design dynamically.

---

## 🛠️ Tech Stack

* **Framework:** ABP Framework (.NET Core / DDD Architecture)
* **Database:** PostgreSQL 🐘
* **Infrastructure:** Docker 🐳 & Docker Compose
* **Host OS:** Debian Linux 🐧
* **Network/Security:** Cloudflare Tunnels 🌪️ & JWT Auth
* **Frontend:** Blazor / SPA Framework 💻

---

## 🚀 Quick Setup (Development)

```bash
# Clone the repository
git clone https://github.com/yourusername/interactive-resume.git
cd interactive-resume

# Configure environment variables
cp .env.example .env

# Spin up the ecosystem via Docker Compose
docker-compose up -d

```

---

## 📖 Project Blueprint

For a deep dive into the network routing, domain models, and background worker logic, see the full **Solution Design Document (SDD)**.
