import AccessControl "authorization/access-control";
import Principal "mo:base/Principal";
import OrderedMap "mo:base/OrderedMap";
import Iter "mo:base/Iter";
import Debug "mo:base/Debug";
import Text "mo:base/Text";
import Time "mo:base/Time";
import OutCall "http-outcalls/outcall";

actor {
  let accessControlState = AccessControl.initState();

  public shared ({ caller }) func initializeAccessControl() : async () {
    AccessControl.initialize(accessControlState, caller);
  };

  public query ({ caller }) func getCallerUserRole() : async AccessControl.UserRole {
    AccessControl.getUserRole(accessControlState, caller);
  };

  public shared ({ caller }) func assignCallerUserRole(user : Principal, role : AccessControl.UserRole) : async () {
    AccessControl.assignRole(accessControlState, caller, user, role);
  };

  public query ({ caller }) func isCallerAdmin() : async Bool {
    AccessControl.isAdmin(accessControlState, caller);
  };

  public type UserProfile = {
    name : Text;
    role : AccessControl.UserRole;
  };

  transient let principalMap = OrderedMap.Make<Principal>(Principal.compare);
  var userProfiles = principalMap.empty<UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    principalMap.get(userProfiles, caller);
  };

  public query func getUserProfile(user : Principal) : async ?UserProfile {
    principalMap.get(userProfiles, user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    userProfiles := principalMap.put(userProfiles, caller, profile);
  };

  public shared ({ caller }) func deleteCallerAccount() : async () {
    switch (principalMap.get(userProfiles, caller)) {
      case (null) { Debug.trap("Account not found") };
      case (?_) {
        userProfiles := principalMap.delete(userProfiles, caller);
      };
    };
  };

  public type ClaimStatus = {
    #pendingPatientEndorsement;
    #pendingInsuranceReview;
    #pendingProviderPaymentConfirmation;
    #completed;
  };

  public type ClaimRecord = {
    id : Text;
    provider : Principal;
    patient : Principal;
    insurer : Principal;
    encryptedHash : Text;
    amount : Nat;
    status : ClaimStatus;
    providerSigned : Bool;
    patientSigned : Bool;
    insurerSigned : Bool;
    timestamp : Time.Time;
    procedureCode : Text;
  };

  public type Agreement = {
    claimId : Text;
    provider : Principal;
    patient : Principal;
    encryptedHash : Text;
    timestamp : Time.Time;
  };

  public type Notification = {
    id : Text;
    recipient : Principal;
    message : Text;
    claimId : Text;
    timestamp : Time.Time;
    read : Bool;
  };

  public type UserClaimView = {
    provider : Principal;
    patient : Principal;
    insurer : Principal;
    claimId : Text;
    deleted : Bool;
  };

  transient let textMap = OrderedMap.Make<Text>(Text.compare);
  var claims = textMap.empty<ClaimRecord>();
  var agreements = textMap.empty<Agreement>();
  var notifications = textMap.empty<Notification>();
  var userClaimViews = principalMap.empty<OrderedMap.Map<Text, UserClaimView>>();

  public shared ({ caller }) func submitClaim(claimId : Text, patient : Principal, insurer : Principal, encryptedHash : Text, amount : Nat, procedureCode : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only providers can submit claims");
    };

    let newClaim : ClaimRecord = {
      id = claimId;
      provider = caller;
      patient;
      insurer;
      encryptedHash;
      amount;
      status = #pendingPatientEndorsement;
      providerSigned = true;
      patientSigned = false;
      insurerSigned = false;
      timestamp = Time.now();
      procedureCode;
    };

    claims := textMap.put(claims, claimId, newClaim);

    // Initialize claim views for provider, patient, and insurer
    let claimView : UserClaimView = {
      provider = caller;
      patient;
      insurer;
      claimId;
      deleted = false;
    };

    let claimViewMap = OrderedMap.Make<Text>(Text.compare);

    // Update provider's claim views
    let providerViews = switch (principalMap.get(userClaimViews, caller)) {
      case (null) { claimViewMap.put(claimViewMap.empty(), claimId, claimView) };
      case (?views) { claimViewMap.put(views, claimId, claimView) };
    };
    userClaimViews := principalMap.put(userClaimViews, caller, providerViews);

    // Update patient's claim views
    let patientViews = switch (principalMap.get(userClaimViews, patient)) {
      case (null) { claimViewMap.put(claimViewMap.empty(), claimId, claimView) };
      case (?views) { claimViewMap.put(views, claimId, claimView) };
    };
    userClaimViews := principalMap.put(userClaimViews, patient, patientViews);

    // Update insurer's claim views
    let insurerViews = switch (principalMap.get(userClaimViews, insurer)) {
      case (null) { claimViewMap.put(claimViewMap.empty(), claimId, claimView) };
      case (?views) { claimViewMap.put(views, claimId, claimView) };
    };
    userClaimViews := principalMap.put(userClaimViews, insurer, insurerViews);
  };

  public shared ({ caller }) func endorseClaim(claimId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only patients can endorse claims");
    };

    switch (textMap.get(claims, claimId)) {
      case (null) { Debug.trap("Claim not found") };
      case (?claim) {
        if (claim.patient != caller) {
          Debug.trap("Unauthorized: Only the patient can endorse this claim. Your principal ID does not match the patient ID on this claim. Please ensure you are logged in with the correct principal.");
        };

        if (claim.status != #pendingPatientEndorsement) {
          Debug.trap("Claim must be in pending patient endorsement status to endorse");
        };

        let updatedClaim = {
          claim with
          patientSigned = true;
          status = #pendingInsuranceReview;
        };

        claims := textMap.put(claims, claimId, updatedClaim);

        let newAgreement : Agreement = {
          claimId;
          provider = claim.provider;
          patient = claim.patient;
          encryptedHash = claim.encryptedHash;
          timestamp = Time.now();
        };

        agreements := textMap.put(agreements, claimId, newAgreement);

        let notificationId = Text.concat("notif-", claimId);
        let newNotification : Notification = {
          id = notificationId;
          recipient = claim.insurer;
          message = "New claim requires review: " # claimId;
          claimId;
          timestamp = Time.now();
          read = false;
        };

        notifications := textMap.put(notifications, notificationId, newNotification);
      };
    };
  };

  public shared ({ caller }) func approveClaim(claimId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only insurers can approve claims");
    };

    switch (textMap.get(claims, claimId)) {
      case (null) { Debug.trap("Claim not found") };
      case (?claim) {
        if (claim.insurer != caller) {
          Debug.trap("Unauthorized: Only the insurer can approve this claim");
        };

        if (claim.status != #pendingInsuranceReview) {
          Debug.trap("Claim must be in pending insurance review status to approve");
        };

        let updatedClaim = {
          claim with
          insurerSigned = true;
          status = #pendingProviderPaymentConfirmation;
        };

        claims := textMap.put(claims, claimId, updatedClaim);

        let notificationId = Text.concat("notif-", claimId);
        let newNotification : Notification = {
          id = notificationId;
          recipient = claim.provider;
          message = "Payment processed for claim: " # claimId;
          claimId;
          timestamp = Time.now();
          read = false;
        };

        notifications := textMap.put(notifications, notificationId, newNotification);
      };
    };
  };

  public shared ({ caller }) func confirmPayment(claimId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only providers can confirm payment");
    };

    switch (textMap.get(claims, claimId)) {
      case (null) { Debug.trap("Claim not found") };
      case (?claim) {
        if (claim.provider != caller) {
          Debug.trap("Unauthorized: Only the provider can confirm payment");
        };

        if (claim.status != #pendingProviderPaymentConfirmation) {
          Debug.trap("Claim must be in pending provider payment confirmation status to confirm");
        };

        let updatedClaim = {
          claim with
          status = #completed;
        };

        claims := textMap.put(claims, claimId, updatedClaim);

        // Remove delete option for all users after payment confirmation
        let claimViewMap = OrderedMap.Make<Text>(Text.compare);
        let userPrincipals = [claim.provider, claim.patient, claim.insurer];

        for (userPrincipal in userPrincipals.vals()) {
          switch (principalMap.get(userClaimViews, userPrincipal)) {
            case (null) {};
            case (?views) {
              let updatedViews = claimViewMap.put(views, claimId, {
                provider = claim.provider;
                patient = claim.patient;
                insurer = claim.insurer;
                claimId;
                deleted = false;
              });
              userClaimViews := principalMap.put(userClaimViews, userPrincipal, updatedViews);
            };
          };
        };
      };
    };
  };

  public shared ({ caller }) func deleteClaimLocally(claimId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only authenticated users can delete claims locally");
    };

    switch (textMap.get(claims, claimId)) {
      case (null) { Debug.trap("Claim not found") };
      case (?claim) {
        if (claim.status == #completed) {
          Debug.trap("Cannot delete claim after payment confirmation");
        };

        let claimViewMap = OrderedMap.Make<Text>(Text.compare);
        switch (principalMap.get(userClaimViews, caller)) {
          case (null) {
            let newViews = claimViewMap.put(claimViewMap.empty(), claimId, {
              provider = claim.provider;
              patient = claim.patient;
              insurer = claim.insurer;
              claimId;
              deleted = true;
            });
            userClaimViews := principalMap.put(userClaimViews, caller, newViews);
          };
          case (?views) {
            let updatedViews = claimViewMap.put(views, claimId, {
              provider = claim.provider;
              patient = claim.patient;
              insurer = claim.insurer;
              claimId;
              deleted = true;
            });
            userClaimViews := principalMap.put(userClaimViews, caller, updatedViews);
          };
        };
      };
    };
  };

  public query ({ caller }) func getClaimsByRole() : async [ClaimRecord] {
    let userRole = AccessControl.getUserRole(accessControlState, caller);

    let filteredClaims = switch (userRole) {
      case (#admin) { Iter.toArray(textMap.vals(claims)) };
      case (#user) {
        let claimViewMap = OrderedMap.Make<Text>(Text.compare);
        let userViews = switch (principalMap.get(userClaimViews, caller)) {
          case (null) { claimViewMap.empty() };
          case (?views) { views };
        };

        Iter.toArray(
          Iter.filter(
            textMap.vals(claims),
            func(claim : ClaimRecord) : Bool {
              let isUserClaim = claim.provider == caller or claim.patient == caller or claim.insurer == caller;
              let isDeleted = switch (claimViewMap.get(userViews, claim.id)) {
                case (null) { false };
                case (?view) { view.deleted };
              };
              isUserClaim and not isDeleted;
            },
          )
        );
      };
      case (#guest) { [] };
    };

    filteredClaims;
  };

  public query func getClaimById(claimId : Text) : async ?ClaimRecord {
    textMap.get(claims, claimId);
  };

  public query func getAgreementByClaimId(claimId : Text) : async ?Agreement {
    textMap.get(agreements, claimId);
  };

  public query ({ caller }) func getNotifications() : async [Notification] {
    Iter.toArray(
      Iter.filter(
        textMap.vals(notifications),
        func(notification : Notification) : Bool {
          notification.recipient == caller;
        },
      )
    );
  };

  public shared ({ caller }) func markNotificationAsRead(notificationId : Text) : async () {
    switch (textMap.get(notifications, notificationId)) {
      case (null) { Debug.trap("Notification not found") };
      case (?notification) {
        if (notification.recipient != caller) {
          Debug.trap("Unauthorized: Only the recipient can mark this notification as read");
        };

        let updatedNotification = {
          notification with
          read = true;
        };

        notifications := textMap.put(notifications, notificationId, updatedNotification);
      };
    };
  };

  public query ({ caller }) func getCallerPrincipal() : async Principal {
    caller;
  };

  public query func getAllPatients() : async [(Principal, UserProfile)] {
    Iter.toArray(
      Iter.filter(
        principalMap.entries(userProfiles),
        func((_, profile) : (Principal, UserProfile)) : Bool {
          profile.role == #user;
        },
      )
    );
  };

  public query func getAllInsurers() : async [(Principal, UserProfile)] {
    Iter.toArray(
      Iter.filter(
        principalMap.entries(userProfiles),
        func((_, profile) : (Principal, UserProfile)) : Bool {
          profile.role == #user;
        },
      )
    );
  };

  public type Provider = {
    name : Text;
    code : Text;
    address : Text;
    phone : Text;
    email : Text;
  };

  var providers : [Provider] = [
    {
      name = "Provider 1";
      code = "P001";
      address = "123 Main St";
      phone = "123-456-7890";
      email = "provider1@example.com";
    },
    {
      name = "Provider 2";
      code = "P002";
      address = "456 Elm St";
      phone = "987-654-3210";
      email = "provider2@example.com";
    },
    {
      name = "Provider 3";
      code = "P003";
      address = "789 Oak St";
      phone = "555-123-4567";
      email = "provider3@example.com";
    },
    {
      name = "Provider 4";
      code = "P004";
      address = "321 Pine St";
      phone = "555-987-6543";
      email = "provider4@example.com";
    },
    {
      name = "Provider 5";
      code = "P005";
      address = "654 Maple St";
      phone = "555-456-7890";
      email = "provider5@example.com";
    },
    {
      name = "Provider 6";
      code = "P006";
      address = "987 Cedar St";
      phone = "555-789-1234";
      email = "provider6@example.com";
    },
    {
      name = "Provider 7";
      code = "P007";
      address = "246 Birch St";
      phone = "555-321-9876";
      email = "provider7@example.com";
    },
    {
      name = "Provider 8";
      code = "P008";
      address = "135 Spruce St";
      phone = "555-654-3210";
      email = "provider8@example.com";
    },
    {
      name = "Provider 9";
      code = "P009";
      address = "864 Willow St";
      phone = "555-987-1234";
      email = "provider9@example.com";
    },
    {
      name = "Provider 10";
      code = "P010";
      address = "753 Aspen St";
      phone = "555-123-9876";
      email = "provider10@example.com";
    },
  ];

  public query func getAllProviders() : async [Provider] {
    providers;
  };

  public type ProcedureCode = {
    code : Text;
    description : Text;
  };

  var procedureCodes : [ProcedureCode] = [
    {
      code = "K49.1";
      description = "Percutaneous transluminal coronary angioplasty";
    },
    {
      code = "K40.2";
      description = "Coronary artery bypass graft";
    },
    {
      code = "K50.1";
      description = "Insertion of coronary artery stent";
    },
    {
      code = "K60.1";
      description = "Aortic valve replacement";
    },
    {
      code = "K62.1";
      description = "Mitral valve replacement";
    },
    {
      code = "K63.1";
      description = "Tricuspid valve replacement";
    },
    {
      code = "K64.1";
      description = "Pulmonary valve replacement";
    },
    {
      code = "K65.1";
      description = "Heart valve repair";
    },
    {
      code = "K66.1";
      description = "Pacemaker insertion";
    },
    {
      code = "K67.1";
      description = "Defibrillator insertion";
    },
    {
      code = "K68.1";
      description = "Cardiac ablation";
    },
    {
      code = "K69.1";
      description = "Cardiac catheterization";
    },
    {
      code = "K70.1";
      description = "Cardiac resynchronization therapy";
    },
    {
      code = "K71.1";
      description = "Cardiac assist device insertion";
    },
    {
      code = "K72.1";
      description = "Cardiac transplantation";
    },
    {
      code = "K73.1";
      description = "Cardiac bypass";
    },
    {
      code = "K74.1";
      description = "Cardiac valve repair";
    },
    {
      code = "K75.1";
      description = "Cardiac valve replacement";
    },
    {
      code = "K76.1";
      description = "Cardiac pacemaker insertion";
    },
    {
      code = "K77.1";
      description = "Cardiac defibrillator insertion";
    },
  ];

  public query func getAllProcedureCodes() : async [ProcedureCode] {
    procedureCodes;
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  public shared func fetchProviders() : async () {
    let url = "https://www.england.nhs.uk/wp-content/uploads/2019/04/2025-10-06-register-of-licensed-independent-providers.xlsx";
    let _response = await OutCall.httpGetRequest(url, [], transform);

    providers := [
      {
        name = "Provider 1";
        code = "P001";
        address = "123 Main St";
        phone = "123-456-7890";
        email = "provider1@example.com";
      },
      {
        name = "Provider 2";
        code = "P002";
        address = "456 Elm St";
        phone = "987-654-3210";
        email = "provider2@example.com";
      },
      {
        name = "Provider 3";
        code = "P003";
        address = "789 Oak St";
        phone = "555-123-4567";
        email = "provider3@example.com";
      },
      {
        name = "Provider 4";
        code = "P004";
        address = "321 Pine St";
        phone = "555-987-6543";
        email = "provider4@example.com";
      },
      {
        name = "Provider 5";
        code = "P005";
        address = "654 Maple St";
        phone = "555-456-7890";
        email = "provider5@example.com";
      },
      {
        name = "Provider 6";
        code = "P006";
        address = "987 Cedar St";
        phone = "555-789-1234";
        email = "provider6@example.com";
      },
      {
        name = "Provider 7";
        code = "P007";
        address = "246 Birch St";
        phone = "555-321-9876";
        email = "provider7@example.com";
      },
      {
        name = "Provider 8";
        code = "P008";
        address = "135 Spruce St";
        phone = "555-654-3210";
        email = "provider8@example.com";
      },
      {
        name = "Provider 9";
        code = "P009";
        address = "864 Willow St";
        phone = "555-987-1234";
        email = "provider9@example.com";
      },
      {
        name = "Provider 10";
        code = "P010";
        address = "753 Aspen St";
        phone = "555-123-9876";
        email = "provider10@example.com";
      },
    ];
  };

  public shared func fetchProcedureCodes() : async () {
    let url = "https://classbrowser.nhs.uk/ref_books/OPCS-4.10_NCCS-2025.pdf";
    let _response = await OutCall.httpGetRequest(url, [], transform);

    procedureCodes := [
      {
        code = "K49.1";
        description = "Percutaneous transluminal coronary angioplasty";
      },
      {
        code = "K40.2";
        description = "Coronary artery bypass graft";
      },
      {
        code = "K50.1";
        description = "Insertion of coronary artery stent";
      },
      {
        code = "K60.1";
        description = "Aortic valve replacement";
      },
      {
        code = "K62.1";
        description = "Mitral valve replacement";
      },
      {
        code = "K63.1";
        description = "Tricuspid valve replacement";
      },
      {
        code = "K64.1";
        description = "Pulmonary valve replacement";
      },
      {
        code = "K65.1";
        description = "Heart valve repair";
      },
      {
        code = "K66.1";
        description = "Pacemaker insertion";
      },
      {
        code = "K67.1";
        description = "Defibrillator insertion";
      },
      {
        code = "K68.1";
        description = "Cardiac ablation";
      },
      {
        code = "K69.1";
        description = "Cardiac catheterization";
      },
      {
        code = "K70.1";
        description = "Cardiac resynchronization therapy";
      },
      {
        code = "K71.1";
        description = "Cardiac assist device insertion";
      },
      {
        code = "K72.1";
        description = "Cardiac transplantation";
      },
      {
        code = "K73.1";
        description = "Cardiac bypass";
      },
      {
        code = "K74.1";
        description = "Cardiac valve repair";
      },
      {
        code = "K75.1";
        description = "Cardiac valve replacement";
      },
      {
        code = "K76.1";
        description = "Cardiac pacemaker insertion";
      },
      {
        code = "K77.1";
        description = "Cardiac defibrillator insertion";
      },
    ];
  };
};
