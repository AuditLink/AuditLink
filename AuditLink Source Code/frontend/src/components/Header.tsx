import { ExtendedUserProfile } from '../lib/profileUtils';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useDeleteCallerAccount } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Shield, User, LogOut, LayoutDashboard, FileText, History as HistoryIcon, Trash2, Loader2 } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface HeaderProps {
  userProfile: ExtendedUserProfile;
  activeTab: 'overview' | 'claims' | 'history';
  setActiveTab: (tab: 'overview' | 'claims' | 'history') => void;
}

export default function Header({ userProfile, activeTab, setActiveTab }: HeaderProps) {
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { theme, setTheme } = useTheme();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const deleteAccountMutation = useDeleteCallerAccount();

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      
      // Clear all cached data first
      queryClient.clear();
      
      // Sign out from Internet Identity
      await clear();
      
      // Force a page reload to ensure clean state and redirect to login
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      // Even if there's an error, force reload to ensure clean state
      window.location.href = '/';
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteAccountMutation.mutateAsync();
      toast.success('Account deleted successfully');
      
      // Clear all cached data
      queryClient.clear();
      
      // Log out and redirect to login page
      await clear();
      window.location.href = '/';
    } catch (error: any) {
      console.error('Delete account error:', error);
      toast.error(error.message || 'Failed to delete account. Please try again.');
    }
  };

  const getRoleLabel = () => {
    switch (userProfile.appRole) {
      case 'provider':
        return 'Healthcare Provider';
      case 'insurer':
        return 'Insurance Company';
      case 'patient':
        return 'Patient';
      default:
        return 'User';
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-lg">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">AuditLink</h1>
                <p className="text-xs text-muted-foreground">Blockchain Claims Platform</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden items-center space-x-1 md:flex">
              <Button
                variant={activeTab === 'overview' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('overview')}
                className="space-x-2"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Overview</span>
              </Button>
              <Button
                variant={activeTab === 'claims' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('claims')}
                className="space-x-2"
              >
                <FileText className="h-4 w-4" />
                <span>Claims</span>
              </Button>
              <Button
                variant={activeTab === 'history' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('history')}
                className="space-x-2"
              >
                <HistoryIcon className="h-4 w-4" />
                <span>History</span>
              </Button>
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="space-x-2" disabled={isLoggingOut}>
                    <User className="h-4 w-4" />
                    <span className="hidden md:inline">{userProfile.displayName}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{userProfile.displayName}</p>
                      <p className="text-xs text-muted-foreground">{getRoleLabel()}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => setShowDeleteDialog(true)} 
                    className="cursor-pointer text-destructive focus:text-destructive"
                    disabled={isLoggingOut}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Delete Account</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={handleLogout} 
                    className="cursor-pointer"
                    disabled={isLoggingOut}
                  >
                    {isLoggingOut ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        <span>Signing Out...</span>
                      </>
                    ) : (
                      <>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Sign Out</span>
                      </>
                    )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Mobile Navigation */}
          <nav className="flex items-center space-x-1 border-t border-border py-2 md:hidden">
            <Button
              variant={activeTab === 'overview' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('overview')}
              size="sm"
              className="flex-1"
            >
              <LayoutDashboard className="h-4 w-4" />
            </Button>
            <Button
              variant={activeTab === 'claims' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('claims')}
              size="sm"
              className="flex-1"
            >
              <FileText className="h-4 w-4" />
            </Button>
            <Button
              variant={activeTab === 'history' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('history')}
              size="sm"
              className="flex-1"
            >
              <HistoryIcon className="h-4 w-4" />
            </Button>
          </nav>
        </div>
      </header>

      {/* Delete Account Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Your Account?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                This action will permanently delete your account and remove all your data, claims associations, and recent claims from AuditLink.
              </p>
              <p className="font-semibold text-foreground">
                This action cannot be undone.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteAccountMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={deleteAccountMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteAccountMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Account
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
