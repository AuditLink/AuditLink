import { useState, useCallback } from 'react';
import { useGetClaimsByRole, useSubmitClaim, useGetCallerPrincipal, useGetNHSProviders, useGetProcedureCodes, useConfirmPayment, useGetNotifications, useMarkNotificationAsRead } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ClaimStatus } from '../backend';
import { FileText, Plus, DollarSign, User, Building2, Clock, CheckCircle2, XCircle, AlertCircle, History as HistoryIcon, Info, RefreshCw, ChevronsUpDown, Check, Stethoscope, Bell } from 'lucide-react';
import { toast } from 'sonner';
import { Principal } from '@icp-sdk/core/principal';
import { cn } from '@/lib/utils';

interface ProviderDashboardProps {
  activeTab: 'overview' | 'claims' | 'history';
}

// Separate form component to prevent re-renders from parent
function ClaimSubmissionForm({ 
  onSuccess, 
  onCancel,
  isSubmitting 
}: { 
  onSuccess: () => void; 
  onCancel: () => void;
  isSubmitting: boolean;
}) {
  const submitClaim = useSubmitClaim();
  const { data: providers = [], isLoading: providersLoading, error: providersError, refetch: refetchProviders } = useGetNHSProviders();
  const { data: procedureCodes = [], isLoading: procedureCodesLoading, error: procedureCodesError, refetch: refetchProcedureCodes } = useGetProcedureCodes();

  const [patientPrincipalId, setPatientPrincipalId] = useState('');
  const [insurerPrincipalId, setInsurerPrincipalId] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [selectedProcedureCode, setSelectedProcedureCode] = useState<string>('');
  const [amount, setAmount] = useState('');

  const [providerOpen, setProviderOpen] = useState(false);
  const [procedureCodeOpen, setProcedureCodeOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    if (!patientPrincipalId.trim() || !insurerPrincipalId.trim() || !selectedProvider || !selectedProcedureCode || !amount) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate principal IDs
    let patientPrincipal: Principal;
    let insurerPrincipal: Principal;
    
    try {
      patientPrincipal = Principal.fromText(patientPrincipalId.trim());
    } catch (error) {
      toast.error('Invalid Patient Principal ID format');
      return;
    }

    try {
      insurerPrincipal = Principal.fromText(insurerPrincipalId.trim());
    } catch (error) {
      toast.error('Invalid Insurance Company Principal ID format');
      return;
    }

    try {
      const claimId = `claim-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const encryptedHash = `hash-${Date.now()}-${selectedProvider}-${selectedProcedureCode}`;

      await submitClaim.mutateAsync({
        claimId,
        patient: patientPrincipal,
        insurer: insurerPrincipal,
        encryptedHash,
        amount: BigInt(Math.round(parseFloat(amount) * 100)),
        procedureCode: selectedProcedureCode,
      });

      toast.success(`Claim ${claimId} submitted successfully! The patient will need to endorse it.`);
      
      // Reset form
      setPatientPrincipalId('');
      setInsurerPrincipalId('');
      setSelectedProvider('');
      setSelectedProcedureCode('');
      setAmount('');
      
      // Close dialog
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit claim');
      console.error('Submit claim error:', error);
    }
  };

  const handleAmountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
  }, []);

  const handleRefreshProviders = useCallback(() => {
    refetchProviders();
    toast.info('Refreshing provider list...');
  }, [refetchProviders]);

  const handleRefreshProcedureCodes = useCallback(() => {
    refetchProcedureCodes();
    toast.info('Refreshing procedure codes...');
  }, [refetchProcedureCodes]);

  const getProviderLabel = (code: string) => {
    const provider = providers.find((p) => p.code === code);
    return provider ? `${provider.name} (${provider.code})` : code;
  };

  const getProcedureCodeLabel = (code: string) => {
    const procedureCode = procedureCodes.find((pc) => pc.code === code);
    return procedureCode ? `${procedureCode.code} – ${procedureCode.description}` : code;
  };

  // Determine if we have providers available
  const hasProviders = providers && providers.length > 0;
  const isLoadingProviders = providersLoading && !hasProviders;

  // Determine if we have procedure codes available
  const hasProcedureCodes = procedureCodes && procedureCodes.length > 0;
  const isLoadingProcedureCodes = procedureCodesLoading && !hasProcedureCodes;

  return (
    <>
      <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <AlertDescription className="text-sm text-blue-800 dark:text-blue-200">
          <strong>Important:</strong> Enter the correct patient and insurer principal IDs. The patient principal ID must match the patient's logged-in identity.
        </AlertDescription>
      </Alert>

      {providersError && !hasProviders && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Provider Loading Error</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>Unable to load the NHS Provider Directory. Please try refreshing.</p>
            <Button onClick={handleRefreshProviders} variant="outline" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry Loading
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {procedureCodesError && !hasProcedureCodes && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Procedure Codes Loading Error</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>Unable to load the NHS Procedure Codes. Please try refreshing.</p>
            <Button onClick={handleRefreshProcedureCodes} variant="outline" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry Loading
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="patientPrincipalId">Patient Principal ID *</Label>
          <Input
            id="patientPrincipalId"
            type="text"
            placeholder="Enter patient principal ID"
            value={patientPrincipalId}
            onChange={(e) => setPatientPrincipalId(e.target.value)}
            disabled={submitClaim.isPending}
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Enter the principal ID of the patient for whom you are submitting this claim.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="insurerPrincipalId">Insurance Company Principal ID *</Label>
          <Input
            id="insurerPrincipalId"
            type="text"
            placeholder="Enter insurance company principal ID"
            value={insurerPrincipalId}
            onChange={(e) => setInsurerPrincipalId(e.target.value)}
            disabled={submitClaim.isPending}
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Enter the principal ID of the insurance company that will process this claim.
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="provider">Healthcare Provider (NHS) *</Label>
            {hasProviders && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRefreshProviders}
                disabled={providersLoading}
                className="h-auto py-1 px-2 text-xs"
              >
                <RefreshCw className={cn("mr-1 h-3 w-3", providersLoading && "animate-spin")} />
                Refresh
              </Button>
            )}
          </div>
          <Popover open={providerOpen} onOpenChange={setProviderOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={providerOpen}
                aria-label="Select healthcare provider"
                aria-describedby="provider-description"
                className="w-full justify-between font-normal"
                disabled={submitClaim.isPending || isLoadingProviders || !hasProviders}
              >
                {selectedProvider
                  ? getProviderLabel(selectedProvider)
                  : isLoadingProviders
                  ? "Loading NHS providers..."
                  : hasProviders
                  ? "Select provider..."
                  : "Loading providers..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
              <Command>
                <CommandInput 
                  placeholder="Search providers..." 
                  className="h-9"
                  aria-label="Search healthcare providers"
                />
                <CommandList>
                  <ScrollArea className="h-[300px]">
                    <CommandEmpty>
                      {isLoadingProviders ? (
                        <div className="flex items-center justify-center py-6">
                          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                        </div>
                      ) : providersError && !hasProviders ? (
                        <div className="py-6 text-center text-sm text-muted-foreground">
                          <p className="mb-2">Failed to load providers</p>
                          <Button onClick={handleRefreshProviders} variant="outline" size="sm">
                            <RefreshCw className="mr-2 h-3 w-3" />
                            Retry
                          </Button>
                        </div>
                      ) : !hasProviders ? (
                        <div className="py-6 text-center text-sm text-muted-foreground">
                          <p className="mb-2">No providers available</p>
                          <Button onClick={handleRefreshProviders} variant="outline" size="sm">
                            <RefreshCw className="mr-2 h-3 w-3" />
                            Load Providers
                          </Button>
                        </div>
                      ) : (
                        "No provider found."
                      )}
                    </CommandEmpty>
                    <CommandGroup>
                      {providers.map((provider) => (
                        <CommandItem
                          key={provider.code}
                          value={`${provider.name} ${provider.code}`}
                          onSelect={() => {
                            setSelectedProvider(provider.code);
                            setProviderOpen(false);
                          }}
                          className="cursor-pointer"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedProvider === provider.code ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <div className="flex flex-col">
                            <span className="font-medium">{provider.name}</span>
                            <span className="text-xs text-muted-foreground">Code: {provider.code}</span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </ScrollArea>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <p id="provider-description" className="text-xs text-muted-foreground">
            {isLoadingProviders 
              ? 'Loading NHS Provider Directory...'
              : hasProviders 
              ? `Select your healthcare provider organization from the NHS directory. ${providers.length} providers available. Use the search box to find your provider quickly.`
              : 'NHS Provider Directory is loading. Please wait...'}
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="procedureCode">Procedure Code (NHS OPCS-4.10) *</Label>
            {hasProcedureCodes && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRefreshProcedureCodes}
                disabled={procedureCodesLoading}
                className="h-auto py-1 px-2 text-xs"
              >
                <RefreshCw className={cn("mr-1 h-3 w-3", procedureCodesLoading && "animate-spin")} />
                Refresh
              </Button>
            )}
          </div>
          <Popover open={procedureCodeOpen} onOpenChange={setProcedureCodeOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={procedureCodeOpen}
                aria-label="Select procedure code"
                aria-describedby="procedure-code-description"
                className="w-full justify-between font-normal"
                disabled={submitClaim.isPending || isLoadingProcedureCodes || !hasProcedureCodes}
              >
                {selectedProcedureCode
                  ? getProcedureCodeLabel(selectedProcedureCode)
                  : isLoadingProcedureCodes
                  ? "Loading procedure codes..."
                  : hasProcedureCodes
                  ? "Select procedure code..."
                  : "Loading procedure codes..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
              <Command>
                <CommandInput 
                  placeholder="Search procedure codes..." 
                  className="h-9"
                  aria-label="Search procedure codes"
                />
                <CommandList>
                  <ScrollArea className="h-[300px]">
                    <CommandEmpty>
                      {isLoadingProcedureCodes ? (
                        <div className="flex items-center justify-center py-6">
                          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                        </div>
                      ) : procedureCodesError && !hasProcedureCodes ? (
                        <div className="py-6 text-center text-sm text-muted-foreground">
                          <p className="mb-2">Failed to load procedure codes</p>
                          <Button onClick={handleRefreshProcedureCodes} variant="outline" size="sm">
                            <RefreshCw className="mr-2 h-3 w-3" />
                            Retry
                          </Button>
                        </div>
                      ) : !hasProcedureCodes ? (
                        <div className="py-6 text-center text-sm text-muted-foreground">
                          <p className="mb-2">No procedure codes available</p>
                          <Button onClick={handleRefreshProcedureCodes} variant="outline" size="sm">
                            <RefreshCw className="mr-2 h-3 w-3" />
                            Load Procedure Codes
                          </Button>
                        </div>
                      ) : (
                        "No procedure code found."
                      )}
                    </CommandEmpty>
                    <CommandGroup>
                      {procedureCodes.map((procedureCode) => (
                        <CommandItem
                          key={procedureCode.code}
                          value={`${procedureCode.code} ${procedureCode.description}`}
                          onSelect={() => {
                            setSelectedProcedureCode(procedureCode.code);
                            setProcedureCodeOpen(false);
                          }}
                          className="cursor-pointer"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedProcedureCode === procedureCode.code ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <div className="flex flex-col">
                            <span className="font-medium">{procedureCode.code}</span>
                            <span className="text-xs text-muted-foreground">{procedureCode.description}</span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </ScrollArea>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <p id="procedure-code-description" className="text-xs text-muted-foreground">
            {isLoadingProcedureCodes 
              ? 'Loading NHS OPCS-4.10 Procedure Codes...'
              : hasProcedureCodes 
              ? `Select the procedure code for this claim. ${procedureCodes.length} procedure codes available. Use the search box to find the code quickly.`
              : 'NHS Procedure Codes are loading. Please wait...'}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Claim Amount (USD) *</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={handleAmountChange}
            disabled={submitClaim.isPending}
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={submitClaim.isPending}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitClaim.isPending || !hasProviders || !hasProcedureCodes}>
            {submitClaim.isPending ? 'Submitting...' : 'Submit Claim'}
          </Button>
        </div>
      </form>
    </>
  );
}

export default function ProviderDashboard({ activeTab }: ProviderDashboardProps) {
  const { data: claims = [], isLoading, error: claimsError, refetch } = useGetClaimsByRole();
  const { data: notifications = [] } = useGetNotifications();
  const confirmPayment = useConfirmPayment();
  const markAsRead = useMarkNotificationAsRead();

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const pendingEndorsement = claims.filter((c) => c.status === ClaimStatus.pendingPatientEndorsement);
  const pendingPaymentConfirmation = claims.filter((c) => c.status === ClaimStatus.pendingProviderPaymentConfirmation);
  const completedClaims = claims.filter((c) => c.status === ClaimStatus.completed);
  const unreadNotifications = notifications.filter((n) => !n.read);

  const handleFormSuccess = useCallback(() => {
    setIsDialogOpen(false);
  }, []);

  const handleFormCancel = useCallback(() => {
    setIsDialogOpen(false);
  }, []);

  const handleOpenDialog = useCallback(() => {
    setIsDialogOpen(true);
  }, []);

  const handleConfirmPayment = useCallback(async (claimId: string) => {
    try {
      await confirmPayment.mutateAsync(claimId);
      toast.success('Payment confirmed successfully! Claim is now complete.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to confirm payment');
      console.error('Confirm payment error:', error);
    }
  }, [confirmPayment]);

  const handleMarkNotificationAsRead = useCallback(async (notificationId: string) => {
    try {
      await markAsRead.mutateAsync(notificationId);
      toast.success('Notification marked as read');
    } catch (error: any) {
      toast.error(error.message || 'Failed to mark notification as read');
      console.error('Mark notification as read error:', error);
    }
  }, [markAsRead]);

  const getStatusBadge = (status: ClaimStatus) => {
    switch (status) {
      case ClaimStatus.pendingPatientEndorsement:
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30"><Clock className="mr-1 h-3 w-3" />Pending Patient Endorsement</Badge>;
      case ClaimStatus.pendingInsuranceReview:
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/30"><AlertCircle className="mr-1 h-3 w-3" />Pending Insurance Review</Badge>;
      case ClaimStatus.pendingProviderPaymentConfirmation:
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 dark:bg-purple-900/30"><DollarSign className="mr-1 h-3 w-3" />Pending Payment Confirmation</Badge>;
      case ClaimStatus.completed:
        return <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/30"><CheckCircle2 className="mr-1 h-3 w-3" />Completed</Badge>;
    }
  };

  // Error state
  if (claimsError) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Claims</AlertTitle>
          <AlertDescription>
            <p className="mb-4">{claimsError.message || 'Failed to load claims. Please try again.'}</p>
            <Button onClick={() => refetch()} variant="outline" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (activeTab === 'overview') {
    return (
      <div className="space-y-6">
        {/* Notifications */}
        {unreadNotifications.length > 0 && (
          <Card className="border-2 border-blue-200 dark:border-blue-900">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5 text-blue-600" />
                <span>Notifications</span>
                <Badge variant="secondary">{unreadNotifications.length}</Badge>
              </CardTitle>
              <CardDescription>New updates on your claims</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {unreadNotifications.map((notification) => (
                  <div key={notification.id} className="rounded-lg border bg-blue-50 dark:bg-blue-900/20 p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{notification.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(Number(notification.timestamp) / 1000000).toLocaleString()}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkNotificationAsRead(notification.id)}
                        disabled={markAsRead.isPending}
                        className="text-xs"
                      >
                        {markAsRead.isPending ? 'Marking...' : 'Mark as read'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Claims</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{claims.length}</div>
              <p className="text-xs text-muted-foreground">All submitted claims</p>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Endorsement</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingEndorsement.length}</div>
              <p className="text-xs text-muted-foreground">Awaiting patient</p>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Payment Confirmation</CardTitle>
              <DollarSign className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingPaymentConfirmation.length}</div>
              <p className="text-xs text-muted-foreground">Confirm receipt</p>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedClaims.length}</div>
              <p className="text-xs text-muted-foreground">Successfully processed</p>
            </CardContent>
          </Card>
        </div>

        {/* Pending Payment Confirmation */}
        {pendingPaymentConfirmation.length > 0 && (
          <Card className="border-2 border-purple-200 dark:border-purple-900">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-purple-600" />
                <span>Payment Received - Confirm Receipt</span>
              </CardTitle>
              <CardDescription>Confirm that you have received payment for these claims</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingPaymentConfirmation.map((claim) => (
                  <div key={claim.id} className="rounded-lg border-2 border-purple-200 bg-purple-50 p-4 dark:border-purple-900 dark:bg-purple-900/20">
                    <div className="mb-3 flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <p className="font-medium">{claim.id}</p>
                        <p className="text-sm text-muted-foreground">
                          Amount: ${(Number(claim.amount) / 100).toFixed(2)}
                        </p>
                        {claim.procedureCode && (
                          <p className="text-xs text-muted-foreground">
                            Procedure: {claim.procedureCode}
                          </p>
                        )}
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                          <CheckCircle2 className="h-3 w-3 text-green-600" />
                          <span>Insurance payment processed</span>
                        </div>
                      </div>
                      {getStatusBadge(claim.status)}
                    </div>
                    <Button
                      onClick={() => handleConfirmPayment(claim.id)}
                      disabled={confirmPayment.isPending}
                      className="w-full"
                    >
                      {confirmPayment.isPending ? 'Confirming...' : 'Confirm Payment Receipt'}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Submit new claims and manage existing ones</CardDescription>
          </CardHeader>
          <CardContent>
            <Button size="lg" className="w-full md:w-auto" onClick={handleOpenDialog}>
              <Plus className="mr-2 h-5 w-5" />
              Submit New Claim
            </Button>
          </CardContent>
        </Card>

        {/* Recent Claims */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle>Recent Claims</CardTitle>
            <CardDescription>Your latest submitted claims</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
            ) : claims.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <FileText className="mx-auto mb-2 h-12 w-12 opacity-50" />
                <p>No claims submitted yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {claims.slice(0, 5).map((claim) => (
                  <div key={claim.id} className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center space-x-2">
                        <p className="font-medium">{claim.id}</p>
                        {getStatusBadge(claim.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Amount: ${(Number(claim.amount) / 100).toFixed(2)}
                        {claim.procedureCode && ` • ${claim.procedureCode}`}
                      </p>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      {new Date(Number(claim.timestamp) / 1000000).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dialog for claim submission */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Submit Insurance Claim</DialogTitle>
              <DialogDescription>
                Enter the claim details. The patient must endorse the claim before the insurer can approve it.
              </DialogDescription>
            </DialogHeader>
            <ClaimSubmissionForm 
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
              isSubmitting={false}
            />
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  if (activeTab === 'claims') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">All Claims</h2>
            <p className="text-muted-foreground">Manage and track your submitted claims</p>
          </div>
          <Button onClick={handleOpenDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Submit New Claim
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : claims.length === 0 ? (
          <Card className="border-2">
            <CardContent className="py-12 text-center">
              <FileText className="mx-auto mb-4 h-16 w-16 text-muted-foreground opacity-50" />
              <h3 className="mb-2 text-lg font-semibold">No claims yet</h3>
              <p className="mb-4 text-muted-foreground">Submit your first insurance claim to get started</p>
              <Button onClick={handleOpenDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Submit Claim
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {claims.map((claim) => (
              <Card key={claim.id} className="border-2">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{claim.id}</CardTitle>
                      <CardDescription>
                        Submitted on {new Date(Number(claim.timestamp) / 1000000).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    {getStatusBadge(claim.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-sm">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Amount:</span>
                          <span>${(Number(claim.amount) / 100).toFixed(2)}</span>
                        </div>
                        {claim.procedureCode && (
                          <div className="flex items-start space-x-2 text-sm">
                            <Stethoscope className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <div className="flex-1">
                              <span className="font-medium">Procedure:</span>
                              <p className="text-muted-foreground">{claim.procedureCode}</p>
                            </div>
                          </div>
                        )}
                        <div className="flex items-center space-x-2 text-sm">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Patient:</span>
                          <span className="truncate text-xs font-mono">{claim.patient.toString().substring(0, 20)}...</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Insurer:</span>
                          <span className="truncate text-xs font-mono">{claim.insurer.toString().substring(0, 20)}...</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Signatures:</p>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center space-x-2">
                            {claim.providerSigned ? (
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            ) : (
                              <XCircle className="h-4 w-4 text-gray-400" />
                            )}
                            <span>Provider</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            {claim.patientSigned ? (
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            ) : (
                              <XCircle className="h-4 w-4 text-gray-400" />
                            )}
                            <span>Patient</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            {claim.insurerSigned ? (
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            ) : (
                              <XCircle className="h-4 w-4 text-gray-400" />
                            )}
                            <span>Insurer</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {claim.status === ClaimStatus.pendingProviderPaymentConfirmation && (
                      <Button
                        onClick={() => handleConfirmPayment(claim.id)}
                        disabled={confirmPayment.isPending}
                        className="w-full"
                      >
                        {confirmPayment.isPending ? 'Confirming...' : 'Confirm Payment Receipt'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Dialog for claim submission */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Submit Insurance Claim</DialogTitle>
              <DialogDescription>
                Enter the claim details. The patient must endorse the claim before the insurer can approve it.
              </DialogDescription>
            </DialogHeader>
            <ClaimSubmissionForm 
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
              isSubmitting={false}
            />
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Claim History</h2>
        <p className="text-muted-foreground">Complete history of all your claims</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      ) : claims.length === 0 ? (
        <Card className="border-2">
          <CardContent className="py-12 text-center">
            <HistoryIcon className="mx-auto mb-4 h-16 w-16 text-muted-foreground opacity-50" />
            <h3 className="mb-2 text-lg font-semibold">No history yet</h3>
            <p className="text-muted-foreground">Your claim history will appear here</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {claims.map((claim) => (
            <Card key={claim.id} className="border-2">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center space-x-2">
                      <p className="font-medium">{claim.id}</p>
                      {getStatusBadge(claim.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      ${(Number(claim.amount) / 100).toFixed(2)}
                      {claim.procedureCode && ` • ${claim.procedureCode}`}
                      {' • '}
                      {new Date(Number(claim.timestamp) / 1000000).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-1">
                    {claim.providerSigned && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                    {claim.patientSigned && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                    {claim.insurerSigned && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
