import { UserProfile } from '../backend';

export type AppRole = 'patient' | 'provider' | 'insurer';

export interface ExtendedUserProfile {
  displayName: string;
  appRole: AppRole;
  originalProfile: UserProfile;
}

export function parseUserProfile(profile: UserProfile): ExtendedUserProfile {
  try {
    // Parse the name field which contains "DisplayName|role"
    const parts = profile.name.split('|');
    
    if (parts.length === 2) {
      const [displayName, role] = parts;
      
      // Validate the role
      const validRoles: AppRole[] = ['patient', 'provider', 'insurer'];
      const appRole: AppRole = validRoles.includes(role as AppRole) 
        ? (role as AppRole)
        : 'patient'; // default fallback
      
      return {
        displayName: displayName.trim() || 'User',
        appRole,
        originalProfile: profile,
      };
    }
    
    // Fallback for old profiles without role encoding
    return {
      displayName: profile.name.trim() || 'User',
      appRole: 'patient',
      originalProfile: profile,
    };
  } catch (error) {
    console.error('Error parsing user profile:', error);
    // Return a safe fallback
    return {
      displayName: 'User',
      appRole: 'patient',
      originalProfile: profile,
    };
  }
}
