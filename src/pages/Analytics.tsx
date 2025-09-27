import React, { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Calendar, PieChart, BarChart3 } from 'lucide-react';
import { useSubscriptionStore } from '../store/subscriptionStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

/**
 * Analytics page component that provides comprehensive spending insights and trends
 * Displays monthly spending, category breakdown, and subscription analytics
 */
const Analytics: React.FC = () => {
  const { confirmedSubscriptions: subscriptions } = useSubscriptionStore();
  const [timeRange, setTimeRange] = useState<'month' | 'quarter' | 'year'>('month');
  const [viewType, setViewType] = useState<'overview' | 'categories' | 'trends'>('overview');

  // Calculate analytics data
  const analyticsData = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Calculate total monthly spending
    const monthlySpending = subscriptions.reduce((total, sub) => {
      if (sub.status === 'active') {
        return total + sub.amount;
      }
      return total;
    }, 0);

    // Calculate yearly spending
    const yearlySpending = monthlySpending * 12;

    // Category breakdown
    const categorySpending = subscriptions.reduce((acc, sub) => {
      if (sub.status === 'active') {
        acc[sub.category] = (acc[sub.category] || 0) + sub.amount;
      }
      return acc;
    }, {} as Record<string, number>);

    // Most expensive subscriptions
    const topSubscriptions = [...subscriptions]
      .filter(sub => sub.status === 'active')
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    // Calculate trends (mock data for demonstration)
    const monthlyTrends = Array.from({ length: 6 }, (_, i) => {
      const month = new Date(currentYear, currentMonth - i, 1);
      return {
        month: month.toLocaleDateString('en-US', { month: 'short' }),
        spending: monthlySpending * (0.8 + Math.random() * 0.4),
      };
    }).reverse();

    return {
      monthlySpending,
      yearlySpending,
      categorySpending,
      topSubscriptions,
      monthlyTrends,
      totalSubscriptions: subscriptions.filter(sub => sub.status === 'active').length,
      avgPerSubscription: monthlySpending / subscriptions.filter(sub => sub.status === 'active').length || 0,
    };
  }, [subscriptions]);

  const categoryColors = {
    'Entertainment': '#FF6B6B',
    'Productivity': '#4ECDC4',
    'Education': '#45B7D1',
    'Health & Fitness': '#96CEB4',
    'News & Media': '#FFEAA7',
    'Business': '#DDA0DD',
    'Gaming': '#98D8C8',
    'Other': '#F7DC6F',
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-display text-white mb-2">Analytics</h1>
          <p className="text-white/70">Insights into your subscription spending patterns</p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={timeRange === 'month' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setTimeRange('month')}
          >
            Month
          </Button>
          <Button
            variant={timeRange === 'quarter' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setTimeRange('quarter')}
          >
            Quarter
          </Button>
          <Button
            variant={timeRange === 'year' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setTimeRange('year')}
          >
            Year
          </Button>
        </div>
      </div>

      {/* View Type Selector */}
      <div className="flex gap-2">
        <Button
          variant={viewType === 'overview' ? 'primary' : 'secondary'}
          size="sm"
          icon={<BarChart3 className="w-4 h-4" />}
          onClick={() => setViewType('overview')}
        >
          Overview
        </Button>
        <Button
          variant={viewType === 'categories' ? 'primary' : 'secondary'}
          size="sm"
          icon={<PieChart className="w-4 h-4" />}
          onClick={() => setViewType('categories')}
        >
          Categories
        </Button>
        <Button
          variant={viewType === 'trends' ? 'primary' : 'secondary'}
          size="sm"
          icon={<TrendingUp className="w-4 h-4" />}
          onClick={() => setViewType('trends')}
        >
          Trends
        </Button>
      </div>

      {/* Overview Cards */}
      {viewType === 'overview' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <DollarSign className="w-6 h-6 text-blue-400" />
                </div>
                <span className="text-sm text-green-400 flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  +5.2%
                </span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">
                ${analyticsData.monthlySpending.toFixed(2)}
              </h3>
              <p className="text-white/60 text-sm">Monthly Spending</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Calendar className="w-6 h-6 text-purple-400" />
                </div>
                <span className="text-sm text-green-400 flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  +12.1%
                </span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">
                ${analyticsData.yearlySpending.toFixed(2)}
              </h3>
              <p className="text-white/60 text-sm">Yearly Projection</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-green-400" />
                </div>
                <span className="text-sm text-red-400 flex items-center gap-1">
                  <TrendingDown className="w-4 h-4" />
                  -2.3%
                </span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">
                {analyticsData.totalSubscriptions}
              </h3>
              <p className="text-white/60 text-sm">Active Subscriptions</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-orange-500/20 rounded-lg">
                  <PieChart className="w-6 h-6 text-orange-400" />
                </div>
                <span className="text-sm text-green-400 flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  +8.7%
                </span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">
                ${analyticsData.avgPerSubscription.toFixed(2)}
              </h3>
              <p className="text-white/60 text-sm">Avg per Subscription</p>
            </Card>
          </div>

          {/* Top Subscriptions */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-white mb-6">Top Subscriptions</h3>
            <div className="space-y-4">
              {analyticsData.topSubscriptions.map((subscription, index) => (
                <div key={subscription.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-semibold">
                      #{index + 1}
                    </div>
                    <div>
                      <h4 className="font-medium text-white">{subscription.service_name}</h4>
                      <p className="text-sm text-white/60">{subscription.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-white">${subscription.amount.toFixed(2)}</p>
                    <p className="text-sm text-white/60">per month</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}

      {/* Category Breakdown */}
      {viewType === 'categories' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-white mb-6">Spending by Category</h3>
            <div className="space-y-4">
              {Object.entries(analyticsData.categorySpending)
                .sort(([,a], [,b]) => (b as number) - (a as number))
                .map(([category, amount]) => {
                  const amountNum = amount as number;
                  const percentage = (amountNum / analyticsData.monthlySpending) * 100;
                  return (
                    <div key={category} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-white font-medium">{category}</span>
                        <span className="text-white/70">${amountNum.toFixed(2)} ({percentage.toFixed(1)}%)</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: categoryColors[category as keyof typeof categoryColors] || '#6B7280'
                          }}
                        />
                      </div>
                    </div>
                  );
                })
              }
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-semibold text-white mb-6">Category Insights</h3>
            <div className="space-y-4">
              {Object.entries(analyticsData.categorySpending)
                .sort(([,a], [,b]) => (b as number) - (a as number))
                .slice(0, 3)
                .map(([category, amount], index) => {
                  const amountNum = amount as number;
                  const tips = {
                    'Entertainment': 'Consider bundling services or sharing family plans to reduce costs.',
                    'Productivity': 'Look for annual discounts or student pricing options.',
                    'Education': 'Many platforms offer free trials or educational discounts.',
                  };
                  
                  return (
                    <div key={category} className="p-4 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: categoryColors[category as keyof typeof categoryColors] }}
                        />
                        <h4 className="font-medium text-white">{category}</h4>
                        <span className="text-sm text-white/60">${amountNum.toFixed(2)}/month</span>
                      </div>
                      <p className="text-sm text-white/70">
                        {tips[category as keyof typeof tips] || 'Review this category for potential savings opportunities.'}
                      </p>
                    </div>
                  );
                })
              }
            </div>
          </Card>
        </div>
      )}

      {/* Trends */}
      {viewType === 'trends' && (
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-white mb-6">Spending Trends</h3>
          <div className="space-y-6">
            {/* Simple bar chart representation */}
            <div className="space-y-4">
              {analyticsData.monthlyTrends.map((trend, index) => {
                const maxSpending = Math.max(...analyticsData.monthlyTrends.map(t => t.spending));
                const percentage = (trend.spending / maxSpending) * 100;
                
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-white font-medium">{trend.month}</span>
                      <span className="text-white/70">${trend.spending.toFixed(2)}</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-3">
                      <div
                        className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-6 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <h4 className="font-medium text-blue-400 mb-2">Trend Analysis</h4>
              <p className="text-white/70 text-sm">
                Your spending has been relatively stable over the past 6 months. 
                Consider setting up alerts for when new subscriptions are added to track changes in your spending patterns.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Analytics;