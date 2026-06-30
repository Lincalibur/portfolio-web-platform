Here is a comprehensive **Website Change Document** designed to bridge the gap between your latest CV and this interface, maximizing impact while keeping your code samples entirely abstract and secure.

---

# **PORTFOLIO WEBSITE REFACTOR SPECIFICATION**

## **1. Gatekeeping & Friction Reduction (The Landing Page)**
* **CV Alignment:** Ensure the copy prominently highlights your newly earned *Bachelor of Computing*, your focus on *Fintech (C#)*, and *API Security Tools*.



---

## **2. "Deploy Pipeline" Page**

* **The Evaluation:** This page is actually structurally very strong. It bridges the gap between dev and recruiter by showing a visual flow alongside technical YAML.
* **Security & Traceability Fixes:**
* In the right-hand YAML snippet window, ensure all path references, internal package registry names, or container image names are completely sanitized.
* Use generic conventions like `uses: actions/checkout@v4`, `run: dotnet build --configuration Release`, and build images tagged as `image: fintech-service:latest` instead of specific company naming schemas.


* **UX Improvement:** Add a small "Play" button at the top of the pipeline box. Clicking it runs a simulated, automated 5-second glowing green progress animation down the steps (`Checkout` $\rightarrow$ `dotnet build` $\rightarrow$ `dotnet test`) to make the page feel reactive and alive rather than static text.

---

## **3. "System Orchestration" $\rightarrow$ "API Gateway & Security"**

* **The Problem:** A generic CPU/Memory usage graph doesn't tell a recruiter *what you built*. It looks like a basic template.
* **The Fix:** Refactor this block into an **Interactive API Circuit & Security Gate**. Instead of hosting stats, show a visual layout of an API Gateway managing request flows.

```
[ Client Request ] ---> [ Security Layer: API Hardening ] ---> [ Microservices ]
       │                            │                               │
       ├── Web Traffic              ├── Token Validation            ├── web: Healthy
       └── Malicious Payload 🛑    └── Rate Limiter Blocked 🛡️      └── api: Healthy

```

* **Functional/Interactive Component Ideas:**
* **The "Simulate Attack" Button:** Add a prominent toggle button labeled `Simulate SQL Injection / API Abuse`. When clicked, a red data packet travels from the "Client" toward the "API Gateway." The `Security Layer` flashes, intercepts it, and updates a log screen showing an immediate `403 Forbidden - Rate Limit / Payload Filter Triggered`.
* This perfectly proves your CV’s point about upskilling in *API Security* to a non-technical recruiter instantly, while a developer will appreciate the logic behind the simulation.



---

## **4. "Script Repository" & Animations**

swap the code section with the Output so the user can see what it does and then if they want to they can review the code,that is being run.
