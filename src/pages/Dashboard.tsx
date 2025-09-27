import React from 'react';
import {
  CreditCard,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  AlertTriangle,
  Plus,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useSubscriptionStore, useConfirmedSubscriptions, useSubscriptionLoading, useLoadConfirmedSubscriptions } from '../store/subscriptionStore';
import { formatCurrency, formatDate, getDaysUntilNextBilling } from '../lib/utils';

/**
 * Subscription card component for dashboard overview
 */
interface SubscriptionCardProps {
  subscription: any;
  onCancel: (id: string) => void;
}

const SubscriptionCard: React.FC<SubscriptionCardProps> = ({ subscription, onCancel }) => {
  const daysUntilBilling = getDaysUntilNextBilling(subscription.next_billing_date);
  const isUpcoming = daysUntilBilling <= 7;

  return (
    <Card variant="glass" className="group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">{subscription.service_name}</CardTitle>
              <CardDescription className="text-sm">
                {subscription.category.charAt(0).toUpperCase() + subscription.category.slice(1)}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              subscription.status === 'active'
                ? 'bg-green-500/20 text-green-300'
                : subscription.status === 'cancelled'
                ? 'bg-red-500/20 text-red-300'
                : 'bg-yellow-500/20 text-yellow-300'
            }`}>
              {subscription.status}
            </span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Pricing Info */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(subscription.amount, subscription.currency)}
              </p>
              <p className="text-sm text-white/60">per {subscription.billing_cycle}</p>
            </div>
            {isUpcoming && (
              <div className="flex items-center text-yellow-400">
                <AlertTriangle className="w-4 h-4 mr-1" />
                <span className="text-xs">Due in {daysUntilBilling} days</span>
              </div>
            )}
          </div>

          {/* Next Billing */}
          <div className="flex items-center text-white/70">
            <Calendar className="w-4 h-4 mr-2" />
            <span className="text-sm">
              Next billing: {formatDate(subscription.next_billing_date)}
            </span>
          </div>

          {/* Description */}
          {subscription.description && (
            <div className="text-xs text-white/60">
              {subscription.description}
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-2 pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 text-xs"
            >
              Manage
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 text-xs text-red-300 hover:text-red-200"
              onClick={() => onCancel(subscription.id)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Main Dashboard component
 * Displays subscription overview, analytics, and quick actions
 */
export const Dashboard: React.FC = () => {
  const confirmedSubscriptions = useConfirmedSubscriptions();
  const { isAnalyzing, isLoading } = useSubscriptionLoading();
  const { loadMockData, deleteSubscription } = useSubscriptionStore();
  const loadConfirmedSubscriptions = useLoadConfirmedSubscriptions();

  // Load subscriptions on component mount
  React.useEffect(() => {
    loadConfirmedSubscriptions();
  }, [loadConfirmedSubscriptions]);

  const activeSubscriptions = confirmedSubscriptions.filter(sub => sub.status === 'active');
  const upcomingBilling = confirmedSubscriptions.filter(sub => {
    const days = getDaysUntilNextBilling(sub.next_billing_date);
    return days <= 7 && sub.status === 'active';
  });

  // Calculate analytics
  const analytics = {
    totalMonthlySpend: activeSubscriptions.reduce((total, sub) => {
      const monthlyAmount = sub.billing_cycle === 'monthly' ? sub.amount :
                           sub.billing_cycle === 'yearly' ? sub.amount / 12 :
                           sub.billing_cycle === 'weekly' ? sub.amount * 4.33 :
                           sub.amount;
      return total + monthlyAmount;
    }, 0),
    potentialSavings: activeSubscriptions.reduce((total, sub) => {
      // Assume 20% potential savings on non-essential categories
      const nonEssential = ['Entertainment', 'Gaming', 'Music'];
      return nonEssential.includes(sub.category) ? total + (sub.amount * 0.2) : total;
    }, 0)
  };

  /**
   * Handle subscription cancellation
   */
  const handleCancelSubscription = (id: string) => {
    if (window.confirm('Are you sure you want to cancel this subscription?')) {
      deleteSubscription(id);
    }
  };

  /**
   * Handle subscription detection
   */
  const handleDetectSubscriptions = () => {
    loadMockData();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display text-white mb-2">Dashboard</h1>
          <p className="text-body text-white/70">
            Manage your subscriptions and track your spending
          </p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="glass"
            icon={<Zap />}
            onClick={handleDetectSubscriptions}
            loading={isAnalyzing}
          >
            {isAnalyzing ? 'Detecting...' : 'Auto-Detect'}
          </Button>
          <Button
            variant="primary"
            icon={<Plus />}
          >
            Add Subscription
          </Button>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Monthly Spend */}
        <Card variant="glass">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60 mb-1">Monthly Spend</p>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(analytics.totalMonthlySpend, 'USD')}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-blue-400" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-green-400">
              <TrendingDown className="w-4 h-4 mr-1" />
              <span className="text-sm">12% from last month</span>
            </div>
          </CardContent>
        </Card>

        {/* Active Subscriptions */}
        <Card variant="glass">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60 mb-1">Active Subscriptions</p>
                <p className="text-2xl font-bold text-white">
                  {activeSubscriptions.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-purple-400" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-blue-400">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span className="text-sm">2 new this month</span>
            </div>
          </CardContent>
        </Card>

        {/* Potential Savings */}
        <Card variant="glass">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60 mb-1">Potential Savings</p>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(analytics.potentialSavings, 'USD')}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-green-400" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-white/60">
              <span className="text-sm">Non-essential subscriptions</span>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Bills */}
        <Card variant="glass">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60 mb-1">Upcoming Bills</p>
                <p className="text-2xl font-bold text-white">
                  {upcomingBilling.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-yellow-400" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-yellow-400">
              <AlertTriangle className="w-4 h-4 mr-1" />
              <span className="text-sm">Next 7 days</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Subscriptions */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-heading text-white">Your Subscriptions</h2>
          <Button variant="ghost" size="sm">
            View All
          </Button>
        </div>
        
        {activeSubscriptions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeSubscriptions.slice(0, 6).map((subscription) => (
              <SubscriptionCard
                key={subscription.id}
                subscription={subscription}
                onCancel={handleCancelSubscription}
              />
            ))}
          </div>
        ) : (
          <Card variant="glass" className="text-center py-12">
            <CardContent>
              <CreditCard className="w-16 h-16 text-white/40 mx-auto mb-4" />
              <CardTitle className="mb-2">No subscriptions found</CardTitle>
              <CardDescription className="mb-6">
                Start by adding your first subscription or use auto-detection
              </CardDescription>
              <div className="flex justify-center space-x-3">
                <Button
                  variant="primary"
                  icon={<Plus />}
                >
                  Add Subscription
                </Button>
                <Button
                  variant="glass"
                  icon={<Zap />}
                  onClick={handleDetectSubscriptions}
                  loading={isAnalyzing}
                >
                  Auto-Detect
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;