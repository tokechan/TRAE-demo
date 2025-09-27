import React, { useState } from 'react';
import { User, Bell, Shield, CreditCard, Globe, Moon, Sun, Smartphone, Mail, Lock, Trash2, Save } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import { toast } from 'sonner';

/**
 * Settings page component for user preferences and account management
 * Includes profile settings, notifications, security, and account options
 */
const Settings: React.FC = () => {
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'security' | 'billing' | 'preferences'>('profile');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.email || '', // Using email as fallback since phone is not in User interface
  });
  
  // Notification settings
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    renewalReminders: true,
    priceChangeAlerts: true,
    weeklyReports: false,
    marketingEmails: false,
  });
  
  // Preferences
  const [preferences, setPreferences] = useState({
    theme: 'dark',
    currency: 'USD',
    language: 'en',
    timezone: 'UTC',
  });

  /**
   * Handle profile update
   */
  const handleProfileUpdate = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle notification settings update
   */
  const handleNotificationUpdate = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Notification settings updated!');
    } catch (error) {
      toast.error('Failed to update notification settings');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle account deletion
   */
  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Account deletion initiated. You will receive a confirmation email.');
      setShowDeleteModal(false);
    } catch (error) {
      toast.error('Failed to delete account');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'preferences', label: 'Preferences', icon: Globe },
  ];

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-display text-white mb-2">Settings</h1>
        <p className="text-white/70">Manage your account preferences and settings</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'primary' : 'secondary'}
              size="sm"
              icon={<Icon className="w-4 h-4" />}
              onClick={() => setActiveTab(tab.id as any)}
            >
              {tab.label}
            </Button>
          );
        })}
      </div>

      {/* Profile Settings */}
      {activeTab === 'profile' && (
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-white mb-6">Profile Information</h3>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Full Name</label>
                <Input
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Email Address</label>
                <Input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  placeholder="Enter your email"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Phone Number</label>
              <Input
                type="tel"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                placeholder="Enter your phone number"
              />
            </div>
            <Button
              onClick={handleProfileUpdate}
              loading={loading}
              icon={<Save className="w-4 h-4" />}
            >
              Save Changes
            </Button>
          </div>
        </Card>
      )}

      {/* Notification Settings */}
      {activeTab === 'notifications' && (
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-white mb-6">Notification Preferences</h3>
          <div className="space-y-6">
            {Object.entries(notifications).map(([key, value]) => {
              const labels = {
                emailNotifications: 'Email Notifications',
                pushNotifications: 'Push Notifications',
                renewalReminders: 'Renewal Reminders',
                priceChangeAlerts: 'Price Change Alerts',
                weeklyReports: 'Weekly Reports',
                marketingEmails: 'Marketing Emails',
              };
              
              const descriptions = {
                emailNotifications: 'Receive notifications via email',
                pushNotifications: 'Receive push notifications on your device',
                renewalReminders: 'Get reminded before subscriptions renew',
                priceChangeAlerts: 'Be notified when subscription prices change',
                weeklyReports: 'Receive weekly spending reports',
                marketingEmails: 'Receive promotional emails and updates',
              };
              
              return (
                <div key={key} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div>
                    <h4 className="font-medium text-white">
                      {labels[key as keyof typeof labels]}
                    </h4>
                    <p className="text-sm text-white/60">
                      {descriptions[key as keyof typeof descriptions]}
                    </p>
                  </div>
                  <button
                    onClick={() => setNotifications({ ...notifications, [key]: !value })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      value ? 'bg-blue-600' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        value ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              );
            })}
            <Button
              onClick={handleNotificationUpdate}
              loading={loading}
              icon={<Save className="w-4 h-4" />}
            >
              Save Preferences
            </Button>
          </div>
        </Card>
      )}

      {/* Security Settings */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-white mb-6">Password & Security</h3>
            <div className="space-y-4">
              <Button
                variant="secondary"
                icon={<Lock className="w-4 h-4" />}
                onClick={() => toast.info('Password reset email sent!')}
              >
                Change Password
              </Button>
              <Button
                variant="secondary"
                icon={<Smartphone className="w-4 h-4" />}
                onClick={() => toast.info('Two-factor authentication setup coming soon!')}
              >
                Enable Two-Factor Authentication
              </Button>
            </div>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-white mb-6">Account Actions</h3>
            <div className="space-y-4">
              <Button
                variant="secondary"
                onClick={() => logout()}
              >
                Sign Out
              </Button>
              <Button
                variant="danger"
                icon={<Trash2 className="w-4 h-4" />}
                onClick={() => setShowDeleteModal(true)}
              >
                Delete Account
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Billing Settings */}
      {activeTab === 'billing' && (
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-white mb-6">Billing Information</h3>
          <div className="space-y-6">
            <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <h4 className="font-medium text-blue-400 mb-2">Current Plan</h4>
              <p className="text-white/70">Free Plan - No billing information required</p>
            </div>
            <div className="space-y-4">
              <Button
                variant="primary"
                icon={<CreditCard className="w-4 h-4" />}
                onClick={() => toast.info('Upgrade options coming soon!')}
              >
                Upgrade to Premium
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Preferences */}
      {activeTab === 'preferences' && (
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-white mb-6">App Preferences</h3>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Theme</label>
                <select
                  value={preferences.theme}
                  onChange={(e) => setPreferences({ ...preferences, theme: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                  <option value="auto">Auto</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Currency</label>
                <select
                  value={preferences.currency}
                  onChange={(e) => setPreferences({ ...preferences, currency: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="JPY">JPY (¥)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Language</label>
                <select
                  value={preferences.language}
                  onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                  <option value="ja">日本語</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Timezone</label>
                <select
                  value={preferences.timezone}
                  onChange={(e) => setPreferences({ ...preferences, timezone: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                  <option value="Europe/London">London</option>
                  <option value="Europe/Paris">Paris</option>
                  <option value="Asia/Tokyo">Tokyo</option>
                </select>
              </div>
            </div>
            <Button
              onClick={() => toast.success('Preferences saved!')}
              icon={<Save className="w-4 h-4" />}
            >
              Save Preferences
            </Button>
          </div>
        </Card>
      )}

      {/* Delete Account Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Account"
      >
        <div className="space-y-4">
          <p className="text-white/70">
            Are you sure you want to delete your account? This action cannot be undone and will permanently remove all your data.
          </p>
          <div className="flex gap-3 justify-end">
            <Button
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              loading={loading}
              onClick={handleDeleteAccount}
            >
              Delete Account
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Settings;