import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { toast } from 'sonner';
import { Package } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return '#f59e0b';
      case 'Shipped': return '#3b82f6';
      case 'Delivered': return '#16a34a';
      case 'Cancelled': return '#dc2626';
      default: return '#666';
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div style={{ textAlign: 'center', padding: '4rem' }}>Loading orders...</div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      
      <section className="section" data-testid="my-orders-section">
        <h1 className="section-title" data-testid="my-orders-title">My Orders</h1>
        
        {orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <Package size={64} color="#999" style={{ marginBottom: '1rem' }} />
            <p style={{ fontSize: '1.5rem', color: '#666' }} data-testid="no-orders-message">You haven't placed any orders yet</p>
          </div>
        ) : (
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {orders.map(order => (
              <div
                key={order.id}
                data-testid={`order-card-${order.id}`}
                style={{
                  background: 'white',
                  padding: '2rem',
                  borderRadius: '12px',
                  marginBottom: '2rem',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem' }}>
                  <div>
                    <h3 style={{ color: '#8B1538', marginBottom: '0.5rem' }} data-testid="order-id">Order #{order.id.substring(0, 8).toUpperCase()}</h3>
                    <p style={{ color: '#666' }} data-testid="order-date">{new Date(order.order_date).toLocaleDateString('en-IN', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</p>
                  </div>
                  <div style={{
                    background: getStatusColor(order.status),
                    color: 'white',
                    padding: '0.5rem 1.5rem',
                    borderRadius: '20px',
                    fontWeight: '600'
                  }} data-testid="order-status">
                    {order.status}
                  </div>
                </div>

                <div style={{ borderTop: '2px solid #f0f0f0', paddingTop: '1.5rem', marginBottom: '1.5rem' }}>
                  <h4 style={{ color: '#8B1538', marginBottom: '1rem' }}>Products</h4>
                  {order.products.map((product, index) => (
                    <div key={index} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <span data-testid="order-product-title">{product.title} x {product.quantity}</span>
                      <span style={{ fontWeight: '600' }} data-testid="order-product-price">₹{product.price * product.quantity}</span>
                    </div>
                  ))}
                </div>

                <div style={{ borderTop: '2px solid #f0f0f0', paddingTop: '1.5rem', marginBottom: '1.5rem' }}>
                  <h4 style={{ color: '#8B1538', marginBottom: '1rem' }}>Shipping Address</h4>
                  <p data-testid="order-shipping-name">{order.shipping_address.full_name}</p>
                  <p data-testid="order-shipping-address">{order.shipping_address.address}</p>
                  <p>{order.shipping_address.city}, {order.shipping_address.state} - {order.shipping_address.postal_code}</p>
                  <p data-testid="order-shipping-mobile">Mobile: {order.shipping_address.mobile_number}</p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '2px solid #8B1538' }}>
                  <div>
                    <span style={{ fontSize: '1rem', color: '#666' }}>Payment: </span>
                    <span style={{ fontSize: '1.1rem', fontWeight: '600' }} data-testid="order-payment-mode">{order.payment_mode}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '1.1rem', marginRight: '0.5rem' }}>Total: </span>
                    <span style={{ fontSize: '1.5rem', fontWeight: '700', color: '#8B1538' }} data-testid="order-total-amount">₹{order.total_amount}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
};

export default MyOrders;