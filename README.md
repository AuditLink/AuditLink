# AuditLink: The Virtual Auditor for Health Insurance Integrity

## Abstract

**AudiLink** is an AI-powered blockchain auditor that streamlines the end-to-end health insurance claim process between **patients**, **healthcare providers**, and **insurers**.  
It integrates **NHS datasets**, **Dreamspace blockchain verification**, and a **Caffeine.ai-generated conversational interface** to ensure data integrity, fraud detection, and real-time claim transparency.

## Introduction

### Video Demo: https://youtu.be/uER61TBhZEo
### Live Product: https://auditlink-srr.caffeine.xyz

## Problem Statement: AudiLink — AI-Powered Blockchain Auditor for Healthcare Claims

### Vertical: Companions
*(AI-driven app supporting users in health and finance)*

Healthcare insurance claims remain one of the most inefficient and error-prone processes in modern health systems.  
Across the UK and globally, patients face slow reimbursements, insurers handle rising fraud risks, and providers struggle with administrative delays caused by missing, altered, or unverified data.  
Despite decades of digitization, the trust gap between these three stakeholders — patients, providers, and insurers — persists because data integrity and verification still rely on manual audits and fragmented systems.

**AuditLink** addresses this by acting as a virtual auditing companion that automates and secures the entire insurance claim lifecycle using Caffeine.ai’s self-writing app framework and Motoko blockchain integration on the Internet Computer.

Through its conversational interface, hospitals, patients, and insurers collaboratively validate and approve claims. Each step is recorded immutably on-chain, eliminating manual audits while ensuring full transparency.

---

### How AudiLink Satisfies the Judging Pillars

| Criterion | Implementation in AudiLink |
|------------|----------------------------|
| **Problem Relevance & Impact** | Targets the $30B annual loss in audit inefficiencies and insurance fraud. Eliminates third-party auditors by automating multi-party verification. |
| **Innovation & Creativity** | Built entirely through Caffeine.ai’s self-writing framework using natural language prompts. Combines AI app generation with blockchain immutability for the first time in healthcare finance. |
| **Complexity & Sophistication** | Implements a three-role architecture — provider, patient, insurer — with each performing blockchain-verified transactions. Multi-signature claim validation ensures trust across all actors. |
| **Functionality & Working Demo** | Fully functional prototype: claims are submitted, approved, and paid on-chain, with real blockchain transactions shown in the console. |
| **UX & Design** | Designed for clarity and accessibility. Every action — submission, approval, verification — is one-click, with visual confirmations and a consistent conversational tone. |

## 🧩 Core Architecture

### 🎯 Objective
Automate and verify the health insurance claim lifecycle using:

- **Blockchain immutability** for transparent verification
- **Smart contract multi-signature validation** for multi-party agreement
- **NHS provider and procedure verification** for verified provider and procedure data
- **Conversational AI interface** for ease of use and scalability  

---

## 🧱 System Components

| **Layer** | **Technology** | **Role** |
|------------|----------------|----------|
| **Front End** | React + TypeScript (Caffeine.ai-generated) | Multi-role dashboard interface (Provider, Patient, Insurer) with conversational workflow |
| **Styling** | Tailwind CSS | Responsive UI and component styling |
| **Backend** | Motoko (Internet Computer Canister) | Core logic, data persistence, and verification |
| **Authorization** | Motoko module (`authorisation/access-control.mo`) | Role-based access control and permission enforcement |
| **Migrations** | Motoko module (`migration.mo`) | Placeholder for future state schema upgrades |
| **Data Layer** | Stable in-canister storage | Claims, Profiles, Agreements, Notifications, NHS provider data |
| **Integrations** | NHS Open Data API | Provider and procedure code validation for authenticity |

---

## 🩺 Data Integration

### 🏥 Independent Health Provider Directory

**Source:**  
[https://www.england.nhs.uk/wp-content/uploads/2019/04/2025-10-06-register-of-licensed-independent-providers.xlsx](https://www.england.nhs.uk/wp-content/uploads/2019/04/2025-10-06-register-of-licensed-independent-providers.xlsx)

**Mapped Fields:**

| **NHS Column** | **Local Field** |
|----------------|----------------|
| ODS Code | `id` |
| Organisation Name | `name` |
| Address Line 1 | `address` |
| Postcode | `postcode` |

**API Endpoint Example:**

```bash
GET /api/providers
```
### 📂 Repository Contents: AuditLink Source Code
```
AuditLink Source Code/
│
├── frontend/
│ ├── index.html
│ ├── tailwind.config.js
│ └── src/
│ ├── App.tsx
│ ├── main.tsx
│ ├── index.css
│ │
│ ├── components/
│ │ ├── Header.tsx
│ │ ├── ProviderDashboard.tsx
│ │ ├── PatientDashboard.tsx
│ │ ├── InsurerDashboard.tsx
│ │ └── ProfileSetup.tsx
│ │
│ ├── hooks/
│ │ └── userQueries.ts
│ │
│ ├── lib/
│ │ ├── nhsProviderService.ts
│ │ ├── procedureCodeService.ts
│ │ └── profileUtils.ts
│ │
│ └── pages/
│ ├── Dashboard.tsx
│ └── LoginPage.tsx
│
├── backend/
│ ├── main.mo # Core canister logic: claims, agreements, notifications
│ ├── migration.mo # Migration placeholder (currently no-ops)
│ └── authorisation/
│ └── access-control.mo # Access control and role-based authorization
│
└── README.md # This documentation file

```
## ⚙️ Frontend Architecture Overview

| **Layer** | **Key Files / Folders** | **Function** |
|------------|-------------------------|---------------|
| **Entry Point** | `index.html`, `main.tsx` | Bootstraps React app and injects root component |
| **App Shell** | `App.tsx` | Defines routing and navigation across roles |
| **Styling** | `tailwind.config.js`, `index.css` | Tailwind setup and global styling |
| **Components** | `Header.tsx`, `ProviderDashboard.tsx`, `PatientDashboard.tsx`, `InsurerDashboard.tsx`, `ProfileSetup.tsx` | Role-specific dashboards and UI building blocks |
| **Hooks** | `userQueries.ts` | Custom React hooks for fetching user and claim data |
| **Lib** | `nhsProviderService.ts`, `procedureCodeService.ts`, `profileUtils.ts` | Utility layer for NHS provider lookup, procedure codes, and user profile handling |
| **Pages** | `Dashboard.tsx`, `LoginPage.tsx` | Top-level pages for main and authentication workflows |

---

## 🧩 Backend Architecture Overview

| **File / Module** | **Purpose** |
|--------------------|-------------|
| `main.mo` | Core canister implementing claim lifecycle (submit → endorse → approve → payout) |
| `authorisation/access-control.mo` | Role-based access control and admin bootstrap logic |
| `migration.mo` | Placeholder for stable data structure migrations |

---

## ⚙️ Key Features Implemented

- ✅ **Multi-role dashboards** for Provider, Patient, and Insurer  
- 🔐 **Access control** handled via `authorisation/access-control.mo` (RBAC model)  
- 🧾 **Full claim lifecycle** — submit, endorse, approve, and confirm payment  
- 🔔 **Notifications system** to sync all three actors  
- 🏥 **NHS dataset integration** for verified provider and procedure codes  
- 💅 **Tailwind-powered responsive design** for all interfaces  

---

