import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ShieldCheck, Loader2, ArrowLeft } from 'lucide-react';

const STAFF_ACCESS_PASSWORD = 'DKTE';

export default function StaffAccess() {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!password) {
      toast({
        title: 'Error',
        description: 'Please enter the staff access password',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      if (password === STAFF_ACCESS_PASSWORD) {
        toast({
          title: 'Access Granted',
          description: 'Welcome to staff portal',
        });
        navigate('/staff-roles');
      } else {
        toast({
          title: 'Access Denied',
          description: 'Incorrect staff access password',
          variant: 'destructive',
        });
      }
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <div className="p-4">
        <img 
          src="https://miaoda-conversation-file.s3cdn.medo.dev/user-845wqo7mn94w/conv-845wum9wqhog/20251210/file-852rchre4v0g.png" 
          alt="DKTE Logo" 
          className="h-12 w-auto object-contain"
        />
      </div>
      
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <Button
            variant="ghost"
            onClick={() => navigate('/login')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Student Login
          </Button>

        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-primary/10 p-4 rounded-full">
                <ShieldCheck className="h-12 w-12 text-primary" />
              </div>
            </div>
            <CardTitle>Staff Access Verification</CardTitle>
            <CardDescription>
              Enter the staff access password to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Staff Access Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter staff access password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  autoFocus
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    Verify Access
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-border">
              <div className="bg-warning/10 border border-warning/20 rounded-lg p-3">
                <p className="text-xs text-warning-foreground">
                  <strong>Security Notice:</strong> This area is restricted to authorized staff
                  members only. Unauthorized access attempts will be logged.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
}
