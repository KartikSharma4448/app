import React from 'react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>अनुकृति प्रकाशन</h3>
          <p>
            Established in 2005, dedicated to promoting Hindi literature and nurturing creative expression.
          </p>
        </div>
        <div className="footer-section">
          <h3>Quick Links</h3>
          <p><a href="/about">About Us</a></p>
          <p><a href="/products">Products</a></p>
          <p><a href="/contact">Contact</a></p>
        </div>
        <div className="footer-section">
          <h3>Contact Info</h3>
          <p>14/H/94, Indira Gandhi Nagar</p>
          <p>Jaipur, Rajasthan</p>
          <p>Phone: +91 98765 43210</p>
          <p>Email: info@anukritiprakashan.com</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2025 Anukriti Prakashan. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;