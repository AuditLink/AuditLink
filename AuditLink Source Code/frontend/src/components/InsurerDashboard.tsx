import { useState } from 'react';
import { useGetClaimsByRole, useApproveClaim, useGetCallerPrincipal, useGetNotifications, useMarkNotificationAsRead, useGetAgreementByClaimId } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ClaimStatus } from '../backend';
import { FileText, CheckCircle2, XCircle, Clock, AlertCircle, Building2, DollarSign, User, RefreshCw, Copy, Check, Bell, Shield, Stethoscope } from 'lucide-react';
import { toast } from 'sonner';

interface InsurerDashboardProps {
  activeTab: 'overview' | 'claims' | 'history';
}

export default function InsurerDashboard({ activeTab }: InsurerDashboardProps) {
  const { data: claims = [], isLoading, error: claimsError, refetch } = useGetClaimsByRole();
  const { data: callerPrincipal, error: principalError } = useGetCallerPrincipal();
  const { data: notifications = [] } = useGetNotifications();
  const approveClaim = useApproveClaim();
  const markAsRead = useMarkNotificationAsRead();
  const [copiedPrincipal, setCopiedPrincipal] = useState(false);
  const [selectedClaimForAgreement, setSelectedClaimForAgreement] = useState<string | null>(null);
  const { data: agreement } = useGetAgreementByClaimId(selectedClaimForAgreement);

  const pendingReview = claims.filter((c) => c.status === ClaimStatus.pendingInsuranceReview && !c.insurerSigned);
  const paymentProcessing = claims.filter((c) => c.status === ClaimStatus.pendingProviderPaymentConfirmation);
  const completedClaims = claims.filter((c) => c.status === ClaimStatus.completed);
  const unreadNotifications = notifications.filter((n) => !n.read);

  const copyPrincipalToClipboard = () => {
    if (callerPrincipal) {
      navigator.clipboard.writeText(callerPrincipal.toString());
      setCopiedPrincipal(true);
      setTimeout(() => setCopiedPrincipal(false), 2000);
      toast.success('Principal ID copied to clipboard');
    }
  };

  const handleApprove = async (claimId: string) => {
    try {
      await approveClaim.mutateAsync(claimId);
      toast.success('Claim approved and payment processed! Provider has been notified.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve claim');
      console.error('Approve claim error:', error);
    }
  };

  const handleMarkNotificationAsRead = async (notificationId: string) => {
    try {
      await markAsRead.mutateAsync(notificationId);
      toast.success('Notification marked as read');
    } catch (error: any) {
      toast.error(error.message || 'Failed to mark notification as read');
      console.error('Mark notification as read error:', error);
    }
  };

  const handleViewAgreement = (claimId: string) => {
    setSelectedClaimForAgreement(claimId);
  };

  const getStatusBadge = (status: ClaimStatus) => {
    switch (status) {
      case ClaimStatus.pendingPatientEndorsement:
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30"><Clock className="mr-1 h-3 w-3" />Pending Patient</Badge>;
      case ClaimStatus.pendingInsuranceReview:
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/30"><AlertCircle className="mr-1 h-3 w-3" />Awaiting Your Review</Badge>;
      case ClaimStatus.pendingProviderPaymentConfirmation:
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 dark:bg-purple-900/30"><DollarSign className="mr-1 h-3 w-3" />Payment Processing</Badge>;
      case ClaimStatus.completed:
        return <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/30"><CheckCircle2 className="mr-1 h-3 w-3" />Completed</Badge>;
    }
  };

  const PrincipalIDCard = () => (
    <Card className="border-2 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-lg">
          <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <span>Your Principal ID</span>
        </CardTitle>
        <CardDescription>Your unique insurance company identifier on the Internet Computer</CardDescription>
      </CardHeader>
      <CardContent>
        {principalError ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <p className="mb-2 text-sm">{principalError.message || 'Failed to load your principal ID'}</p>
              <Button onClick={() => window.location.reload()} variant="outline" size="sm">
                <RefreshCw className="mr-2 h-3 w-3" />
                Reload
              </Button>
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <div className="flex items-center space-x-2">
              <div className="flex-1 rounded-md bg-white dark:bg-gray-800 p-3 font-mono text-sm break-all border">
                {callerPrincipal ? callerPrincipal.toString() : 'Loading...'}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={copyPrincipalToClipboard}
                disabled={!callerPrincipal}
                className="shrink-0"
              >
                {copiedPrincipal ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              This is your unique identity on the Internet Computer. Healthcare providers use this ID to assign claims to your insurance company.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );

  // Error state
  if (claimsError) {
    return (
      <div className="space-y-6">
        <PrincipalIDCard />
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
        {/* Principal ID Card */}
        <PrincipalIDCard />

        {/* Notifications */}
        {unreadNotifications.length > 0 && (
          <Card className="border-2 border-blue-200 dark:border-blue-900">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5 text-blue-600" />
                <span>Notifications</span>
                <Badge variant="secondary">{unreadNotifications.length}</Badge>
              </CardTitle>
              <CardDescription>New claims requiring your review</CardDescription>
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
              <p className="text-xs text-muted-foreground">All claims</p>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <AlertCircle className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingReview.length}</div>
              <p className="text-xs text-muted-foreground">Requires approval</p>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Payment Processing</CardTitle>
              <DollarSign className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{paymentProcessing.length}</div>
              <p className="text-xs text-muted-foreground">Awaiting confirmation</p>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedClaims.length}</div>
              <p className="text-xs text-muted-foreground">Fully processed</p>
            </CardContent>
          </Card>
        </div>

        {/* Pending Review */}
        {pendingReview.length > 0 && (
          <Card className="border-2 border-blue-200 dark:border-blue-900">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-blue-600" />
                <span>Claims Awaiting Your Review</span>
              </CardTitle>
              <CardDescription>Review and approve these endorsed claims</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingReview.map((claim) => (
                  <div key={claim.id} className="rounded-lg border-2 border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-900/20">
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
                          <span>Provider & Patient endorsed</span>
                        </div>
                      </div>
                      {getStatusBadge(claim.status)}
                    </div>
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewAgreement(claim.id)}
                        className="w-full"
                      >
                        <Shield className="mr-2 h-3 w-3" />
                        View Agreement
                      </Button>
                      <Button
                        onClick={() => handleApprove(claim.id)}
                        disabled={approveClaim.isPending}
                        className="w-full"
                      >
                        {approveClaim.isPending ? 'Approving & Processing Payment...' : 'Approve & Process Payment'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Agreement Viewer */}
        {agreement && selectedClaimForAgreement && (
          <Card className="border-2 border-green-200 dark:border-green-900">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-green-600" />
                <span>Blockchain-Protected Agreement</span>
              </CardTitle>
              <CardDescription>Smart contract agreement between provider and patient</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                  <Shield className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-sm text-green-800 dark:text-green-200">
                    <p className="font-medium mb-2">Agreement Details:</p>
                    <ul className="space-y-1 text-xs">
                      <li>• Claim ID: {agreement.claimId}</li>
                      <li>• Provider: {agreement.provider.toString().substring(0, 40)}...</li>
                      <li>• Patient: {agreement.patient.toString().substring(0, 40)}...</li>
                      <li>• Created: {new Date(Number(agreement.timestamp) / 1000000).toLocaleString()}</li>
                      <li>• Status: Securely stored on Internet Computer blockchain</li>
                      <li>• Encrypted Hash: {agreement.encryptedHash.substring(0, 40)}...</li>
                    </ul>
                  </AlertDescription>
                </Alert>
                <p className="text-xs text-muted-foreground">
                  This agreement was automatically generated when the patient endorsed the claim. It serves as immutable proof of consent.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedClaimForAgreement(null)}
                  className="w-full"
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Claims */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle>Recent Claims</CardTitle>
            <CardDescription>Latest insurance claims</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
            ) : claims.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <FileText className="mx-auto mb-2 h-12 w-12 opacity-50" />
                <p>No claims yet</p>
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
      </div>
    );
  }

  if (activeTab === 'claims') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">All Claims</h2>
          <p className="text-muted-foreground">Review and manage insurance claims</p>
        </div>

        {/* Principal ID Card */}
        <PrincipalIDCard />

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : claims.length === 0 ? (
          <Card className="border-2">
            <CardContent className="py-12 text-center">
              <FileText className="mx-auto mb-4 h-16 w-16 text-muted-foreground opacity-50" />
              <h3 className="mb-2 text-lg font-semibold">No claims yet</h3>
              <p className="text-muted-foreground">Claims will appear here when submitted</p>
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
                          <span className="font-medium">Provider:</span>
                          <span className="truncate text-xs">{claim.provider.toString().substring(0, 20)}...</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Patient:</span>
                          <span className="truncate text-xs">{claim.patient.toString().substring(0, 20)}...</span>
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
                            <span>Insurer (You)</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {claim.status === ClaimStatus.pendingInsuranceReview && !claim.insurerSigned && (
                      <div className="space-y-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewAgreement(claim.id)}
                          className="w-full"
                        >
                          <Shield className="mr-2 h-3 w-3" />
                          View Agreement
                        </Button>
                        <Button
                          onClick={() => handleApprove(claim.id)}
                          disabled={approveClaim.isPending}
                          className="w-full"
                        >
                          {approveClaim.isPending ? 'Approving & Processing Payment...' : 'Approve & Process Payment'}
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Claim History</h2>
        <p className="text-muted-foreground">Complete history of all claims</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      ) : claims.length === 0 ? (
        <Card className="border-2">
          <CardContent className="py-12 text-center">
            <FileText className="mx-auto mb-4 h-16 w-16 text-muted-foreground opacity-50" />
            <h3 className="mb-2 text-lg font-semibold">No history yet</h3>
            <p className="text-muted-foreground">Claim history will appear here</p>
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
                      ${(Number(claim.amount) / 100).toFixed(2)} • {new Date(Number(claim.timestamp) / 1000000).toLocaleDateString()}
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
