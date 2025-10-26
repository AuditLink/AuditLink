import { useState } from 'react';
import { useSaveCallerUserProfile } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { UserRole } from '../backend';
import { Shield, User, Building2, Heart, AlertCircle, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';

export type AppRole = 'patient' | 'provider' | 'insurer';

export default function ProfileSetup() {
  const [name, setName] = useState('');
  const [appRole, setAppRole] = useState<AppRole>('patient');
  const saveProfile = useSaveCallerUserProfile();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Please enter your name');
      return;
    }

    if (name.trim().length < 2) {
      toast.error('Name must be at least 2 characters long');
      return;
    }

    if (name.trim().length > 50) {
      toast.error('Name must be less than 50 characters');
      return;
    }

    try {
      // Store role in name with a delimiter that we can parse later
      const profileName = `${name.trim()}|${appRole}`;
      
      await saveProfile.mutateAsync({
        name: profileName,
        role: UserRole.user,
      });
      
      toast.success('Profile created successfully! Redirecting to dashboard...');
      
      // Give time for the success message to show
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error: any) {
      console.error('Profile creation error:', error);
      
      let errorMessage = 'Failed to create profile. Please try again.';
      
      if (error.message) {
        if (error.message.includes('Actor not available')) {
          errorMessage = 'Connection to backend service failed. Please check your internet connection and try again.';
        } else if (error.message.includes('Unauthorized')) {
          errorMessage = 'Authentication error. Please sign out and sign back in.';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast.error(errorMessage);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Card className="w-full max-w-lg border-2 shadow-xl">
        <CardHeader className="text-center">
          <div className="mb-4 inline-flex items-center justify-center rounded-full bg-primary/10 p-4">
            <Shield className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-3xl">Welcome to AuditLink!</CardTitle>
          <CardDescription className="text-base">
            Let's set up your profile to get started with the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          {saveProfile.isError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Profile Creation Failed</AlertTitle>
              <AlertDescription>
                {saveProfile.error?.message || 'Failed to create profile. Please try again.'}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-base font-semibold">
                Your Name *
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12 text-base"
                disabled={saveProfile.isPending}
                maxLength={50}
                required
              />
              <p className="text-xs text-muted-foreground">
                This name will be displayed in your dashboard
              </p>
            </div>

            <div className="space-y-3">
              <Label className="text-base font-semibold">I am a... *</Label>
              <RadioGroup value={appRole} onValueChange={(v) => setAppRole(v as AppRole)} disabled={saveProfile.isPending}>
                <div className="space-y-3">
                  <label
                    htmlFor="patient"
                    className={`flex cursor-pointer items-center space-x-3 rounded-lg border-2 border-border p-4 transition-colors hover:border-primary hover:bg-accent ${
                      saveProfile.isPending ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <RadioGroupItem value="patient" id="patient" disabled={saveProfile.isPending} />
                    <div className="flex flex-1 items-center space-x-3">
                      <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-900/30">
                        <Heart className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <div className="font-semibold">Patient</div>
                        <div className="text-sm text-muted-foreground">
                          View and endorse claims submitted on your behalf
                        </div>
                      </div>
                    </div>
                  </label>

                  <label
                    htmlFor="provider"
                    className={`flex cursor-pointer items-center space-x-3 rounded-lg border-2 border-border p-4 transition-colors hover:border-primary hover:bg-accent ${
                      saveProfile.isPending ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <RadioGroupItem value="provider" id="provider" disabled={saveProfile.isPending} />
                    <div className="flex flex-1 items-center space-x-3">
                      <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
                        <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <div className="font-semibold">Healthcare Provider</div>
                        <div className="text-sm text-muted-foreground">
                          Submit and manage insurance claims
                        </div>
                      </div>
                    </div>
                  </label>

                  <label
                    htmlFor="insurer"
                    className={`flex cursor-pointer items-center space-x-3 rounded-lg border-2 border-border p-4 transition-colors hover:border-primary hover:bg-accent ${
                      saveProfile.isPending ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <RadioGroupItem value="insurer" id="insurer" disabled={saveProfile.isPending} />
                    <div className="flex flex-1 items-center space-x-3">
                      <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900/30">
                        <Building2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <div className="font-semibold">Insurance Company</div>
                        <div className="text-sm text-muted-foreground">
                          Review and approve insurance claims
                        </div>
                      </div>
                    </div>
                  </label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Button type="submit" size="lg" className="w-full text-base" disabled={saveProfile.isPending}>
                {saveProfile.isPending ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Creating Profile...
                  </>
                ) : (
                  'Continue to Dashboard'
                )}
              </Button>

              <Button 
                type="button" 
                variant="outline" 
                size="lg" 
                className="w-full text-base" 
                onClick={handleLogout}
                disabled={saveProfile.isPending}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Cancel and Sign Out
              </Button>
            </div>
          </form>

          <div className="mt-6 rounded-lg bg-muted p-4 text-sm">
            <p className="font-semibold mb-2">Note:</p>
            <p className="text-muted-foreground">
              Your role selection determines which features you'll have access to in the platform. 
              You can only have one role per account.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
