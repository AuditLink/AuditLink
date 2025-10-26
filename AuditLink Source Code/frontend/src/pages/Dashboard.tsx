import { useState } from 'react';
import { UserProfile } from '../backend';
import { parseUserProfile, ExtendedUserProfile } from '../lib/profileUtils';
import Header from '../components/Header';
import ProviderDashboard from '../components/ProviderDashboard';
import PatientDashboard from '../components/PatientDashboard';
import InsurerDashboard from '../components/InsurerDashboard';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, RefreshCw, LogOut } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';

interface DashboardProps {
  userProfile: UserProfile;
}

function DashboardError({ 
  title, 
  description, 
  onRetry, 
  onLogout 
}: { 
  title: string; 
  description: string; 
  onRetry?: () => void;
  onLogout: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <Card className="w-full max-w-lg border-2 shadow-xl">
        <CardHeader className="text-center">
          <div className="mb-4 inline-flex items-center justify-center rounded-full bg-destructive/10 p-4">
            <AlertCircle className="h-10 w-10 text-destructive" />
          </div>
          <CardTitle className="text-2xl">{title}</CardTitle>
          <CardDescription className="text-base">{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {onRetry && (
            <Button onClick={onRetry} className="w-full" size="lg">
              <RefreshCw className="mr-2 h-4 w-4" />
              Reload Dashboard
            </Button>
          )}
          
          <Button onClick={onLogout} variant="outline" className="w-full" size="lg">
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>

          <div className="rounded-lg bg-muted p-4 text-sm">
            <p className="font-semibold mb-2">Troubleshooting:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Your profile may be corrupted or in an invalid format</li>
              <li>Try signing out and signing back in</li>
              <li>If the issue persists, you may need to recreate your profile</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Dashboard({ userProfile }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'claims' | 'history'>('overview');
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  
  const handleLogout = async () => {
    try {
      await clear();
      queryClient.clear();
      window.location.reload();
    } catch (error) {
      console.error('Logout error:', error);
      window.location.reload();
    }
  };

  // Parse user profile with error handling
  let extendedProfile: ExtendedUserProfile;
  
  try {
    extendedProfile = parseUserProfile(userProfile);
    
    // Validate that we got a valid profile
    if (!extendedProfile || !extendedProfile.displayName || !extendedProfile.appRole) {
      throw new Error('Invalid profile structure after parsing');
    }
  } catch (err) {
    console.error('Error parsing user profile:', err);
    return (
      <DashboardError
        title="Profile Parsing Error"
        description="We couldn't read your profile information correctly. Your profile data may be in an unexpected format."
        onRetry={() => window.location.reload()}
        onLogout={handleLogout}
      />
    );
  }

  // Render appropriate dashboard based on role with error boundary
  const renderDashboard = () => {
    try {
      switch (extendedProfile.appRole) {
        case 'provider':
          return <ProviderDashboard activeTab={activeTab} />;
        case 'insurer':
          return <InsurerDashboard activeTab={activeTab} />;
        case 'patient':
          return <PatientDashboard activeTab={activeTab} />;
        default:
          console.warn('Unknown role, defaulting to patient dashboard:', extendedProfile.appRole);
          return <PatientDashboard activeTab={activeTab} />;
      }
    } catch (err) {
      console.error('Error rendering dashboard:', err);
      return (
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive" className="max-w-2xl mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Dashboard Loading Error</AlertTitle>
            <AlertDescription>
              <p className="mb-4">
                Failed to load the dashboard content. This could be a temporary issue.
              </p>
              <div className="flex gap-2">
                <Button onClick={() => window.location.reload()} variant="outline" size="sm">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reload Page
                </Button>
                <Button onClick={handleLogout} variant="outline" size="sm">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header 
        userProfile={extendedProfile} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />
      
      <main className="container mx-auto px-4 py-8">
        {renderDashboard()}
      </main>

      <footer className="border-t border-border bg-card/50 py-6 backdrop-blur-sm">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            © 2025 Insurance Claims Platform. Built with <span className="text-red-500">♥</span> using{' '}
            <a
              href="https://caffeine.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
