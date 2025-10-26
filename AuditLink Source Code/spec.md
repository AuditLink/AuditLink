# AuditLink - Decentralized Insurance Claim Processing DApp

## Overview
A decentralized insurance claim processing application that implements a multi-signature workflow requiring approval from three parties: patient, healthcare provider, and insurance company. The system stores only encrypted record hashes on-chain for privacy protection and generates blockchain-protected smart contract agreements between providers and patients.

## Authentication
- Uses Internet Identity for user authentication
- Three distinct user roles: Patient, Healthcare Provider, Insurance Company
- Each role has access to role-specific functionality and views
- Main dashboard container routes users to their appropriate role-specific dashboard after login and profile setup

## Core Workflow
The claim processing follows a strict multi-signature workflow with these phases:

### Phase 1: Claim Submission
- Healthcare providers submit insurance claims with medical details, treatment information, and claim amount
- Healthcare providers manually enter patient principal ID using a text input field
- Healthcare providers manually enter insurance company principal ID using a text input field
- Healthcare providers select their own provider information from an interactive, searchable, scrollable dropdown menu populated with NHS Provider Directory data
- Healthcare providers select a procedure code from an interactive, searchable, scrollable dropdown menu populated with NHS OPCS-4.10 procedure codes
- Healthcare providers manually enter the claim amount using a text input field with proper focus management
- The healthcare provider dropdown is user-friendly, searchable, scrollable, and displays relevant information (names, codes, IDs)
- The procedure code dropdown is user-friendly, searchable, scrollable, and displays procedure codes only (e.g., "K49.1")
- The provider dropdown supports smooth scrolling through long lists of NHS providers with clear visual cues for scrolling functionality
- The procedure code dropdown supports smooth scrolling through long lists of NHS procedure codes with clear visual cues for scrolling functionality
- Both dropdowns maintain accessibility standards with proper keyboard navigation and screen reader support
- The entered patient principal ID, insurance company principal ID, selected provider information, selected procedure code, and entered amount are correctly saved and associated with the claim in the backend
- Claims include encrypted record hashes stored on-chain
- Upon successful submission, a unique Claim ID is automatically generated and displayed to the healthcare provider
- The claim enters "Pending Patient Endorsement" status and is immediately routed to the intended patient's account based on the patient principal ID
- Each new claim submission (including second and subsequent claims) is properly associated with the correct patient principal ID in the backend with robust data persistence and immediate synchronization
- All claims submitted by healthcare providers are immediately visible and actionable in their intended patients' dashboards for endorsement with guaranteed real-time visibility
- The claim routing system ensures that multiple claims from the same healthcare provider are properly distributed to their respective patients with immediate UI updates and backend synchronization
- Backend implements comprehensive claim-to-patient linking with validation, error handling, data integrity checks, and immediate persistence
- Frontend implements real-time claim fetching with no caching issues, immediate UI updates, and guaranteed visibility of all new claims
- Claim submission process includes immediate backend validation, confirmation of successful patient association, and real-time synchronization with patient dashboards
- Multiple claims per patient are handled with robust data structures, indexing, immediate persistence, and guaranteed retrieval to ensure all claims are always visible and actionable
- Backend ensures immediate claim availability in patient dashboards upon submission with real-time data synchronization
- Frontend patient dashboard automatically refreshes and displays new claims without manual refresh or delay

### Phase 2: Patient Endorsement and Agreement Generation
- Patients can view all submitted claims that match their principal ID in "Pending Patient Endorsement" status in both "Recent Claims" and "My Claims" sections
- All pending claims immediately appear in the patient's dashboard regardless of submission order, timing, or quantity with guaranteed real-time visibility
- Patient dashboard implements comprehensive claim retrieval with immediate backend synchronization that guarantees visibility of all associated claims
- Frontend claim display logic handles multiple claims per patient with proper sorting, filtering, real-time updates, and immediate synchronization
- Both "Recent Claims" and "My Claims" sections display all pending claims for endorsement with consistent data and immediate updates
- Claims appear simultaneously in both sections upon submission with real-time backend-frontend synchronization
- Patients must endorse the claim to proceed with the workflow
- Upon patient endorsement, the system automatically generates and stores a blockchain-protected smart contract agreement between the healthcare provider and patient
- The agreement is securely stored on the Internet Computer blockchain with encrypted record hashes
- After endorsement and agreement generation, the claim status updates to "Pending Insurance Review"
- An automatic notification containing the Claim ID is sent to the insurance company
- The claim becomes visible to the insurance company for review and approval
- Endorsement workflow includes immediate UI updates and backend synchronization to reflect claim status changes

### Phase 3: Insurance Review and Payment
- Insurance companies receive notifications with Claim IDs for claims requiring review
- Insurance companies can access and review claims in "Pending Insurance Review" status
- Insurance companies verify coverage and can approve or reject claims
- Upon approval, insurance companies process payment for the claim
- After payment processing, the claim status updates to "Pending Provider Payment Confirmation"
- The healthcare provider is notified that payment has been processed

### Phase 4: Provider Payment Confirmation
- Healthcare providers can view claims in "Pending Provider Payment Confirmation" status
- Healthcare providers must confirm receipt of payment as the final step in the workflow
- Upon payment confirmation, the claim status updates to "Completed"
- All parties can view the completed claim with full workflow history

## Smart Contract Agreement System
- Blockchain-protected agreements are automatically generated upon patient endorsement
- Agreements contain encrypted references to the claim details, provider information, and patient consent
- Smart contract records are stored securely on the Internet Computer blockchain
- Agreements serve as immutable proof of patient-provider consent for the claim
- Agreement generation is transparent to users with status updates and confirmations

## Notification System
- Automatic notifications are sent to insurance companies when claims require review
- Notifications include Claim ID and relevant claim information
- Healthcare providers receive notifications when payment has been processed
- All parties receive status update notifications throughout the workflow
- Notification history is maintained for audit purposes
- Insurance companies can mark notifications as read, which immediately updates the UI and persists the read status in the backend
- "Mark as Read" functionality reliably updates notification status and provides immediate visual feedback

## NHS Provider Directory Integration
- Backend reliably fetches and parses the NHS Provider Directory Excel file from https://www.england.nhs.uk/wp-content/uploads/2019/04/2025-10-06-register-of-licensed-independent-providers.xlsx
- Provider data is processed and stored in the backend for dropdown population with comprehensive error handling and retry mechanisms
- Backend maintains a static fallback list of NHS providers that is always available when external fetch fails
- Provider dropdown displays relevant information including provider name, code, and other identifying details
- Provider data is refreshed periodically to maintain accuracy with fallback mechanisms
- Healthcare providers can search and select their organization from the NHS directory during claim submission
- Backend ensures the provider dropdown is populated on page load with clear loading states and error feedback
- Provider dropdown provides comprehensive user feedback including:
  - Loading indicators while fetching provider data
  - Clear error messages when fetch operations fail
  - Retry functionality that allows users to attempt reloading providers
  - Empty state messaging when no providers are available
  - Network connectivity error handling
- Robust error handling for network issues, file parsing errors, and data validation failures with specific error messages
- Clear user messaging when providers cannot be loaded with actionable retry options
- Fallback behavior ensures the application remains functional even when provider data is unavailable by using static fallback list
- Provider dropdown maintains stable state management and prevents unexpected behavior during loading and error states
- Retry mechanism is easily accessible and provides immediate feedback on retry attempts
- Provider dropdown always displays a scrollable, searchable list of NHS providers from either external fetch or static fallback
- Dropdown is never empty unless there is a true data loading error, in which case it shows clear error message and retry option
- Full accessibility support with keyboard navigation for all dropdown interactions

## NHS OPCS-4.10 Procedure Codes Integration
- Backend fetches and parses NHS OPCS-4.10 procedure codes from https://classbrowser.nhs.uk/ref_books/OPCS-4.10_NCCS-2025.pdf
- Procedure code data is processed and stored in the backend for dropdown population with comprehensive error handling and retry mechanisms
- Backend maintains a static fallback list of at least 20-30 real NHS procedure codes that is always available when external fetch fails
- Procedure code dropdown displays only the procedure code (e.g., "K49.1")
- Procedure code data is refreshed periodically to maintain accuracy with fallback mechanisms
- Healthcare providers can search and select procedure codes during claim submission
- Backend ensures the procedure code dropdown is populated on page load with clear loading states and error feedback
- Procedure code dropdown provides comprehensive user feedback including:
  - Loading indicators while fetching procedure code data
  - Clear error messages when fetch operations fail
  - Retry functionality that allows users to attempt reloading procedure codes
  - Empty state messaging when no procedure codes are available
  - Network connectivity error handling
- Robust error handling for network issues, file parsing errors, and data validation failures with specific error messages
- Clear user messaging when procedure codes cannot be loaded with actionable retry options
- Fallback behavior ensures the application remains functional even when procedure code data is unavailable by using static fallback list
- Procedure code dropdown maintains stable state management and prevents unexpected behavior during loading and error states
- Retry mechanism is easily accessible and provides immediate feedback on retry attempts
- Procedure code dropdown always displays a scrollable, searchable list of NHS procedure codes from either external fetch or static fallback
- Dropdown is never empty unless there is a true data loading error, in which case it shows clear error message and retry option
- Full accessibility support with keyboard navigation for all dropdown interactions

## Role-Specific Dashboards

### Healthcare Provider Dashboard
Features and actions exclusive to healthcare providers:
- Submit new insurance claims with text input fields for patient principal ID and insurance company principal ID
- Interactive, searchable, scrollable dropdown menu for NHS provider selection that reliably loads provider data on page load
- Interactive, searchable, scrollable dropdown menu for NHS OPCS-4.10 procedure code selection that reliably loads procedure code data on page load
- Provider dropdown with comprehensive state management including:
  - Loading indicators during data fetch operations
  - Clear error states with specific error messages
  - Retry buttons for failed fetch attempts
  - User-friendly feedback when no providers are available
  - Stable dropdown behavior during loading and error conditions
  - Smooth scrolling functionality for browsing through long lists of NHS providers
  - Clear visual indicators for scrollable content with accessibility support
  - Proper keyboard navigation for scrolling and selection
  - Always displays providers from either external fetch or static fallback list
  - Never appears empty unless true data loading error occurs
  - Full accessibility compliance with keyboard navigation support
- Procedure code dropdown with comprehensive state management including:
  - Loading indicators during data fetch operations
  - Clear error states with specific error messages
  - Retry buttons for failed fetch attempts
  - User-friendly feedback when no procedure codes are available
  - Stable dropdown behavior during loading and error conditions
  - Smooth scrolling functionality for browsing through long lists of NHS procedure codes
  - Clear visual indicators for scrollable content with accessibility support
  - Proper keyboard navigation for scrolling and selection
  - Always displays procedure codes from either external fetch or static fallback list
  - Never appears empty unless true data loading error occurs
  - Full accessibility compliance with keyboard navigation support
- Robust provider data fetching with automatic retry mechanisms and user-friendly error messages
- Robust procedure code data fetching with automatic retry mechanisms and user-friendly error messages
- Claim submission form with stable modal/form visibility that opens and closes only when intended by user actions
- Submit New Claim window maintains stable visibility without unexpected pop-up or pop-down behavior, flickering, or auto-closing
- Modal or form state management ensures predictable opening and closing behavior with no unintended visibility changes
- Claim submission UI logic provides smooth, stable user experience with reliable form state control
- Text input fields for patient principal ID, insurance company principal ID, and claim amount with clear labeling, validation, and smooth typing experience
- User-friendly error messages for invalid selections and entries, including provider dropdown and procedure code dropdown issues
- View submitted claims with current status including "Pending Patient Endorsement", "Pending Insurance Review", "Pending Provider Payment Confirmation", and "Completed"
- Display generated Claim IDs for all submitted claims
- Receive notifications when insurance payment has been processed
- Confirm receipt of payment for claims in "Pending Provider Payment Confirmation" status
- Track their claim history and payment status with detailed workflow progression
- Access provider-specific claim management tools
- Submit New Claim button on the All Claims page has appropriate width that matches the design and is not too wide
- Reliable "Sign Out" functionality that always redirects to the login page when clicked

### Patient Dashboard
Features and actions exclusive to patients:
- Display current user's principal ID prominently for reference
- View all claims where the patient ID matches their principal ID in both "Recent Claims" and "My Claims" sections, including multiple claims from the same healthcare provider
- All pending claims immediately appear in both "Recent Claims" and "My Claims" sections regardless of submission order, timing, or quantity with guaranteed real-time visibility
- Patient dashboard implements robust claim retrieval with comprehensive backend queries and immediate synchronization that fetch all associated claims
- Frontend claim display handles multiple claims per patient with proper data management, real-time updates, immediate synchronization, and no caching issues
- Claim fetching logic includes validation, error handling, and immediate backend-frontend synchronization to ensure no claims are missed or filtered out incorrectly
- Patient dashboard refreshes claim data automatically with real-time updates and provides manual refresh options for immediate synchronization
- Multiple claims from the same provider are displayed distinctly in both sections with clear identification and separate endorsement actions
- Both "Recent Claims" and "My Claims" sections maintain consistent data with immediate updates upon new claim submissions
- Real-time synchronization ensures claims appear simultaneously in both sections without delay or manual refresh
- View claim details including procedure code for all associated claims
- Visual warning indicator when logged-in principal ID does not match patient ID on claims requiring endorsement
- Clear guidance messaging to prevent principal ID mismatches
- Endorse claims in "Pending Patient Endorsement" status submitted by their healthcare providers with matching principal ID from both "Recent Claims" and "My Claims" sections
- Endorsement workflow handles multiple claims independently with separate confirmation and status tracking
- View confirmation when smart contract agreement is generated upon endorsement for each individual claim
- Track their personal claim progress through all workflow stages: "Pending Patient Endorsement", "Pending Insurance Review", "Pending Provider Payment Confirmation", and "Completed"
- View blockchain-protected agreement records for endorsed claims
- Access patient-specific claim tracking interface with detailed status updates for all associated claims
- Reliable "Sign Out" functionality that always redirects to the login page when clicked

### Insurance Company Dashboard
Features and actions exclusive to insurance companies:
- Display current user's principal ID prominently at the top with copy-to-clipboard functionality and clear labeling, matching the "Your Principal ID" section on the patient dashboard
- Always accessible "Sign Out" option in the top right menu that is visible, functional, and reliably redirects to the login page at all times
- Receive automatic notifications with Claim IDs for claims requiring review
- "Mark as Read" button for notifications that reliably marks notifications as read and immediately updates the UI
- Review claims in "Pending Insurance Review" status that have been endorsed by patients
- View claim details including procedure code for claims under review
- Access blockchain-protected smart contract agreements between providers and patients
- Verify coverage and approve or reject claims based on policy requirements
- Process payment for approved claims
- View claim details and encrypted record hashes for claims under review
- Track processed claims and payment history with detailed workflow status
- Access insurer-specific claim review and approval tools
- Reliable "Sign Out" functionality that always redirects to the login page when clicked

## Dashboard Routing
- After successful authentication and profile setup, users are automatically routed to their role-specific dashboard
- Each dashboard displays only the features, data, and actions relevant to that user's role
- Cross-role functionality is restricted to maintain clear separation of concerns

## User Account Management
- All user roles have access to a "My Profile" dropdown menu in the top right corner
- The dropdown menu includes a "Delete Account" option positioned under the "Sign Out" option
- When "Delete Account" is selected, a confirmation dialog appears explaining that deleting their account will remove their user data and claims association from AuditLink
- Upon confirmation, the backend deletes the user's account and all associated data
- Additionally, all recent claims are deleted from the frontend state to ensure complete data removal
- After successful account deletion, the user is automatically logged out and redirected to the login page
- The delete account functionality is available for all user roles (provider, patient, insurer) and is clearly labeled in English
- All user roles have reliable "Sign Out" functionality that consistently redirects to the login page
- Confirmation dialog and user feedback messages reflect the "Delete Account" action and its consequences, including removal of both backend data and frontend claim state

## Enhanced Error Handling and Recovery
- Comprehensive error boundary implementation in App.tsx, Dashboard.tsx, and all dashboard components to prevent blank or black screens
- Detailed error messages that clearly explain what went wrong (authentication failure, profile mismatch, backend connectivity issues, session expiration)
- User-friendly error displays with specific error codes, timestamps, and actionable recovery steps
- Retry buttons for failed operations with clear status feedback and loading indicators
- Automatic redirect to login page when authentication issues are detected
- Fallback navigation options when primary dashboard routing fails
- Progressive error handling that shows partial functionality when possible rather than complete failure
- Clear instructions for users on how to resolve common issues (refresh page, re-login, check network connection)
- Graceful degradation when specific features fail to load, maintaining core functionality
- Error logging with user consent for debugging purposes while protecting privacy
- Contact information and support guidance for persistent technical issues
- Session validation with automatic re-authentication prompts when sessions expire
- Network connectivity detection with appropriate user messaging
- Profile validation with clear steps to resolve profile setup issues
- Loading states with progress indicators and timeout handling
- Recovery mechanisms that preserve user context and data when possible

## Principal ID Management
- Healthcare providers manually enter patient principal ID using text input fields
- Healthcare providers manually enter insurance company principal ID using text input fields
- Healthcare providers select their provider organization from NHS Provider Directory scrollable dropdown
- Healthcare providers select procedure code from NHS OPCS-4.10 procedure codes scrollable dropdown
- Healthcare providers manually enter claim amount using text input fields with stable focus behavior
- The provider dropdown is searchable, scrollable, and displays relevant provider information for easy identification
- The procedure code dropdown is searchable, scrollable, and displays procedure codes for easy identification
- Patient principal ID, insurance company principal ID, provider information, procedure code, and amount are correctly saved and associated with claims in the backend with robust validation and immediate persistence
- Each claim submission correctly associates the patient principal ID with the claim for proper routing with comprehensive error checking and immediate synchronization
- Patient dashboard displays current user's principal ID for verification
- Insurance company dashboard displays current user's principal ID prominently at the top with copy-to-clipboard functionality
- Patients can see and endorse all claims where the patient ID matches their principal ID with guaranteed real-time visibility in both "Recent Claims" and "My Claims" sections
- Visual indicators warn patients when principal ID mismatches occur
- Claim endorsement flow includes principal ID validation to prevent mismatches
- All claim-related actions display the user's current principal ID for transparency

## Backend Data Storage
The backend stores:
- Claim records with encrypted hashes (not actual medical data)
- Unique Claim IDs generated for each submitted claim
- Patient principal ID associations with claims (correctly saved from healthcare provider input, properly routed with robust validation, and immediately synchronized)
- Insurance company principal ID associations with claims (correctly saved from healthcare provider input)
- NHS Provider Directory data parsed from Excel file with robust error handling, validation, and retry mechanisms
- NHS OPCS-4.10 procedure codes data parsed from PDF file with robust error handling, validation, and retry mechanisms
- Static fallback list of NHS providers for reliable dropdown population when external fetch fails
- Static fallback list of at least 20-30 real NHS procedure codes for reliable dropdown population when external fetch fails
- Healthcare provider organization information from NHS directory
- Procedure code information from NHS OPCS-4.10 directory (correctly saved from healthcare provider input)
- Claim amounts (correctly saved from healthcare provider input)
- Blockchain-protected smart contract agreements between providers and patients
- Multi-signature approval status for each claim with detailed workflow tracking
- Claim status progression: "Pending Patient Endorsement", "Pending Insurance Review", "Pending Provider Payment Confirmation", "Completed"
- Notification records and delivery status with read/unread status for insurance companies
- User role assignments and permissions
- User account data for all roles
- Claim workflow state and history with timestamps
- Payment processing records and confirmation status
- Comprehensive claim-to-patient routing data with robust indexing, validation, immediate persistence, and real-time synchronization to ensure all claims appear in the correct patient's dashboard
- Multiple claims per patient handling with proper data structures, validation, integrity checks, immediate persistence, and guaranteed real-time availability
- Claim association validation and error handling to prevent data loss, incorrect routing, or synchronization delays
- Backend implements comprehensive testing, validation, immediate persistence, and real-time synchronization for claim-patient associations with detailed logging
- Real-time data synchronization mechanisms that ensure immediate claim availability in patient dashboards upon submission
- Immediate backend-frontend synchronization protocols that guarantee claims appear in both "Recent Claims" and "My Claims" sections without delay

## Privacy and Security
- Only encrypted record hashes are stored on-chain
- Actual medical data and sensitive information remain off-chain
- Smart contract agreements are blockchain-protected on the Internet Computer
- Multi-signature requirement ensures no single party can process claims unilaterally
- Role-based access control restricts data visibility to relevant parties
- Principal ID validation prevents unauthorized claim endorsements
- Account deletion removes all user data and associated claims from both backend and frontend state
- Agreement generation and storage maintains privacy while ensuring immutability

## Claim Status Tracking
- Real-time status updates for all parties throughout the enhanced workflow
- Clear indication of required signatures, endorsements, and approvals at each stage
- Detailed workflow progression: "Pending Patient Endorsement" → "Pending Insurance Review" → "Pending Provider Payment Confirmation" → "Completed"
- Historical record of all claim activities and state changes with timestamps
- Notification system for pending actions and status updates
- Principal ID verification throughout the claim lifecycle
- Smart contract agreement tracking and verification
- Comprehensive claim routing with immediate synchronization ensures all pending claims appear in the intended patient's dashboard with guaranteed real-time visibility
- Multiple claims per patient are tracked independently with separate status progression, validation, and immediate synchronization
- Claim tracking includes robust error handling, validation, immediate persistence, and real-time synchronization to ensure no claims are lost, incorrectly routed, or delayed

## Comprehensive Testing and Validation
- Backend implements comprehensive unit tests for claim-patient association logic with immediate persistence and real-time synchronization
- Frontend implements integration tests for claim display and endorsement workflows with real-time updates
- End-to-end testing for multiple claims per patient scenarios with validation of proper routing, immediate visibility, and real-time synchronization
- Automated testing for claim submission, patient association, immediate synchronization, and dashboard display functionality
- Error handling tests for edge cases including network failures, data corruption, synchronization delays, and concurrent claim submissions
- Performance testing for multiple claims per patient with large datasets and real-time synchronization
- Validation testing for principal ID matching, claim routing accuracy, and immediate synchronization
- User acceptance testing for multiple claims workflows with comprehensive scenario coverage and real-time synchronization validation
- Regression testing to ensure fixes don't break existing functionality or synchronization
- Load testing for concurrent claim submissions, patient dashboard access, and real-time synchronization
- Data integrity testing for claim-patient associations with validation of backend storage, retrieval, and immediate synchronization
- Frontend state management testing to ensure no caching, filtering, or synchronization issues affect claim visibility
- Real-time synchronization testing to ensure claims appear immediately in both "Recent Claims" and "My Claims" sections

## Application Branding
- All user interface elements, headers, titles, and branding display "AuditLink" as the application name
- Consistent branding throughout all dashboards, forms, and user-facing components
- Application title and navigation elements reflect the AuditLink brand identity

## Application Language
- All user interface content and messaging is displayed in English

## Application Re-initialization
- The application should be re-initialized with a fresh state while preserving all existing functionality and workflows
- All backend data should be cleared and reset to initial state
- All frontend state should be cleared and reset to initial state
- User accounts, claims, notifications, and all stored data should be removed
- NHS Provider Directory and OPCS-4.10 procedure codes should be re-fetched and re-populated
- All existing features, workflows, and user interfaces should remain exactly as specified
- The re-initialization process should not modify any existing functionality or logic
- After re-initialization, the application should function identically to the original specification
- All role-specific dashboards, authentication flows, and data management should work as originally designed
- The re-initialization should provide a clean slate for testing and demonstration purposes
