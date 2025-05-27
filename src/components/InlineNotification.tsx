
import { CheckCircle, AlertCircle, User, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface InlineNotificationProps {
  type: 'success' | 'error' | 'duplicate';
  title: string;
  message: string;
  userEmail?: string;
  onContinueToDashboard?: () => void;
  onRetry?: () => void;
}

const InlineNotification = ({ 
  type, 
  title, 
  message, 
  userEmail, 
  onContinueToDashboard, 
  onRetry 
}: InlineNotificationProps) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-6 w-6 text-green-400" />;
      case 'duplicate':
        return <User className="h-6 w-6 text-blue-400" />;
      case 'error':
      default:
        return <AlertCircle className="h-6 w-6 text-red-400" />;
    }
  };

  const getCardStyle = () => {
    switch (type) {
      case 'success':
        return 'bg-green-900/20 border-green-800';
      case 'duplicate':
        return 'bg-blue-900/20 border-blue-800';
      case 'error':
      default:
        return 'bg-red-900/20 border-red-800';
    }
  };

  const getTextStyle = () => {
    switch (type) {
      case 'success':
        return 'text-green-400';
      case 'duplicate':
        return 'text-blue-400';
      case 'error':
      default:
        return 'text-red-400';
    }
  };

  return (
    <Card className={`${getCardStyle()} mb-6`}>
      <CardContent className="pt-6">
        <div className="flex items-start space-x-3">
          {getIcon()}
          <div className="flex-1">
            <h3 className={`font-semibold ${getTextStyle()}`}>{title}</h3>
            <p className="text-gray-300 mt-1">{message}</p>
            {userEmail && (
              <p className="text-gray-400 text-sm mt-2">Account: {userEmail}</p>
            )}
            
            {type === 'duplicate' && onContinueToDashboard && (
              <div className="mt-4 space-y-2">
                <Button 
                  onClick={onContinueToDashboard}
                  className="bg-blue-600 hover:bg-blue-700 text-white w-full"
                >
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Continue to Dashboard
                </Button>
              </div>
            )}
            
            {onRetry && (
              <div className="mt-4">
                <Button 
                  onClick={onRetry}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Try Again
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InlineNotification;
