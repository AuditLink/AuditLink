import { useActor } from './useActor';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserProfile, ClaimRecord, Provider, Agreement, Notification } from '../backend';
import { Principal } from '@icp-sdk/core/principal';
import { fetchNHSProviders, type NHSProvider } from '../lib/nhsProviderService';
import { fetchProcedureCodes, type ProcedureCode } from '../lib/procedureCodeService';

// Helper function to extract meaningful error messages
function getErrorMessage(error: any, defaultMessage: string): string {
  if (!error) return defaultMessage;
  
  if (typeof error === 'string') return error;
  
  if (error.message) {
    // Extract the actual error message from backend traps
    const message = error.message;
    
    // Check for common error patterns
    if (message.includes('Unauthorized')) {
      return message;
    }
    if (message.includes('not found')) {
      return message;
    }
    if (message.includes('principal')) {
      return message;
    }
    
    return message;
  }
  
  return defaultMessage;
}

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) {
        throw new Error('Backend connection not available. Please check your internet connection.');
      }
      
      try {
        const profile = await actor.getCallerUserProfile();
        console.log('User profile loaded successfully:', profile ? 'Profile exists' : 'No profile found');
        return profile;
      } catch (error: any) {
        console.error('Error fetching user profile:', error);
        throw new Error(getErrorMessage(error, 'Failed to load user profile. Please try refreshing the page.'));
      }
    },
    enabled: !!actor && !actorFetching,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
    staleTime: 30000, // Consider data fresh for 30 seconds
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) {
        throw new Error('Backend connection not available. Please check your internet connection and try again.');
      }
      
      try {
        console.log('Saving user profile...');
        await actor.saveCallerUserProfile(profile);
        console.log('User profile saved successfully');
      } catch (error: any) {
        console.error('Error saving user profile:', error);
        throw new Error(getErrorMessage(error, 'Failed to save profile. Please try again.'));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
    retry: 1,
    retryDelay: 1000,
  });
}

export function useDeleteCallerAccount() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) {
        throw new Error('Backend connection not available. Please check your internet connection and try again.');
      }
      
      try {
        console.log('Deleting user account...');
        await actor.deleteCallerAccount();
        console.log('User account deleted successfully');
      } catch (error: any) {
        console.error('Error deleting user account:', error);
        const errorMessage = getErrorMessage(error, 'Failed to delete account');
        
        if (errorMessage.includes('Account not found')) {
          throw new Error('Your account could not be found. It may have already been deleted.');
        }
        
        throw new Error(errorMessage);
      }
    },
    onSuccess: () => {
      // Clear all cached data including claims
      queryClient.removeQueries({ queryKey: ['claims'] });
      queryClient.removeQueries({ queryKey: ['notifications'] });
      queryClient.removeQueries({ queryKey: ['agreements'] });
      queryClient.clear();
    },
    retry: 1,
    retryDelay: 1000,
  });
}

export function useGetCallerPrincipal() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Principal | null>({
    queryKey: ['callerPrincipal'],
    queryFn: async () => {
      if (!actor) {
        console.warn('Actor not available for principal fetch');
        return null;
      }
      
      try {
        const principal = await actor.getCallerPrincipal();
        console.log('Principal ID loaded successfully');
        return principal;
      } catch (error: any) {
        console.error('Error fetching principal:', error);
        throw new Error(getErrorMessage(error, 'Failed to load your principal ID. Please refresh the page.'));
      }
    },
    enabled: !!actor && !actorFetching,
    retry: 2,
    retryDelay: 1000,
    staleTime: 60000, // Principal doesn't change, cache for 1 minute
  });
}

export function useGetAllPatients() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Array<[Principal, UserProfile]>>({
    queryKey: ['allPatients'],
    queryFn: async () => {
      if (!actor) {
        console.warn('Actor not available for patients fetch');
        return [];
      }
      
      try {
        const patients = await actor.getAllPatients();
        console.log(`Loaded ${patients.length} patients successfully`);
        return patients;
      } catch (error: any) {
        console.error('Error fetching patients:', error);
        throw new Error(getErrorMessage(error, 'Failed to load patients. Please refresh the page.'));
      }
    },
    enabled: !!actor && !actorFetching,
    retry: 2,
    retryDelay: 1000,
    staleTime: 30000, // Consider patients fresh for 30 seconds
  });
}

export function useGetAllInsurers() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Array<[Principal, UserProfile]>>({
    queryKey: ['allInsurers'],
    queryFn: async () => {
      if (!actor) {
        console.warn('Actor not available for insurers fetch');
        return [];
      }
      
      try {
        const insurers = await actor.getAllInsurers();
        console.log(`Loaded ${insurers.length} insurers successfully`);
        return insurers;
      } catch (error: any) {
        console.error('Error fetching insurers:', error);
        throw new Error(getErrorMessage(error, 'Failed to load insurers. Please refresh the page.'));
      }
    },
    enabled: !!actor && !actorFetching,
    retry: 2,
    retryDelay: 1000,
    staleTime: 30000, // Consider insurers fresh for 30 seconds
  });
}

/**
 * Fetches NHS providers from the client-side service
 * This always returns a static fallback list to ensure reliability
 */
export function useGetNHSProviders() {
  return useQuery<NHSProvider[]>({
    queryKey: ['nhsProviders'],
    queryFn: async () => {
      try {
        console.log('Fetching NHS providers from client-side service...');
        const providers = await fetchNHSProviders();
        console.log(`Loaded ${providers.length} NHS providers successfully`);
        return providers;
      } catch (error: any) {
        console.error('Error fetching NHS providers:', error);
        // Even on error, try to return the static list
        // This should never happen since fetchNHSProviders always returns the static list
        throw new Error(getErrorMessage(error, 'Failed to load NHS Provider Directory. Please try again.'));
      }
    },
    // Ensure the query runs immediately and doesn't get disabled
    enabled: true,
    // Retry on failure to ensure we get the data
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(500 * 2 ** attemptIndex, 2000),
    // Keep data fresh for a long time since it's static
    staleTime: 3600000, // 1 hour
    gcTime: 7200000, // 2 hours
    // Ensure we always have data by using initialData
    placeholderData: [],
  });
}

/**
 * Fetches NHS OPCS-4.10 procedure codes from the client-side service
 * This always returns a static fallback list to ensure reliability
 */
export function useGetProcedureCodes() {
  return useQuery<ProcedureCode[]>({
    queryKey: ['procedureCodes'],
    queryFn: async () => {
      try {
        console.log('Fetching NHS procedure codes from client-side service...');
        const procedureCodes = await fetchProcedureCodes();
        console.log(`Loaded ${procedureCodes.length} NHS procedure codes successfully`);
        return procedureCodes;
      } catch (error: any) {
        console.error('Error fetching NHS procedure codes:', error);
        throw new Error(getErrorMessage(error, 'Failed to load NHS Procedure Codes. Please try again.'));
      }
    },
    // Ensure the query runs immediately and doesn't get disabled
    enabled: true,
    // Retry on failure to ensure we get the data
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(500 * 2 ** attemptIndex, 2000),
    // Keep data fresh for a long time since it's static
    staleTime: 3600000, // 1 hour
    gcTime: 7200000, // 2 hours
    // Ensure we always have data by using initialData
    placeholderData: [],
  });
}

export function useGetAllProviders() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Provider[]>({
    queryKey: ['allProviders'],
    queryFn: async () => {
      if (!actor) {
        console.warn('Actor not available for providers fetch');
        return [];
      }
      
      try {
        const providers = await actor.getAllProviders();
        console.log(`Loaded ${providers.length} NHS providers successfully`);
        return providers;
      } catch (error: any) {
        console.error('Error fetching providers:', error);
        throw new Error(getErrorMessage(error, 'Failed to load NHS providers. Please refresh the page.'));
      }
    },
    enabled: !!actor && !actorFetching,
    retry: 2,
    retryDelay: 1000,
    staleTime: 300000, // Consider providers fresh for 5 minutes
  });
}

export function useFetchProviders() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) {
        throw new Error('Backend connection not available. Please check your internet connection.');
      }
      
      try {
        console.log('Fetching NHS providers from external source...');
        await actor.fetchProviders();
        console.log('NHS providers fetched successfully');
      } catch (error: any) {
        console.error('Error fetching providers:', error);
        throw new Error(getErrorMessage(error, 'Failed to fetch NHS providers. Please try again.'));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allProviders'] });
    },
    retry: 1,
    retryDelay: 2000,
  });
}

export function useGetClaimsByRole() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<ClaimRecord[]>({
    queryKey: ['claims'],
    queryFn: async () => {
      if (!actor) {
        console.warn('Actor not available for claims fetch');
        return [];
      }
      
      try {
        const claims = await actor.getClaimsByRole();
        console.log(`Loaded ${claims.length} claims successfully`);
        return claims;
      } catch (error: any) {
        console.error('Error fetching claims:', error);
        throw new Error(getErrorMessage(error, 'Failed to load claims. Please refresh the page.'));
      }
    },
    enabled: !!actor && !actorFetching,
    retry: 2,
    retryDelay: 1000,
    staleTime: 0, // Always consider stale to ensure fresh data
    refetchOnWindowFocus: true, // Refetch when window regains focus
    refetchOnMount: true, // Always refetch on mount
  });
}

export function useSubmitClaim() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      claimId,
      patient,
      insurer,
      encryptedHash,
      amount,
      procedureCode,
    }: {
      claimId: string;
      patient: Principal;
      insurer: Principal;
      encryptedHash: string;
      amount: bigint;
      procedureCode: string;
    }) => {
      if (!actor) {
        throw new Error('Backend connection not available. Please check your internet connection.');
      }
      
      try {
        console.log('Submitting claim:', claimId, 'for patient:', patient.toString());
        await actor.submitClaim(claimId, patient, insurer, encryptedHash, amount, procedureCode);
        console.log('Claim submitted successfully');
        
        // Add a small delay to ensure backend state is fully propagated
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (error: any) {
        console.error('Error submitting claim:', error);
        const errorMessage = getErrorMessage(error, 'Failed to submit claim');
        
        if (errorMessage.includes('Unauthorized')) {
          throw new Error('You do not have permission to submit claims. Please ensure you are logged in as a healthcare provider.');
        }
        
        throw new Error(errorMessage);
      }
    },
    onSuccess: async () => {
      console.log('Claim submission successful, invalidating and refetching claims cache...');
      
      // First, invalidate the cache to mark it as stale
      await queryClient.invalidateQueries({ queryKey: ['claims'] });
      
      // Then force an immediate refetch to ensure the new claim appears
      // Use a slight delay to ensure backend consistency
      await new Promise(resolve => setTimeout(resolve, 100));
      await queryClient.refetchQueries({ 
        queryKey: ['claims'], 
        type: 'active',
        exact: true 
      });
      
      console.log('Claims cache invalidated and refetched after submission');
    },
    retry: 1,
    retryDelay: 1000,
  });
}

export function useEndorseClaim() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (claimId: string) => {
      if (!actor) {
        throw new Error('Backend connection not available. Please check your internet connection.');
      }
      
      try {
        console.log('Endorsing claim:', claimId);
        await actor.endorseClaim(claimId);
        console.log('Claim endorsed successfully');
        
        // Add a small delay to ensure backend state is fully propagated
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (error: any) {
        console.error('Error endorsing claim:', error);
        const errorMessage = getErrorMessage(error, 'Failed to endorse claim');
        
        if (errorMessage.includes('principal ID does not match') || errorMessage.includes('principal')) {
          throw new Error('Principal ID Mismatch: This claim was not submitted for your principal ID. Please contact your healthcare provider to correct this issue.');
        }
        if (errorMessage.includes('Unauthorized')) {
          throw new Error('You do not have permission to endorse this claim. Please ensure you are logged in as a patient.');
        }
        if (errorMessage.includes('Claim not found')) {
          throw new Error('This claim could not be found. It may have been removed.');
        }
        if (errorMessage.includes('status')) {
          throw new Error('This claim cannot be endorsed at this time. It may have already been endorsed or is in a different state.');
        }
        
        throw new Error(errorMessage);
      }
    },
    onSuccess: async () => {
      console.log('Claim endorsement successful, invalidating and refetching caches...');
      
      // Invalidate all related caches
      await queryClient.invalidateQueries({ queryKey: ['claims'] });
      await queryClient.invalidateQueries({ queryKey: ['agreements'] });
      await queryClient.invalidateQueries({ queryKey: ['notifications'] });
      
      // Force refetch with a slight delay to ensure backend consistency
      await new Promise(resolve => setTimeout(resolve, 100));
      await queryClient.refetchQueries({ 
        queryKey: ['claims'], 
        type: 'active',
        exact: true 
      });
      
      console.log('Claims cache invalidated and refetched after endorsement');
    },
    retry: 1,
    retryDelay: 1000,
  });
}

export function useApproveClaim() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (claimId: string) => {
      if (!actor) {
        throw new Error('Backend connection not available. Please check your internet connection.');
      }
      
      try {
        console.log('Approving claim:', claimId);
        await actor.approveClaim(claimId);
        console.log('Claim approved successfully');
        
        // Add a small delay to ensure backend state is fully propagated
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (error: any) {
        console.error('Error approving claim:', error);
        const errorMessage = getErrorMessage(error, 'Failed to approve claim');
        
        if (errorMessage.includes('Unauthorized')) {
          throw new Error('You do not have permission to approve this claim. Please ensure you are logged in as an insurer.');
        }
        if (errorMessage.includes('Claim not found')) {
          throw new Error('This claim could not be found. It may have been removed.');
        }
        if (errorMessage.includes('endorsed')) {
          throw new Error('This claim must be endorsed by the patient before it can be approved.');
        }
        
        throw new Error(errorMessage);
      }
    },
    onSuccess: async () => {
      console.log('Claim approval successful, invalidating and refetching caches...');
      
      // Invalidate all related caches
      await queryClient.invalidateQueries({ queryKey: ['claims'] });
      await queryClient.invalidateQueries({ queryKey: ['notifications'] });
      
      // Force refetch with a slight delay to ensure backend consistency
      await new Promise(resolve => setTimeout(resolve, 100));
      await queryClient.refetchQueries({ 
        queryKey: ['claims'], 
        type: 'active',
        exact: true 
      });
      
      console.log('Claims cache invalidated and refetched after approval');
    },
    retry: 1,
    retryDelay: 1000,
  });
}

export function useConfirmPayment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (claimId: string) => {
      if (!actor) {
        throw new Error('Backend connection not available. Please check your internet connection.');
      }
      
      try {
        console.log('Confirming payment for claim:', claimId);
        await actor.confirmPayment(claimId);
        console.log('Payment confirmed successfully');
        
        // Add a small delay to ensure backend state is fully propagated
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (error: any) {
        console.error('Error confirming payment:', error);
        const errorMessage = getErrorMessage(error, 'Failed to confirm payment');
        
        if (errorMessage.includes('Unauthorized')) {
          throw new Error('You do not have permission to confirm payment for this claim.');
        }
        if (errorMessage.includes('Claim not found')) {
          throw new Error('This claim could not be found. It may have been removed.');
        }
        if (errorMessage.includes('status')) {
          throw new Error('This claim is not ready for payment confirmation.');
        }
        
        throw new Error(errorMessage);
      }
    },
    onSuccess: async () => {
      console.log('Payment confirmation successful, invalidating and refetching claims cache...');
      
      // Invalidate the cache
      await queryClient.invalidateQueries({ queryKey: ['claims'] });
      
      // Force refetch with a slight delay to ensure backend consistency
      await new Promise(resolve => setTimeout(resolve, 100));
      await queryClient.refetchQueries({ 
        queryKey: ['claims'], 
        type: 'active',
        exact: true 
      });
      
      console.log('Claims cache invalidated and refetched after payment confirmation');
    },
    retry: 1,
    retryDelay: 1000,
  });
}

export function useGetAgreementByClaimId(claimId: string | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Agreement | null>({
    queryKey: ['agreement', claimId],
    queryFn: async () => {
      if (!actor || !claimId) {
        return null;
      }
      
      try {
        const agreement = await actor.getAgreementByClaimId(claimId);
        console.log('Agreement loaded successfully for claim:', claimId);
        return agreement;
      } catch (error: any) {
        console.error('Error fetching agreement:', error);
        throw new Error(getErrorMessage(error, 'Failed to load agreement. Please refresh the page.'));
      }
    },
    enabled: !!actor && !actorFetching && !!claimId,
    retry: 2,
    retryDelay: 1000,
    staleTime: 30000,
  });
}

export function useGetNotifications() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: async () => {
      if (!actor) {
        console.warn('Actor not available for notifications fetch');
        return [];
      }
      
      try {
        const notifications = await actor.getNotifications();
        console.log(`Loaded ${notifications.length} notifications successfully`);
        return notifications;
      } catch (error: any) {
        console.error('Error fetching notifications:', error);
        throw new Error(getErrorMessage(error, 'Failed to load notifications. Please refresh the page.'));
      }
    },
    enabled: !!actor && !actorFetching,
    retry: 2,
    retryDelay: 1000,
    staleTime: 10000, // Consider notifications fresh for 10 seconds
    refetchInterval: 30000, // Refetch every 30 seconds for new notifications
  });
}

export function useMarkNotificationAsRead() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      if (!actor) {
        throw new Error('Backend connection not available. Please check your internet connection.');
      }
      
      try {
        console.log('Marking notification as read:', notificationId);
        await actor.markNotificationAsRead(notificationId);
        console.log('Notification marked as read successfully');
      } catch (error: any) {
        console.error('Error marking notification as read:', error);
        const errorMessage = getErrorMessage(error, 'Failed to mark notification as read');
        
        if (errorMessage.includes('Unauthorized')) {
          throw new Error('You do not have permission to mark this notification as read.');
        }
        if (errorMessage.includes('not found')) {
          throw new Error('This notification could not be found.');
        }
        
        throw new Error(errorMessage);
      }
    },
    onSuccess: (_, notificationId) => {
      // Optimistically update the UI
      queryClient.setQueryData<Notification[]>(['notifications'], (old) => {
        if (!old) return old;
        return old.map((notification) =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        );
      });
      // Then invalidate to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    retry: 1,
    retryDelay: 1000,
  });
}
