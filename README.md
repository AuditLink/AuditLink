# AuditLink: The Virtual Auditor for Health Insurance Integrity

## Abstract

**AudiLink** is an AI-powered blockchain auditor that streamlines the end-to-end health insurance claim process between **patients**, **healthcare providers**, and **insurers**.  
It integrates **NHS datasets**, **Dreamspace blockchain verification**, and a **Caffeine.ai-generated conversational interface** to ensure data integrity, fraud detection, and real-time claim transparency.

## Introduction



## Problem Statement


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

### 🏥 NHS Provider Directory

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


