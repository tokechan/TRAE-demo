import React, { useState } from 'react';
import { X, ExternalLink, Phone, Mail, MessageCircle, Clock, AlertTriangle, CheckCircle, HelpCircle } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import Modal from './ui/Modal';
import { toast } from 'sonner';
import { DatabaseSubscription } from '../services/subscriptionDetection';

interface CancellationAssistantProps {
  subscription: DatabaseSubscription;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Cancellation Assistant component that provides step-by-step guidance
 * for canceling subscriptions with service-specific instructions
 */
const CancellationAssistant: React.FC<CancellationAssistantProps> = ({
  subscription,
  isOpen,
  onClose,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [cancellationMethod, setCancellationMethod] = useState<'online' | 'phone' | 'email' | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Service-specific cancellation data
  const cancellationData = {
    'Netflix': {
      difficulty: 'easy',
      methods: ['online'],
      steps: [
        'Sign in to your Netflix account',
        'Go to Account settings',
        'Click "Cancel Membership"',
        'Confirm cancellation',
      ],
      website: 'https://www.netflix.com/account',
      phone: null,
      email: null,
      tips: 'You can reactivate anytime before your billing period ends.',
    },
    'Spotify': {
      difficulty: 'easy',
      methods: ['online'],
      steps: [
        'Log in to your Spotify account',
        'Go to Account Overview',
        'Click "Change or cancel your subscription"',
        'Select "Cancel Premium"',
        'Confirm cancellation',
      ],
      website: 'https://www.spotify.com/account',
      phone: null,
      email: null,
      tips: 'Your Premium features will continue until the end of your billing period.',
    },
    'Adobe Creative Cloud': {
      difficulty: 'medium',
      methods: ['online', 'phone'],
      steps: [
        'Sign in to your Adobe account',
        'Go to Plans & Products',
        'Find your subscription and click "Manage"',
        'Click "Cancel plan"',
        'Follow the cancellation flow',
      ],
      website: 'https://account.adobe.com',
      phone: '1-800-833-6687',
      email: null,
      tips: 'Adobe may charge an early termination fee if you cancel before your annual commitment ends.',
    },
    'Amazon Prime': {
      difficulty: 'medium',
      methods: ['online', 'phone'],
      steps: [
        'Go to Your Account on Amazon',
        'Select "Prime membership"',
        'Click "Update, cancel and more"',
        'Select "End membership"',
        'Confirm cancellation',
      ],
      website: 'https://www.amazon.com/gp/primecentral',
      phone: '1-888-280-4331',
      email: null,
      tips: 'You can get a refund for the unused portion if you haven\'t used Prime benefits.',
    },
    'Default': {
      difficulty: 'medium',
      methods: ['online', 'phone', 'email'],
      steps: [
        'Log in to your account on the service website',
        'Look for Account, Settings, or Billing section',
        'Find subscription or membership options',
        'Look for cancel, unsubscribe, or end membership',
        'Follow the cancellation process',
      ],
      website: subscription.website_url || '#',
      phone: null,
      email: null,
      tips: 'If you can\'t find cancellation options online, try contacting customer support.',
    },
  };

  const serviceData = cancellationData[subscription.service_name as keyof typeof cancellationData] || cancellationData.Default;

  /**
   * Mark a step as completed
   */
  const markStepCompleted = (stepIndex: number) => {
    if (!completedSteps.includes(stepIndex)) {
      setCompletedSteps([...completedSteps, stepIndex]);
    }
    if (stepIndex === serviceData.steps.length - 1) {
      setShowConfirmation(true);
    }
  };

  /**
   * Handle final cancellation confirmation
   */
  const handleCancellationConfirm = () => {
    toast.success(`${subscription.service_name} cancellation process completed!`);
    setShowConfirmation(false);
    onClose();
    // Here you would typically update the subscription status in your store
  };

  /**
   * Get difficulty color
   */
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'hard': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  /**
   * Get difficulty icon
   */
  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return <CheckCircle className="w-5 h-5" />;
      case 'medium': return <Clock className="w-5 h-5" />;
      case 'hard': return <AlertTriangle className="w-5 h-5" />;
      default: return <HelpCircle className="w-5 h-5" />;
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={`Cancel ${subscription.service_name}`} size="lg">
        <div className="space-y-6">
          {/* Service Info */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-white">{subscription.service_name}</h3>
                <p className="text-sm text-white/60">${subscription.amount}/month</p>
              </div>
              <div className={`flex items-center gap-2 ${getDifficultyColor(serviceData.difficulty)}`}>
                {getDifficultyIcon(serviceData.difficulty)}
                <span className="text-sm font-medium capitalize">{serviceData.difficulty} to cancel</span>
              </div>
            </div>
            
            {serviceData.tips && (
              <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <p className="text-sm text-blue-400">
                  <strong>Tip:</strong> {serviceData.tips}
                </p>
              </div>
            )}
          </Card>

          {/* Cancellation Methods */}
          <div>
            <h4 className="font-medium text-white mb-3">Choose cancellation method:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {serviceData.methods.includes('online') && (
                <Button
                  variant={cancellationMethod === 'online' ? 'primary' : 'secondary'}
                  size="sm"
                  icon={<ExternalLink className="w-4 h-4" />}
                  onClick={() => setCancellationMethod('online')}
                >
                  Online
                </Button>
              )}
              {serviceData.methods.includes('phone') && serviceData.phone && (
                <Button
                  variant={cancellationMethod === 'phone' ? 'primary' : 'secondary'}
                  size="sm"
                  icon={<Phone className="w-4 h-4" />}
                  onClick={() => setCancellationMethod('phone')}
                >
                  Phone
                </Button>
              )}
              {serviceData.methods.includes('email') && serviceData.email && (
                <Button
                  variant={cancellationMethod === 'email' ? 'primary' : 'secondary'}
                  size="sm"
                  icon={<Mail className="w-4 h-4" />}
                  onClick={() => setCancellationMethod('email')}
                >
                  Email
                </Button>
              )}
            </div>
          </div>

          {/* Step-by-step Instructions */}
          {cancellationMethod && (
            <div>
              <h4 className="font-medium text-white mb-4">Step-by-step instructions:</h4>
              <div className="space-y-3">
                {serviceData.steps.map((step, index) => {
                  const isCompleted = completedSteps.includes(index);
                  const isCurrent = index === currentStep;
                  
                  return (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border transition-all ${
                        isCompleted
                          ? 'bg-green-500/10 border-green-500/30'
                          : isCurrent
                          ? 'bg-blue-500/10 border-blue-500/30'
                          : 'bg-white/5 border-white/10'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
                            isCompleted
                              ? 'bg-green-500 text-white'
                              : isCurrent
                              ? 'bg-blue-500 text-white'
                              : 'bg-white/20 text-white/60'
                          }`}
                        >
                          {isCompleted ? '✓' : index + 1}
                        </div>
                        <div className="flex-1">
                          <p className={`${isCompleted ? 'text-green-400' : 'text-white'}`}>
                            {step}
                          </p>
                          {!isCompleted && isCurrent && (
                            <Button
                              size="sm"
                              className="mt-2"
                              onClick={() => {
                                markStepCompleted(index);
                                if (index < serviceData.steps.length - 1) {
                                  setCurrentStep(index + 1);
                                }
                              }}
                            >
                              Mark as completed
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Contact Information */}
          {cancellationMethod && (
            <Card className="p-4">
              <h4 className="font-medium text-white mb-3">Contact Information</h4>
              <div className="space-y-2">
                {cancellationMethod === 'online' && serviceData.website && (
                  <div className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-blue-400" />
                    <a
                      href={serviceData.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      {serviceData.website}
                    </a>
                  </div>
                )}
                {cancellationMethod === 'phone' && serviceData.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-green-400" />
                    <a
                      href={`tel:${serviceData.phone}`}
                      className="text-green-400 hover:text-green-300 transition-colors"
                    >
                      {serviceData.phone}
                    </a>
                  </div>
                )}
                {cancellationMethod === 'email' && serviceData.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-purple-400" />
                    <a
                      href={`mailto:${serviceData.email}`}
                      className="text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      {serviceData.email}
                    </a>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
            {cancellationMethod === 'online' && serviceData.website && (
              <Button
                icon={<ExternalLink className="w-4 h-4" />}
                onClick={() => window.open(serviceData.website, '_blank')}
              >
                Open Website
              </Button>
            )}
          </div>
        </div>
      </Modal>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        title="Confirm Cancellation"
      >
        <div className="space-y-4">
          <p className="text-white/70">
            Have you successfully completed the cancellation process for {subscription.service_name}?
          </p>
          <div className="flex gap-3 justify-end">
            <Button
              variant="secondary"
              onClick={() => setShowConfirmation(false)}
            >
              Not yet
            </Button>
            <Button
              variant="primary"
              onClick={handleCancellationConfirm}
            >
              Yes, it's cancelled
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default CancellationAssistant;