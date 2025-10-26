import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import LoginPage from './pages/LoginPage';
import ProfileSetup from './components/ProfileSetup';
import Dashboard from './pages/Dashboard';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, RefreshCw, LogOut, Shield } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

function ErrorScreen({ 
  title, 
  description, 
  error, 
  onRetry, 
  onLogout,
  showLogout = true 
}: { 
  title: string; 
  description: string; 
  error?: Error | null;
  onRetry?: () => void;
  onLogout?: () => void;
  showLogout?: boolean;
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
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error Details</AlertTitle>
              <AlertDescription className="text-sm font-mono break-all">
                {error.message || 'An unknown error occurred'}
              </AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            {onRetry && (
              <Button onClick={onRetry} className="w-full" size="lg">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            )}
            
            {showLogout && onLogout && (
              <Button onClick={onLogout} variant="outline" className="w-full" size="lg">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out and Return to Login
              </Button>
            )}
          </div>

          <div className="rounded-lg bg-muted p-4 text-sm">
            <p className="font-semibold mb-2">What you can try:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Check your internet connection</li>
              <li>Clear your browser cache and cookies</li>
              <li>Try signing out and signing back in</li>
              <li>If the problem persists, contact support</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function App() {
  const { identity, isInitializing, clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { 
    data: userProfile, 
    isLoading: profileLoading, 
    isFetched, 
    error: profileError,
    refetch: refetchProfile 
  } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  const handleLogout = async () => {
    try {
      await clear();
      queryClient.clear();
      window.location.reload();
    } catch (error) {
      console.error('Logout error:', error);
      // Force reload even if logout fails
      window.location.reload();
    }
  };

  const handleRetryProfile = () => {
    refetchProfile();
  };

  // Loading state - show spinner while initializing or loading profile
  if (isInitializing || (isAuthenticated && profileLoading && !profileError)) {
    return (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <div className="flex h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <div className="text-center">
            <div className="mb-4 inline-flex items-center justify-center rounded-full bg-primary/10 p-4">
              <Shield className="h-12 w-12 text-primary animate-pulse" />
            </div>
            <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="text-lg font-medium text-foreground">Loading your account...</p>
            <p className="text-sm text-muted-foreground mt-2">Please wait a moment</p>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  // Not authenticated - show login page
  if (!isAuthenticated) {
    return (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <LoginPage />
        <Toaster />
      </ThemeProvider>
    );
  }

  // Profile loading error - show detailed error with recovery options
  if (profileError) {
    console.error('Profile loading error:', profileError);
    return (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <ErrorScreen
          title="Unable to Load Profile"
          description="We encountered an issue loading your user profile. This could be due to a network problem or a temporary service issue."
          error={profileError}
          onRetry={handleRetryProfile}
          onLogout={handleLogout}
        />
        <Toaster />
      </ThemeProvider>
    );
  }

  // Show profile setup for new users (no profile exists)
  if (showProfileSetup) {
    return (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <ProfileSetup />
        <Toaster />
      </ThemeProvider>
    );
  }

  // User has profile - show dashboard
  if (userProfile) {
    return (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <Dashboard userProfile={userProfile} />
        <Toaster />
      </ThemeProvider>
    );
  }

  // Fallback for truly unexpected states (should rarely happen)
  // This handles edge cases where profile is undefined but not null and no error occurred
  console.error('Unexpected application state:', {
    isAuthenticated,
    profileLoading,
    isFetched,
    hasProfile: !!userProfile,
    hasError: !!profileError,
  });

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ErrorScreen
        title="Unexpected Application State"
        description="The application is in an unexpected state. This is unusual and may indicate a temporary issue with the service."
        onRetry={() => window.location.reload()}
        onLogout={handleLogout}
      />
      <Toaster />
    </ThemeProvider>
  );
}
