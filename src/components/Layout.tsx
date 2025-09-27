import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { Search, Bell, Plus, Home, CreditCard, BarChart3, Settings, User, Menu, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { useAuthStore } from '../store/authStore';

/**
 * Navigation item interface
 */
interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

/**
 * Main navigation items
 */
const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Subscriptions', href: '/subscriptions', icon: CreditCard },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

/**
 * Main layout component that provides the application structure
 * Features responsive sidebar navigation, header with search, and main content area
 * Implements Apple Liquid Glass design with frosted glass effects and accessibility features
 */
export const Layout: React.FC = () => {
  const location = useLocation();
  const { user } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Skip to main content link for accessibility */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed left-0 top-0 h-full w-64 glass-morphism border-r border-white/10 z-50 transform transition-transform duration-300 lg:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:static lg:transform-none`}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Mobile close button */}
        <div className="lg:hidden flex justify-end p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close navigation menu"
            className="touch-target"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6">
          {/* Logo */}
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-white" aria-hidden="true" />
            </div>
            <h1 className="text-xl font-bold text-white">SubManager</h1>
          </div>

          {/* Navigation */}
          <nav className="space-y-2" role="navigation" aria-label="Primary navigation">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 touch-target focus-visible ${
                    isActive
                      ? 'bg-white/20 text-white border border-white/20'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon className="w-5 h-5" aria-hidden="true" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Profile */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">{user?.name || 'User'}</p>
              <p className="text-xs text-white/60">{user?.email || 'user@example.com'}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Header */}
        <header className="glass-morphism border-b border-white/10 px-4 lg:px-6 py-4" role="banner">
          <div className="flex items-center justify-between">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden touch-target"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </Button>

            {/* Search */}
            <div className="flex-1 max-w-md mx-4 lg:mx-0">
              <Input
                type="text"
                placeholder="Search subscriptions..."
                variant="glass"
                icon={<Search />}
                className="w-full"
                aria-label="Search subscriptions"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2 lg:space-x-4">
              <Button 
                variant="ghost" 
                size="sm"
                aria-label="View notifications"
                className="touch-target"
              >
                <Bell className="w-5 h-5" />
                <span className="sr-only">Notifications</span>
              </Button>
              <Button 
                variant="primary" 
                size="sm"
                className="hidden sm:flex touch-target"
              >
                <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
                Add Subscription
              </Button>
              <Button 
                variant="primary" 
                size="sm"
                className="sm:hidden touch-target"
                aria-label="Add subscription"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main 
          id="main-content"
          className="p-4 lg:p-6"
          role="main"
          tabIndex={-1}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;