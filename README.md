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
| **Front End** | [Caffeine.ai](https://caffeine.ai/) (React + TypeScript) | Self-generated conversational app interface (Provider, Patient, Insurer views) |
| **Backend** | Node.js + Express | REST API for claim submission, validation, and blockchain integration |
| **Blockchain** | Motoko (Internet Computer) | Immutable claim recording and transaction verification |
| **Data Sources** | NHS ODS Register + NHS OPCS-4.10 Reference | Provider and medical procedure validation |

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

```
### 📂 Repository Contents: AuditLink Source Code
AuditLink Source Code/
│
├── frontend/
│   ├── App.jsx
│   ├── components/
│   │   ├── ProviderView.jsx
│   │   ├── PatientView.jsx
│   │   ├── InsurerView.jsx
│   │   ├── LedgerTimeline.jsx
│   │   └── DashboardStats.jsx
│   ├── assets/
│   │   └── icons, animations, and logo files
│   └── styles/
│       └── global.css
│
├── backend/
│   ├── server.js
│   ├── routes/
│   │   ├── claims.js
│   │   ├── patients.js
│   │   └── insurers.js
│   ├── models/
│   │   ├── Claim.js
│   │   └── User.js
│   └── utils/
│       └── blockchain.js  # Motoko write and verification functions
│
├── blockchain/
│   ├── Claim.mo           # Motoko smart contract for claim storage
│   ├── types.mo           # Data structures and serialization logic
│   └── ledger.mo          # Ledger logic for transaction verification
│
└── README.md              # This documentation file

```


