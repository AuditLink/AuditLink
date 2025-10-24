# AuditLink: The Virtual Auditor for Health Insurance Integrity

## Abstract

AuditLink is an AI-powered 3rd party virtual auditor that verifies the integrity of health records shared between patients, clinics and insurance companies. 

By combining Caffeine.ai, for the conversational front-end interaction with the insurance company, and Dreamscape, for the blockchain-backed verification structure, AuditLink streamlines the approval and fraud detection process for health insurance claims. 

Blockchain is used to confirm the authenticity and origins of each submitted record. The AI front-end automates verification, flags anomalies for manual review by third party auditors, and approves verified records instantly. This ensures the streamlining of a faster, fairer and fraud-free insurance workflow. 

## Introduction



## Problem Statement



## Methods

Architecture Summary: 
**Patient UI → Backend → Blockchain**

1. **Patient UI (Caffeine Front End)**
   - Displays conversational form for claim submission.
   - Uses dropdowns for **provider** and **procedure** selection.
   - Sends claim data to backend via `/api/claim/propose`.

2. **AudiLink REST API (Backend)**
   - Validates provider and procedure codes.
   - Hashes claim data and writes to the blockchain.
   - Stores and returns claim status to the UI.

3. **Dreamspace Blockchain**
   - Receives and stores immutable claim records.
   - Provides verification status for `/api/claim/status`.


## Results and Evaluation



## Research Relevance and Future Directions


