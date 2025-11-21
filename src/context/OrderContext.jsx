import React, { createContext, useContext } from 'react';
import useOrders from '../api/hooks/useOrders';
import orderService from '../api/orderService';
import { useAuth } from './AuthContext'; // Import Auth

const OrderContext = createContext(null);

export function OrderProvider({ children }) {
  const { token } = useAuth();
  const { orders, loading, error, refetch } = useOrders({ immediate: true }, token);

  async function createOrder(orderData) {
    try {
      const newOrder = await orderService.createOrder(orderData);
      refetch(); // Refetch orders to include the new one
      return newOrder;
    } catch (err) {
      console.error("Failed to create order", err);
      // Re-throw or handle error as needed for UI feedback
      throw err;
    }
  }

  const value = {
    orders,
    loading,
    error,
    createOrder,
    reload: refetch,
  };

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}

export function useOrdersContext() {
  const ctx = useContext(OrderContext);
  if (!ctx) {
    throw new Error('useOrdersContext must be used within an OrderProvider');
  }
  return ctx;
}

export default OrderContext;
