import React, { useState } from 'react';
import { useSubscriptionStore } from '../store/subscriptionStore';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import CancellationAssistant from '../components/CancellationAssistant';
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Calendar,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  X
} from 'lucide-react';

/**
 * Subscription management page with list view, details, and edit functionality
 */
const Subscriptions: React.FC = () => {
  const { confirmedSubscriptions: subscriptions, deleteSubscription, updateSubscription } = useSubscriptionStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'cancelled'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [selectedSubscription, setSelectedSubscription] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [showCancellationAssistant, setShowCancellationAssistant] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    amount: '',
    billing_cycle: 'monthly',
    category: '',
    next_billing_date: '',
    status: 'active'
  });

  // Filter subscriptions based on search and filters
  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch = sub.service_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sub.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || sub.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || sub.category === filterCategory;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Get unique categories for filter
  const categories: string[] = Array.from(new Set(subscriptions.map(sub => sub.category)));

  /**
   * Handle subscription deletion with confirmation
   */
  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      deleteSubscription(id);
    }
  };

  /**
   * Open cancellation assistant
   */
  const openCancellationAssistant = (subscription: any) => {
    setSelectedSubscription(subscription);
    setShowCancellationAssistant(true);
  };

  /**
   * Open edit modal with subscription data
   */
  const handleEdit = (subscription: any) => {
    setSelectedSubscription(subscription);
    setEditForm({
      name: subscription.name,
      amount: subscription.amount.toString(),
      billing_cycle: subscription.billing_cycle,
      category: subscription.category,
      next_billing_date: subscription.next_billing_date,
      status: subscription.status
    });
    setIsEditModalOpen(true);
  };

  /**
   * Handle form submission for editing
   */
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSubscription) {
      updateSubscription(selectedSubscription.id, {
        ...selectedSubscription,
        name: editForm.name,
        amount: parseFloat(editForm.amount),
        billing_cycle: editForm.billing_cycle,
        category: editForm.category,
        next_billing_date: editForm.next_billing_date,
        status: editForm.status
      });
      setIsEditModalOpen(false);
      setSelectedSubscription(null);
    }
  };

  /**
   * Get status badge variant
   */
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>;
      case 'cancelled':
        return <Badge variant="error"><XCircle className="w-3 h-3 mr-1" />Cancelled</Badge>;
      case 'paused':
        return <Badge variant="warning"><AlertTriangle className="w-3 h-3 mr-1" />Paused</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  /**
   * Calculate days until next billing
   */
  const getDaysUntilBilling = (nextBillingDate: string) => {
    const today = new Date();
    const billingDate = new Date(nextBillingDate);
    const diffTime = billingDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display text-white mb-2">Subscriptions</h1>
          <p className="text-body text-white/70">
            Manage all your subscriptions in one place
          </p>
        </div>
        <Button
          variant="primary"
          icon={<Plus />}
          onClick={() => setIsAddModalOpen(true)}
        >
          Add Subscription
        </Button>
      </div>

      {/* Filters and Search */}
      <Card variant="glass">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <Input
                placeholder="Search subscriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={<Search />}
                variant="glass"
              />
            </div>
            
            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="cancelled">Cancelled</option>
              <option value="paused">Paused</option>
            </select>
            
            {/* Category Filter */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map((category: string) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Subscriptions List */}
      {filteredSubscriptions.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredSubscriptions.map((subscription) => {
            const daysUntilBilling = getDaysUntilBilling(subscription.next_billing_date);
            
            return (
              <Card key={subscription.id} variant="glass" className="hover:bg-white/5 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                        {subscription.service_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{subscription.service_name}</CardTitle>
                        <p className="text-sm text-white/60">{subscription.category}</p>
                      </div>
                    </div>
                    {getStatusBadge(subscription.status)}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Amount and Billing */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-green-400" />
                      <span className="text-xl font-bold text-white">
                        {formatCurrency(subscription.amount, subscription.currency)}
                      </span>
                    </div>
                    <span className="text-sm text-white/60 capitalize">
                      /{subscription.billing_cycle}
                    </span>
                  </div>
                  
                  {/* Next Billing */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-blue-400" />
                      <span className="text-sm text-white/70">
                        Next: {formatDate(subscription.next_billing_date)}
                      </span>
                    </div>
                    <span className={`text-sm ${
                      daysUntilBilling <= 3 ? 'text-red-400' :
                      daysUntilBilling <= 7 ? 'text-yellow-400' :
                      'text-green-400'
                    }`}>
                      {daysUntilBilling > 0 ? `${daysUntilBilling} days` : 'Overdue'}
                    </span>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex space-x-2 pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Edit />}
                      onClick={() => handleEdit(subscription)}
                      className="flex-1"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<X />}
                      onClick={() => openCancellationAssistant(subscription)}
                      className="flex-1 text-yellow-400 hover:text-yellow-300"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Trash2 />}
                      onClick={() => handleDelete(subscription.id, subscription.service_name)}
                      className="flex-1 text-red-400 hover:text-red-300"
                    >
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card variant="glass" className="text-center py-12">
          <CardContent>
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-white/40" />
            </div>
            <CardTitle className="mb-2">No subscriptions found</CardTitle>
            <p className="text-white/60 mb-6">
              {searchTerm || filterStatus !== 'all' || filterCategory !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Start by adding your first subscription'
              }
            </p>
            <Button
              variant="primary"
              icon={<Plus />}
              onClick={() => setIsAddModalOpen(true)}
            >
              Add Subscription
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Cancellation Assistant */}
      {selectedSubscription && (
        <CancellationAssistant
          subscription={selectedSubscription}
          isOpen={showCancellationAssistant}
          onClose={() => {
            setShowCancellationAssistant(false);
            setSelectedSubscription(null);
          }}
        />
      )}

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Subscription"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <Input
            label="Name"
            value={editForm.name}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            required
          />
          
          <Input
            label="Amount"
            type="number"
            step="0.01"
            value={editForm.amount}
            onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
            required
          />
          
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Billing Cycle
            </label>
            <select
              value={editForm.billing_cycle}
              onChange={(e) => setEditForm({ ...editForm, billing_cycle: e.target.value })}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
          
          <Input
            label="Category"
            value={editForm.category}
            onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
            required
          />
          
          <Input
            label="Next Billing Date"
            type="date"
            value={editForm.next_billing_date}
            onChange={(e) => setEditForm({ ...editForm, next_billing_date: e.target.value })}
            required
          />
          
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Status
            </label>
            <select
              value={editForm.status}
              onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsEditModalOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Subscriptions;