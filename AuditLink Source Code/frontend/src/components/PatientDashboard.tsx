import { useState } from 'react';
import { useGetClaimsByRole, useEndorseClaim, useGetCallerPrincipal, useGetAgreementByClaimId } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ClaimStatus } from '../backend';
import { FileText, CheckCircle2, XCircle, Clock, AlertCircle, Heart, DollarSign, User, Building2, Copy, Check, AlertTriangle, RefreshCw, Shield, Stethoscope } from 'lucide-react';
import { toast } from 'sonner';

interface PatientDashboardProps {
  activeTab: 'overview' | 'claims' | 'history';
}

export default function PatientDashboard({ activeTab }: PatientDashboardProps) {
  const { data: claims = [], isLoading, error: claimsError, refetch } = useGetClaimsByRole();
  const { data: callerPrincipal, error: principalError } = useGetCallerPrincipal();
  const endorseClaim = useEndorseClaim();
  const [copiedPrincipal, setCopiedPrincipal] = useState(false);
  const [selectedClaimForAgreement, setSelectedClaimForAgreement] = useState<string | null>(null);
  const { data: agreement } = useGetAgreementByClaimId(selectedClaimForAgreement);

  const pendingEndorsement = claims.filter((c) => c.status === ClaimStatus.pendingPatientEndorsement && !c.patientSigned);
  const endorsedClaims = claims.filter((c) => c.patientSigned);

  const copyPrincipalToClipboard = () => {
    if (callerPrincipal) {
      navigator.clipboard.writeText(callerPrincipal.toString());
      setCopiedPrincipal(true);
      setTimeout(() => setCopiedPrincipal(false), 2000);
      toast.success('Principal ID copied to clipboard');
    }
  };

  const handleEndorse = async (claimId: string) => {
    try {
      await endorseClaim.mutateAsync(claimId);
      toast.success('Claim endorsed successfully! A blockchain-protected agreement has been created.');
      setSelectedClaimForAgreement(claimId);
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to endorse claim';
      toast.error(errorMessage);
      console.error('Endorse claim error:', error);
    }
  };

  const getStatusBadge = (status: ClaimStatus) => {
    switch (status) {
      case ClaimStatus.pendingPatientEndorsement:
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30"><Clock className="mr-1 h-3 w-3" />Awaiting Endorsement</Badge>;
      case ClaimStatus.pendingInsuranceReview:
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/30"><AlertCircle className="mr-1 h-3 w-3" />Pending Insurance Review</Badge>;
      case ClaimStatus.pendingProviderPaymentConfirmation:
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 dark:bg-purple-900/30"><DollarSign className="mr-1 h-3 w-3" />Payment Processing</Badge>;
      case ClaimStatus.completed:
        return <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/30"><CheckCircle2 className="mr-1 h-3 w-3" />Completed</Badge>;
    }
  };

  const checkPrincipalMismatch = (claimPatientPrincipal: string) => {
    if (!callerPrincipal) return false;
    return claimPatientPrincipal !== callerPrincipal.toString();
  };

  const PrincipalIDCard = () => (
    <Card className="border-2 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-lg">
          <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <span>Your Principal ID</span>
        </CardTitle>
        <CardDescription>Share this ID with your healthcare provider when submitting claims</CardDescription>
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
              This is your unique identity on the Internet Computer. Your provider needs this exact ID to submit claims on your behalf.
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

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Claims</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{claims.length}</div>
              <p className="text-xs text-muted-foreground">Claims on your behalf</p>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Endorsement</CardTitle>
              <Heart className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingEndorsement.length}</div>
              <p className="text-xs text-muted-foreground">Requires your approval</p>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Endorsed</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{endorsedClaims.length}</div>
              <p className="text-xs text-muted-foreground">You've approved</p>
            </CardContent>
          </Card>
        </div>

        {/* Pending Endorsements */}
        {pendingEndorsement.length > 0 && (
          <Card className="border-2 border-yellow-200 dark:border-yellow-900">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <span>Action Required</span>
              </CardTitle>
              <CardDescription>These claims need your endorsement to proceed</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingEndorsement.map((claim) => {
                  const hasMismatch = checkPrincipalMismatch(claim.patient.toString());
                  return (
                    <div key={claim.id} className="rounded-lg border-2 border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900 dark:bg-yellow-900/20">
                      {hasMismatch && (
                        <Alert variant="destructive" className="mb-3">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertTitle>Principal ID Mismatch</AlertTitle>
                          <AlertDescription className="text-xs">
                            This claim was submitted for a different principal ID. You cannot endorse it. Please contact your healthcare provider to correct the patient ID.
                          </AlertDescription>
                        </Alert>
                      )}
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
                          {hasMismatch && (
                            <p className="text-xs text-red-600 dark:text-red-400 font-mono">
                              Patient ID: {claim.patient.toString().substring(0, 30)}...
                            </p>
                          )}
                        </div>
                        {getStatusBadge(claim.status)}
                      </div>
                      <Alert className="mb-3 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                        <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <AlertDescription className="text-xs text-blue-800 dark:text-blue-200">
                          By endorsing, you agree to create a blockchain-protected smart contract agreement between you and your provider.
                        </AlertDescription>
                      </Alert>
                      <Button
                        onClick={() => handleEndorse(claim.id)}
                        disabled={endorseClaim.isPending || hasMismatch}
                        className="w-full"
                        variant={hasMismatch ? 'outline' : 'default'}
                      >
                        {hasMismatch ? 'Cannot Endorse - ID Mismatch' : endorseClaim.isPending ? 'Endorsing...' : 'Endorse Claim'}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Agreement Confirmation */}
        {agreement && selectedClaimForAgreement && (
          <Card className="border-2 border-green-200 dark:border-green-900">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-green-600" />
                <span>Agreement Created</span>
              </CardTitle>
              <CardDescription>Your endorsement has generated a blockchain-protected agreement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-sm text-green-800 dark:text-green-200">
                    <p className="font-medium mb-2">Smart Contract Agreement Details:</p>
                    <ul className="space-y-1 text-xs">
                      <li>• Claim ID: {agreement.claimId}</li>
                      <li>• Provider: {agreement.provider.toString().substring(0, 30)}...</li>
                      <li>• Patient: {agreement.patient.toString().substring(0, 30)}...</li>
                      <li>• Created: {new Date(Number(agreement.timestamp) / 1000000).toLocaleString()}</li>
                      <li>• Status: Securely stored on Internet Computer blockchain</li>
                    </ul>
                  </AlertDescription>
                </Alert>
                <p className="text-xs text-muted-foreground">
                  The insurance company has been notified and will review your claim.
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
            <CardDescription>Your latest insurance claims</CardDescription>
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
                        {checkPrincipalMismatch(claim.patient.toString()) && (
                          <Badge variant="destructive" className="text-xs">
                            <AlertTriangle className="mr-1 h-3 w-3" />
                            ID Mismatch
                          </Badge>
                        )}
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
          <h2 className="text-2xl font-bold">My Claims</h2>
          <p className="text-muted-foreground">View and endorse claims submitted on your behalf</p>
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
              <p className="text-muted-foreground">Claims submitted by your healthcare provider will appear here</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {claims.map((claim) => {
              const hasMismatch = checkPrincipalMismatch(claim.patient.toString());
              return (
                <Card key={claim.id} className={`border-2 ${hasMismatch ? 'border-red-200 dark:border-red-800' : ''}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{claim.id}</CardTitle>
                        <CardDescription>
                          Submitted on {new Date(Number(claim.timestamp) / 1000000).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        {getStatusBadge(claim.status)}
                        {hasMismatch && (
                          <Badge variant="destructive" className="text-xs">
                            <AlertTriangle className="mr-1 h-3 w-3" />
                            ID Mismatch
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {hasMismatch && (
                        <Alert variant="destructive">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertTitle>Principal ID Mismatch</AlertTitle>
                          <AlertDescription className="text-sm">
                            <p className="mb-2">This claim was submitted for a different principal ID and cannot be endorsed by you.</p>
                            <p className="font-mono text-xs break-all">Claim Patient ID: {claim.patient.toString()}</p>
                            <p className="font-mono text-xs break-all mt-1">Your Principal ID: {callerPrincipal?.toString()}</p>
                            <p className="mt-2 text-xs">Please contact your healthcare provider to correct this issue.</p>
                          </AlertDescription>
                        </Alert>
                      )}

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
                            <span className="truncate text-xs font-mono">{claim.provider.toString().substring(0, 20)}...</span>
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
                              <span>Patient (You)</span>
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

                      {!claim.patientSigned && claim.status === ClaimStatus.pendingPatientEndorsement && (
                        <>
                          <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                            <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            <AlertDescription className="text-xs text-blue-800 dark:text-blue-200">
                              By endorsing, you agree to create a blockchain-protected smart contract agreement between you and your provider.
                            </AlertDescription>
                          </Alert>
                          <Button
                            onClick={() => handleEndorse(claim.id)}
                            disabled={endorseClaim.isPending || hasMismatch}
                            className="w-full"
                            variant={hasMismatch ? 'outline' : 'default'}
                          >
                            {hasMismatch ? 'Cannot Endorse - ID Mismatch' : endorseClaim.isPending ? 'Endorsing...' : 'Endorse This Claim'}
                          </Button>
                        </>
                      )}

                      {claim.patientSigned && (
                        <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                          <Shield className="h-4 w-4 text-green-600" />
                          <AlertDescription className="text-xs text-green-800 dark:text-green-200">
                            <strong>Agreement Created:</strong> A blockchain-protected smart contract has been generated and stored securely on the Internet Computer.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
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
            <FileText className="mx-auto mb-4 h-16 w-16 text-muted-foreground opacity-50" />
            <h3 className="mb-2 text-lg font-semibold">No history yet</h3>
            <p className="text-muted-foreground">Your claim history will appear here</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {claims.map((claim) => {
            const hasMismatch = checkPrincipalMismatch(claim.patient.toString());
            return (
              <Card key={claim.id} className="border-2">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center space-x-2">
                        <p className="font-medium">{claim.id}</p>
                        {getStatusBadge(claim.status)}
                        {hasMismatch && (
                          <Badge variant="destructive" className="text-xs">
                            <AlertTriangle className="mr-1 h-3 w-3" />
                            ID Mismatch
                          </Badge>
                        )}
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
            );
          })}
        </div>
      )}
    </div>
  );
}
