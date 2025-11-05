import React, { useState } from 'react';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { toast } from 'sonner';
import { Mail, Phone, MapPin } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

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
      await axios.post(`${API}/contact`, formData);
      toast.success('Message sent successfully!');
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      
      <section className="section" data-testid="contact-section">
        <h1 className="section-title" data-testid="contact-title">Contact Us</h1>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem', maxWidth: '1000px', margin: '0 auto' }}>
          {/* Contact Info */}
          <div>
            <h2 style={{ color: '#8B1538', marginBottom: '2rem', fontSize: '1.8rem' }}>Get in Touch</h2>
            
            <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'start', gap: '1rem' }}>
              <MapPin size={24} color="#8B1538" />
              <div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Address</h3>
                <p data-testid="contact-address">14/H/94, Indira Gandhi Nagar<br />Jaipur, Rajasthan</p>
              </div>
            </div>
            
            <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'start', gap: '1rem' }}>
              <Phone size={24} color="#8B1538" />
              <div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Phone</h3>
                <p data-testid="contact-phone">+91 98765 43210</p>
              </div>
            </div>
            
            <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'start', gap: '1rem' }}>
              <Mail size={24} color="#8B1538" />
              <div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Email</h3>
                <p data-testid="contact-email">info@anukritiprakashan.com</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#8B1538' }}>Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  data-testid="contact-name-input"
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
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#8B1538' }}>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  data-testid="contact-email-input"
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
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#8B1538' }}>Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="5"
                  data-testid="contact-message-input"
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

              <button
                type="submit"
                disabled={loading}
                data-testid="contact-submit-btn"
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
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;