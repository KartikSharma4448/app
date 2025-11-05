import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '@/App';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    mobile_number: '',
    password: '',
    identifier: '' // for login
  });
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // Login
        const response = await axios.post(`${API}/auth/login`, {
          identifier: formData.identifier,
          password: formData.password
        });
        login(response.data.user, response.data.access_token);
        toast.success('Login successful!');
        navigate('/');
      } else {
        // Signup
        if (!formData.email && !formData.mobile_number) {
          toast.error('Please provide either email or mobile number');
          setLoading(false);
          return;
        }
        
        const response = await axios.post(`${API}/auth/signup`, {
          username: formData.username,
          email: formData.email || null,
          mobile_number: formData.mobile_number || null,
          password: formData.password
        });
        login(response.data.user, response.data.access_token);
        toast.success('Account created successfully!');
        navigate('/');
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast.error(error.response?.data?.detail || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      
      <section className="section" data-testid="auth-section">
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
          <div style={{ 
            background: 'white', 
            padding: '3rem', 
            borderRadius: '12px', 
            boxShadow: '0 4px 20px rgba(139, 21, 56, 0.15)' 
          }}>
            <h1 style={{ textAlign: 'center', color: '#8B1538', marginBottom: '2rem', fontSize: '2rem' }} data-testid="auth-title">
              {isLogin ? 'Login' : 'Sign Up'}
            </h1>

            <form onSubmit={handleSubmit}>
              {!isLogin && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#8B1538' }}>Username</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    data-testid="auth-username-input"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '1rem'
                    }}
                  />
                </div>
              )}

              {isLogin ? (
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#8B1538' }}>Email or Mobile Number</label>
                  <input
                    type="text"
                    name="identifier"
                    value={formData.identifier}
                    onChange={handleChange}
                    required
                    data-testid="auth-identifier-input"
                    placeholder="Enter email or mobile number"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '1rem'
                    }}
                  />
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#8B1538' }}>Email (optional)</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      data-testid="auth-email-input"
                      placeholder="your@email.com"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '2px solid #ddd',
                        borderRadius: '8px',
                        fontSize: '1rem'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#8B1538' }}>Mobile Number (optional)</label>
                    <input
                      type="tel"
                      name="mobile_number"
                      value={formData.mobile_number}
                      onChange={handleChange}
                      data-testid="auth-mobile-input"
                      placeholder="9876543210"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '2px solid #ddd',
                        borderRadius: '8px',
                        fontSize: '1rem'
                      }}
                    />
                    <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.25rem' }}>* Provide at least one: email or mobile</p>
                  </div>
                </>
              )}

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#8B1538' }}>Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  data-testid="auth-password-input"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                data-testid="auth-submit-btn"
                style={{
                  width: '100%',
                  background: '#8B1538',
                  color: 'white',
                  padding: '1rem',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  marginBottom: '1rem'
                }}
              >
                {loading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
              </button>

              <div style={{ textAlign: 'center' }}>
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  data-testid="auth-toggle-btn"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#8B1538',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    fontSize: '1rem'
                  }}
                >
                  {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Login'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Auth;