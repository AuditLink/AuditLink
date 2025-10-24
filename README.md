# AuditLink: The Virtual Auditor for Health Insurance Integrity

## Abstract

AuditLink is an AI-powered 3rd party virtual auditor that verifies the integrity of health records shared between patients, clinics and insurance companies. 

By combining Caffeine.ai, for the conversational front-end interaction with the insurance company, and Dreamscape, for the blockchain-backed verification structure, AuditLink streamlines the approval and fraud detection process for health insurance claims. 

Blockchain is used to confirm the authenticity and origins of each submitted record. The AI front-end automates verification, flags anomalies for manual review by third party auditors, and approves verified records instantly. This ensures the streamlining of a faster, fairer and fraud-free insurance workflow. 

## Introduction



## Problem Statement



## Methods

Architecture Summary: 

Patient UI (Caffeine Front End)
      ↓
AudiLink REST API (your backend)
 ├── /api/providers → local NHS provider dataset
 ├── /api/procedures → local OPCS-4.10 subset
 ├── /api/claim/propose → validate + blockchain write
 └── /api/claim/status → retrieve verification



## Results and Evaluation



## Research Relevance and Future Directions


