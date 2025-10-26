import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, FileCheck, Users, Lock } from 'lucide-react';

export default function LoginPage() {
  const { login, isLoggingIn } = useInternetIdentity();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-12 text-center">
            <div className="mb-4 inline-flex items-center justify-center rounded-full bg-primary/10 p-4">
              <Shield className="h-12 w-12 text-primary" />
            </div>
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              AuditLink
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Secure, transparent, and efficient insurance claim processing powered by blockchain technology
            </p>
          </div>

          {/* Login Card */}
          <Card className="mx-auto mb-12 max-w-md border-2 shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Welcome</CardTitle>
              <CardDescription>Sign in to access your dashboard</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={login}
                disabled={isLoggingIn}
                size="lg"
                className="w-full text-lg font-semibold"
              >
                {isLoggingIn ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Connecting...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-5 w-5" />
                    Sign In with Internet Identity
                  </>
                )}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Secure authentication powered by Internet Computer
              </p>
            </CardContent>
          </Card>

          {/* Features Grid */}
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="border-2 transition-shadow hover:shadow-lg">
              <CardHeader>
                <div className="mb-2 inline-flex items-center justify-center rounded-lg bg-blue-100 p-3 dark:bg-blue-900/30">
                  <FileCheck className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-xl">Multi-Signature Workflow</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Claims require approval from patient, provider, and insurer for maximum security and transparency.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 transition-shadow hover:shadow-lg">
              <CardHeader>
                <div className="mb-2 inline-flex items-center justify-center rounded-lg bg-purple-100 p-3 dark:bg-purple-900/30">
                  <Lock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle className="text-xl">Privacy Protected</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Only encrypted record hashes stored on-chain. Your sensitive medical data stays private.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 transition-shadow hover:shadow-lg">
              <CardHeader>
                <div className="mb-2 inline-flex items-center justify-center rounded-lg bg-green-100 p-3 dark:bg-green-900/30">
                  <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-xl">Role-Based Access</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Tailored dashboards for patients, providers, and insurers with appropriate permissions.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Footer */}
          <footer className="mt-16 text-center text-sm text-muted-foreground">
            <p>
              © 2025 AuditLink. Built with <span className="text-red-500">♥</span> using{' '}
              <a
                href="https://caffeine.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary hover:underline"
              >
                caffeine.ai
              </a>
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
