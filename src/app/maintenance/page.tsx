import { AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-surface-default flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-status-warning/10 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-status-warning" />
          </div>
          <CardTitle className="text-2xl font-bold text-text-primary">
            We'll be right back!
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center text-text-secondary">
          <p>
            Tejaswini AI English Tutor is currently undergoing scheduled maintenance to improve your learning experience. 
          </p>
          <p className="mt-4 text-sm font-medium">
            Please check back soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
