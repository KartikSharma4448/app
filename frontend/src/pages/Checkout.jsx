import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { AuthContext } from '@/App';
import { toast } from 'sonner';
import { CreditCard } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Checkout = () => {
  const [cart, setCart] = useState([]);
  const [step, setStep] = useState(1); // 1: Shipping, 2: Payment, 3: Confirmation
  const [loading, setLoading] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    full_name: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    mobile_number: ''
  });
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
    }
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      const price = item.product.sale_price || item.product.original_price;
      return total + (price * item.quantity);
    }, 0);
  };

  const handleInputChange = (e) => {
    setShippingAddress({
      ...shippingAddress,
      [e.target.name]: e.target.value
    });
  };

  const handleShippingSubmit = (e) => {
    e.preventDefault();
    setStep(2);
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API}/orders`,
        { shipping_address: shippingAddress },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Order placed successfully!');
      fetchCartCount();
      setStep(3);
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      
      <section className="section" data-testid="checkout-section">
        <h1 className="section-title" data-testid="checkout-title">Checkout</h1>
        
        {/* Progress Steps */}
        <div style={{ 
          maxWidth: '800px', 
          margin: '0 auto 3rem', 
          display: 'flex', 
          justifyContent: 'space-between',
          position: 'relative'
        }}>
          {[1, 2, 3].map(num => (
            <div key={num} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                background: step >= num ? '#8B1538' : '#ddd',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                fontWeight: '700',
                marginBottom: '0.5rem'
              }}>
                {num}
              </div>
              <span style={{ fontSize: '0.9rem', color: step >= num ? '#8B1538' : '#999' }}>
                {num === 1 ? 'Shipping' : num === 2 ? 'Payment' : 'Confirmation'}
              </span>
            </div>
          ))}
          <div style={{
            position: 'absolute',
            top: '25px',
            left: '10%',
            right: '10%',
            height: '2px',
            background: '#ddd',
            zIndex: 1
          }}>
            <div style={{
              height: '100%',
              background: '#8B1538',
              width: step === 1 ? '0%' : step === 2 ? '50%' : '100%',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>

        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {/* Step 1: Shipping Address */}
          {step === 1 && (
            <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
              <h2 style={{ color: '#8B1538', marginBottom: '1.5rem' }}>Shipping Address</h2>
              <form onSubmit={handleShippingSubmit}>
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#8B1538' }}>Full Name</label>
                    <input
                      type="text"
                      name="full_name"
                      value={shippingAddress.full_name}
                      onChange={handleInputChange}
                      required
                      data-testid="shipping-full-name"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '2px solid #ddd',
                        borderRadius: '8px',
                        fontSize: '1rem'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#8B1538' }}>Address</label>
                    <textarea
                      name="address"
                      value={shippingAddress.address}
                      onChange={handleInputChange}
                      required
                      rows="3"
                      data-testid="shipping-address"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '2px solid #ddd',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        resize: 'vertical'
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#8B1538' }}>City</label>
                      <input
                        type="text"
                        name="city"
                        value={shippingAddress.city}
                        onChange={handleInputChange}
                        required
                        data-testid="shipping-city"
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '2px solid #ddd',
                          borderRadius: '8px',
                          fontSize: '1rem'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#8B1538' }}>State</label>
                      <input
                        type="text"
                        name="state"
                        value={shippingAddress.state}
                        onChange={handleInputChange}
                        required
                        data-testid="shipping-state"
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '2px solid #ddd',
                          borderRadius: '8px',
                          fontSize: '1rem'
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#8B1538' }}>Postal Code</label>
                      <input
                        type="text"
                        name="postal_code"
                        value={shippingAddress.postal_code}
                        onChange={handleInputChange}
                        required
                        data-testid="shipping-postal-code"
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '2px solid #ddd',
                          borderRadius: '8px',
                          fontSize: '1rem'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#8B1538' }}>Mobile Number</label>
                      <input
                        type="tel"
                        name="mobile_number"
                        value={shippingAddress.mobile_number}
                        onChange={handleInputChange}
                        required
                        data-testid="shipping-mobile"
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '2px solid #ddd',
                          borderRadius: '8px',
                          fontSize: '1rem'
                        }}
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  data-testid="proceed-to-payment-btn"
                  style={{
                    width: '100%',
                    background: '#8B1538',
                    color: 'white',
                    padding: '1rem',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1.2rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    marginTop: '2rem'
                  }}
                >
                  Proceed to Payment
                </button>
              </form>
            </div>
          )}

          {/* Step 2: Payment */}
          {step === 2 && (
            <div>
              <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
                <h2 style={{ color: '#8B1538', marginBottom: '1.5rem' }}>Payment Method</h2>
                <div style={{
                  border: '2px solid #8B1538',
                  borderRadius: '8px',
                  padding: '1.5rem',
                  background: '#FFF9F5'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <CreditCard size={32} color="#8B1538" />
                    <div>
                      <h3 style={{ color: '#8B1538', marginBottom: '0.5rem' }}>Cash on Delivery (COD)</h3>
                      <p style={{ color: '#666' }}>Pay when you receive your order</p>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                <h2 style={{ color: '#8B1538', marginBottom: '1.5rem' }}>Order Summary</h2>
                {cart.map(item => (
                  <div key={item.product.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #f0f0f0' }}>
                    <span data-testid="order-item-title">{item.product.title} x {item.quantity}</span>
                    <span style={{ fontWeight: '600' }} data-testid="order-item-price">₹{(item.product.sale_price || item.product.original_price) * item.quantity}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '1rem', marginTop: '1rem', borderTop: '2px solid #8B1538' }}>
                  <span style={{ fontSize: '1.3rem', fontWeight: '700' }}>Total:</span>
                  <span style={{ fontSize: '1.5rem', fontWeight: '700', color: '#8B1538' }} data-testid="order-total">₹{calculateTotal()}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button
                  onClick={() => setStep(1)}
                  data-testid="back-to-shipping-btn"
                  style={{
                    flex: 1,
                    background: '#ddd',
                    color: '#333',
                    padding: '1rem',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Back
                </button>
                <button
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  data-testid="place-order-btn"
                  style={{
                    flex: 2,
                    background: '#8B1538',
                    color: 'white',
                    padding: '1rem',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1.2rem',
                    fontWeight: '700',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.7 : 1
                  }}
                >
                  {loading ? 'Placing Order...' : 'Place Order'}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Confirmation */}
          {step === 3 && (
            <div style={{ background: 'white', padding: '3rem', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', textAlign: 'center' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
              <h2 style={{ color: '#16a34a', marginBottom: '1rem', fontSize: '2rem' }} data-testid="order-success-title">Order Placed Successfully!</h2>
              <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '2rem' }} data-testid="order-success-message">
                Thank you for your order. Your items will be delivered soon.
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button
                  onClick={() => navigate('/my-orders')}
                  data-testid="view-orders-btn"
                  style={{
                    background: '#8B1538',
                    color: 'white',
                    padding: '1rem 2rem',
                    border: 'none',
                    borderRadius: '50px',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  View My Orders
                </button>
                <button
                  onClick={() => navigate('/')}
                  data-testid="continue-shopping-home-btn"
                  style={{
                    background: '#ddd',
                    color: '#333',
                    padding: '1rem 2rem',
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
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Checkout;