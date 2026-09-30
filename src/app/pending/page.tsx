import { Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function PendingApprovalPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-surface-default p-6 text-center space-y-6">
      <div className="w-20 h-20 bg-interactive-default/10 rounded-full flex items-center justify-center text-interactive-default mb-4 shadow-sm">
        <Clock className="w-10 h-10" />
      </div>
      
      <h2 className="text-3xl font-bold text-text-primary">
        Pending Admin Approval
      </h2>
      
      <p className="text-text-secondary max-w-md text-lg">
        Your account has been created successfully! However, you need to wait for an administrator to approve your account before you can start practicing.
      </p>

      <div className="pt-6">
        <Link href="/login">
          <Button variant="secondary" className="mr-4">
            Sign In with different account
          </Button>
        </Link>
        <Link href="/dashboard">
          <Button variant="default">
            Check Status
          </Button>
        </Link>
      </div>
    </div>
  );
}
