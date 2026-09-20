/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { CustomerLayout, CustomerTab } from './components/customer/CustomerLayout';
import { HomePage } from './components/customer/HomePage';
import { MenuPage } from './components/customer/MenuPage';
import { CartPage } from './components/customer/CartPage';
import { CheckoutPage } from './components/customer/CheckoutPage';
import { OrderStatusPage } from './components/customer/OrderStatusPage';
import { OrderHistoryPage } from './components/customer/OrderHistoryPage';
import { ManagerLogin } from './components/manager/ManagerLogin';
import { ManagerLayout, ManagerTab } from './components/manager/ManagerLayout';
import { ManagerDashboard } from './components/manager/ManagerDashboard';
import { ManagerOrders } from './components/manager/ManagerOrders';
import { WalkInPOS } from './components/manager/WalkInPOS';
import { ManagerMenu } from './components/manager/ManagerMenu';
import { ManagerReports } from './components/manager/ManagerReports';
import { ManagerSettings } from './components/manager/ManagerSettings';
import { useRealtimeOrders } from './hooks/useRealtimeOrders';
import { Order } from './types';
import { AIChatStudioModal } from './components/common/AIChatStudioModal';
import { MobileShell } from './components/mobile/MobileShell';

function MainApp() {
  const { isAuthenticated } = useAuth();

  // AI Chat Studio state
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [aiInitialPrompt, setAiInitialPrompt] = useState<string | undefined>(undefined);

  const handleOpenAiChat = (prompt?: string) => {
    setAiInitialPrompt(prompt);
    setAiChatOpen(true);
  };

  // Primary view mode: 'CUSTOMER' | 'MANAGER'
  const [viewMode, setViewMode] = useState<'CUSTOMER' | 'MANAGER'>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.toLowerCase();
      const path = window.location.pathname.toLowerCase();
      if (hash.includes('admin') || hash.includes('manager') || path.includes('admin')) {
        return 'MANAGER';
      }
    }
    return 'CUSTOMER';
  });

  // Listen to browser hash changes so #admin always opens manager view
  React.useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      const path = window.location.pathname.toLowerCase();
      if (hash.includes('admin') || hash.includes('manager') || path.includes('admin')) {
        setViewMode('MANAGER');
      } else if (hash === '' || hash === '#' || hash === '#home') {
        setViewMode('CUSTOMER');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleSwitchToManager = () => {
    window.location.hash = 'admin';
    setViewMode('MANAGER');
  };

  const handleSwitchToCustomer = () => {
    window.location.hash = '';
    setViewMode('CUSTOMER');
  };

  // Customer state
  const [customerTab, setCustomerTab] = useState<CustomerTab>('HOME');
  const [menuInitialCategory, setMenuInitialCategory] = useState<string | undefined>(undefined);
  const [showCheckout, setShowCheckout] = useState(false);
  const [activeTrackingOrder, setActiveTrackingOrder] = useState<Order | null>(null);

  // Manager state
  const [managerTab, setManagerTab] = useState<ManagerTab>('DASHBOARD');

  // Manager real-time orders hook
  const {
    orders,
    refetch,
    newOrderAlert,
    clearAlert,
    soundEnabled,
    setSoundEnabled,
  } = useRealtimeOrders(viewMode === 'MANAGER' && isAuthenticated);

  const pendingOrdersCount = orders.filter((o) => o.status === 'Pending').length;

  // Handlers for customer navigation
  const handleNavigateToMenu = (category?: string) => {
    setMenuInitialCategory(category);
    setShowCheckout(false);
    setActiveTrackingOrder(null);
    setCustomerTab('MENU');
  };

  const handleNavigateToCart = () => {
    setShowCheckout(false);
    setActiveTrackingOrder(null);
    setCustomerTab('CART');
  };

  const handleProceedToCheckout = () => {
    setShowCheckout(true);
  };

  const handleOrderSuccess = (createdOrder: Order) => {
    setShowCheckout(false);
    setActiveTrackingOrder(createdOrder);
    setCustomerTab('ORDERS');
  };

  // If Manager view is active
  if (viewMode === 'MANAGER') {
    if (!isAuthenticated) {
      return (
        <ManagerLogin
          onBackToCustomer={handleSwitchToCustomer}
          onLoginSuccess={handleSwitchToManager}
        />
      );
    }

    return (
      <>
        <ManagerLayout
          activeTab={managerTab}
          onTabChange={(tab) => setManagerTab(tab)}
          onSwitchToCustomer={handleSwitchToCustomer}
          soundEnabled={soundEnabled}
          onToggleSound={() => setSoundEnabled(!soundEnabled)}
          newOrderAlert={newOrderAlert}
          onDismissAlert={clearAlert}
          pendingCount={pendingOrdersCount}
          onOpenAiChat={() => handleOpenAiChat('How can I optimize our menu items or describe specials for Lovely Eatery?')}
        >
          {managerTab === 'DASHBOARD' && (
            <ManagerDashboard
              orders={orders}
              onNavigateTab={(tab) => setManagerTab(tab as ManagerTab)}
              soundEnabled={soundEnabled}
              onToggleSound={() => setSoundEnabled(!soundEnabled)}
            />
          )}
          {managerTab === 'ORDERS' && (
            <ManagerOrders orders={orders} onOrderUpdated={refetch} />
          )}
          {managerTab === 'WALK_IN' && <WalkInPOS />}
          {managerTab === 'MENU' && <ManagerMenu />}
          {managerTab === 'REPORTS' && <ManagerReports />}
          {managerTab === 'SETTINGS' && <ManagerSettings />}
        </ManagerLayout>

        <AIChatStudioModal
          isOpen={aiChatOpen}
          onClose={() => setAiChatOpen(false)}
          initialPrompt={aiInitialPrompt}
        />
      </>
    );
  }

  // Otherwise, Customer view is active
  return (
    <>
      <CustomerLayout
        activeTab={customerTab}
        onTabChange={(tab) => {
          setShowCheckout(false);
          setActiveTrackingOrder(null);
          setCustomerTab(tab);
        }}
        onSwitchToManager={handleSwitchToManager}
        onOpenAiChat={() => handleOpenAiChat()}
      >
        {/* Checkout Screen Overlay */}
        {showCheckout ? (
          <CheckoutPage
            onBack={() => setShowCheckout(false)}
            onOrderSuccess={handleOrderSuccess}
          />
        ) : activeTrackingOrder ? (
          <OrderStatusPage
            initialOrder={activeTrackingOrder}
            onBackToMenu={() => {
              setActiveTrackingOrder(null);
              setCustomerTab('MENU');
            }}
          />
        ) : (
          <>
            {customerTab === 'HOME' && (
              <HomePage
                onNavigateToMenu={handleNavigateToMenu}
                onNavigateToCart={handleNavigateToCart}
                onOpenAiChat={(prompt) => handleOpenAiChat(prompt)}
              />
            )}

            {customerTab === 'MENU' && (
              <MenuPage
                initialCategory={menuInitialCategory}
                onNavigateToCart={handleNavigateToCart}
                onOpenAiChat={(prompt) => handleOpenAiChat(prompt)}
              />
            )}

            {customerTab === 'CART' && (
              <CartPage
                onProceedToCheckout={handleProceedToCheckout}
                onNavigateToMenu={() => handleNavigateToMenu()}
              />
            )}

            {customerTab === 'ORDERS' && (
              <OrderHistoryPage
                onSelectOrder={(ord) => setActiveTrackingOrder(ord)}
                onNavigateToMenu={() => handleNavigateToMenu()}
              />
            )}
          </>
        )}
      </CustomerLayout>

      <AIChatStudioModal
        isOpen={aiChatOpen}
        onClose={() => setAiChatOpen(false)}
        initialPrompt={aiInitialPrompt}
      />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <MobileShell>
          <MainApp />
        </MobileShell>
      </CartProvider>
    </AuthProvider>
  );
}
