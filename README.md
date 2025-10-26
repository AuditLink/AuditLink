# AuditLink: The Virtual Auditor for Health Insurance Integrity

## Abstract

**AudiLink** is an AI-powered blockchain auditor that streamlines the end-to-end health insurance claim process between **patients**, **healthcare providers**, and **insurers**.  
It integrates **NHS datasets**, **Dreamspace blockchain verification**, and a **Caffeine.ai-generated conversational interface** to ensure data integrity, fraud detection, and real-time claim transparency.

## Introduction

### Live Product: https://auditlink-srr.caffeine.xyz
### Video Demo: https://youtu.be/uER61TBhZEo

## Problem Statement: AudiLink — AI-Powered Blockchain Auditor for Healthcare Claims

### Vertical: Companions
*(AI-driven app supporting users in health and finance)*

Healthcare insurance claims remain one of the most inefficient and error-prone processes in modern health systems.  
Across the UK and globally, patients face slow reimbursements, insurers handle rising fraud risks, and providers struggle with administrative delays caused by missing, altered, or unverified data.  
Despite decades of digitization, the trust gap between these three stakeholders — patients, providers, and insurers — persists because data integrity and verification still rely on manual audits and fragmented systems.

**AudiLink** addresses this problem by serving as a **virtual auditing companion** that automates and secures the entire insurance claim lifecycle using **AI-driven conversational workflows (via Caffeine)** and **blockchain verification (via Dreamspace)**.

Through a guided Caffeine front end, patients and providers can collaboratively generate and submit claims conversationally, while Dreamspace’s blockchain layer validates every record’s integrity using multi-signature smart contracts and NHS-authoritative datasets.  
The result is a fully auditable, tamper-proof, and human-readable claim verification system — combining the accessibility of self-writing apps with the security of decentralized verification.

---

### How AudiLink Satisfies the Judging Pillars

| Criterion | Implementation in AudiLink |
|------------|----------------------------|
| **Problem Relevance & Impact** | Addresses inefficiency, fraud, and slow claim verification in healthcare — one of the most critical real-world pain points. Its integration of NHS data ensures direct applicability within the UK health system. |
| **Innovation & Creativity** | Reimagines claim processing as an AI-guided conversation, integrating blockchain signatures and smart contracts without user code. Combines Caffeine’s conversational creation with Dreamspace’s ledger for verifiable data trust. |
| **Complexity & Sophistication** | Multi-user (patient, provider, insurer) system using validation layers, NHS datasets, and blockchain signatures. Implements a three-phase architecture with backend smart-contract interactions. |
| **Functionality & Working Demo** | Fully functional prototype: patient submissions validated in real time, claim hashes recorded on Dreamspace, and verification results displayed through Caffeine’s conversational UI. |
| **UX & Design** | Built entirely in Caffeine, AudiLink uses a natural-language conversational interface — no code or technical knowledge required for users to navigate or file claims. |

---

### Integration with Dreamspace

AudiLink leverages **Dreamspace’s drag-and-drop blockchain builder** to connect its Caffeine-generated front end with a multi-signature smart-contract backend.

This integration enables:

- Immutable record-keeping for every claim event  
- Smart contract enforcement for patient–provider–insurer verification  
- Transparent auditability for healthcare regulators

With Dreamspace, AudiLink evolves from a prototype into a deployable decentralized application (DApp) capable of scaling across public or private healthcare systems.

---

### Why This Matters

AudiLink bridges the gap between AI usability and blockchain accountability.  
By transforming an opaque, paper-heavy process into an accessible, auditable, and fraud-resistant platform, it demonstrates how **self-writing apps built with Caffeine and Dreamspace** can reshape critical real-world workflows — beginning with healthcare finance.


## 🧩 Core Architecture

### 🎯 Objective
Automate and verify the health insurance claim lifecycle using:

- **Blockchain immutability** for data integrity  
- **Smart contract multi-signature validation** for transparency  
- **NHS provider and procedure verification** for authenticity  
- **Conversational AI interface** for usability  

---

## 🧱 System Components

| Layer | Technology | Role |
|-------|-------------|------|
| **Front End** | [Caffeine.ai](https://caffeine.ai/) (React + TypeScript) | Conversational claim submission, validation, and tracking |
| **Backend** | Node.js + Express | Validation logic, claim hashing, and Dreamspace API bridge |
| **Blockchain** | [Dreamspace Ledger](https://dreamspace.ai/) | Immutable claim storage and verification |
| **Data Sources** | NHS ODS Register + NHS OPCS-4.10 Reference | Provider and procedure validation |

---

## 🩺 Data Integration

### 🏥 Independent Health Provider Directory

**Source:**  
[https://www.england.nhs.uk/wp-content/uploads/2019/04/2025-10-06-register-of-licensed-independent-providers.xlsx](https://www.england.nhs.uk/wp-content/uploads/2019/04/2025-10-06-register-of-licensed-independent-providers.xlsx)

**Mapped Fields**

| NHS Column | Local Field |
|-------------|-------------|
| ODS Code | `id` |
| Organisation Name | `name` |
| Address Line 1 | `address` |
| Postcode | `postcode` |

**Endpoint**

```bash
GET /api/providers


## Results and Evaluation



## Research Relevance and Future Directions


