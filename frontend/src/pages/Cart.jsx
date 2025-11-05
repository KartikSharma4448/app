import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { AuthContext } from '@/App';
import { toast } from 'sonner';
import { Trash2, Plus, Minus } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Cart = () => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const { fetchCartCount } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/cart`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCart(response.data.cart);
    } catch (error) {
      console.error('Error fetching cart:', error);
      toast.error('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API}/cart/${productId}?quantity=${newQuantity}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchCart();
      fetchCartCount();
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Failed to update quantity');
    }
  };

  const removeItem = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/cart/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Item removed from cart');
      fetchCart();
      fetchCartCount();
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('Failed to remove item');
    }
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      const price = item.product.sale_price || item.product.original_price;
      return total + (price * item.quantity);
    }, 0);
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div style={{ textAlign: 'center', padding: '4rem' }}>Loading cart...</div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      
      <section className="section" data-testid="cart-section">
        <h1 className="section-title" data-testid="cart-title">Shopping Cart</h1>
        
        {cart.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <p style={{ fontSize: '1.5rem', color: '#666', marginBottom: '2rem' }} data-testid="empty-cart-message">Your cart is empty</p>
            <button
              onClick={() => navigate('/products')}
              data-testid="continue-shopping-btn"
              style={{
                background: '#8B1538',
                color: 'white',
                padding: '1rem 3rem',
                border: 'none',
                borderRadius: '50px',
                fontSize: '1.1rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'grid', gap: '2rem' }}>
              {/* Cart Items */}
              <div>
                {cart.map((item, index) => (
                  <div
                    key={item.product.id}
                    data-testid={`cart-item-${item.product.id}`}
                    style={{
                      background: 'white',
                      padding: '1.5rem',
                      borderRadius: '12px',
                      marginBottom: '1rem',
                      display: 'grid',
                      gridTemplateColumns: '120px 1fr auto',
                      gap: '1.5rem',
                      alignItems: 'center',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                  >
                    <img
                      src={item.product.image_url}
                      alt={item.product.title}
                      data-testid="cart-item-image"
                      style={{ width: '120px', height: '160px', objectFit: 'cover', borderRadius: '8px' }}
                    />
                    
                    <div>
                      <h3 style={{ color: '#8B1538', marginBottom: '0.5rem' }} data-testid="cart-item-title">{item.product.title}</h3>
                      <p style={{ color: '#666', marginBottom: '1rem' }} data-testid="cart-item-category">{item.product.category}</p>
                      <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#8B1538' }} data-testid="cart-item-price">
                        ₹{item.product.sale_price || item.product.original_price}
                      </p>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'flex-end' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          data-testid={`decrease-quantity-${item.product.id}`}
                          style={{
                            background: '#8B1538',
                            color: 'white',
                            border: 'none',
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <Minus size={16} />
                        </button>
                        <span style={{ fontSize: '1.2rem', fontWeight: '600', minWidth: '40px', textAlign: 'center' }} data-testid={`cart-item-quantity-${item.product.id}`}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          data-testid={`increase-quantity-${item.product.id}`}
                          style={{
                            background: '#8B1538',
                            color: 'white',
                            border: 'none',
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      
                      <button
                        onClick={() => removeItem(item.product.id)}
                        data-testid={`remove-item-${item.product.id}`}
                        style={{
                          background: '#dc2626',
                          color: 'white',
                          border: 'none',
                          padding: '0.5rem 1rem',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}
                      >
                        <Trash2 size={16} />
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cart Summary */}
              <div style={{
                background: 'white',
                padding: '2rem',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                position: 'sticky',
                top: '100px'
              }}>
                <h2 style={{ color: '#8B1538', marginBottom: '1.5rem' }}>Order Summary</h2>
                <div style={{ borderTop: '2px solid #f0f0f0', paddingTop: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '1.1rem' }}>Subtotal:</span>
                    <span style={{ fontSize: '1.1rem', fontWeight: '600' }} data-testid="cart-subtotal">₹{calculateTotal()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '1.1rem' }}>Shipping:</span>
                    <span style={{ fontSize: '1.1rem', fontWeight: '600', color: '#16a34a' }}>FREE</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '2px solid #f0f0f0' }}>
                    <span style={{ fontSize: '1.3rem', fontWeight: '700' }}>Total:</span>
                    <span style={{ fontSize: '1.5rem', fontWeight: '700', color: '#8B1538' }} data-testid="cart-total">₹{calculateTotal()}</span>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/checkout')}
                  data-testid="proceed-to-checkout-btn"
                  style={{
                    width: '100%',
                    background: '#8B1538',
                    color: 'white',
                    padding: '1rem',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1.2rem',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
};

export default Cart;