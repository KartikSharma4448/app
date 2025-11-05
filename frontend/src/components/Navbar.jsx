import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '@/App';
import { ShoppingCart, User, LogOut, Shield } from 'lucide-react';

const Navbar = () => {
  const { user, logout, cartCount } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand" data-testid="navbar-brand">
          अनुकृति प्रकाशन
        </Link>
        <ul className="navbar-menu">
          <li><Link to="/" className="navbar-link" data-testid="nav-home">Home</Link></li>
          <li><Link to="/about" className="navbar-link" data-testid="nav-about">About</Link></li>
          <li><Link to="/products" className="navbar-link" data-testid="nav-products">Products</Link></li>
          <li><Link to="/contact" className="navbar-link" data-testid="nav-contact">Contact</Link></li>
          
          {user ? (
            <>
              <li><Link to="/my-orders" className="navbar-link" data-testid="nav-my-orders">My Orders</Link></li>
              {user.role === 'admin' && (
                <li>
                  <Link to="/admin" className="navbar-link" data-testid="nav-admin">
                    <Shield size={20} style={{ display: 'inline', marginRight: '5px' }} />
                    Admin
                  </Link>
                </li>
              )}
              <li>
                <Link to="/cart" className="navbar-link cart-badge" data-testid="nav-cart">
                  <ShoppingCart size={20} />
                  {cartCount > 0 && <span className="cart-count" data-testid="cart-count">{cartCount}</span>}
                </Link>
              </li>
              <li>
                <button 
                  onClick={handleLogout} 
                  className="navbar-link" 
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#F5E6D3' }}
                  data-testid="nav-logout"
                >
                  <LogOut size={20} />
                </button>
              </li>
            </>
          ) : (
            <li>
              <Link to="/auth" className="navbar-link" data-testid="nav-auth">
                <User size={20} style={{ display: 'inline', marginRight: '5px' }} />
                Login
              </Link>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;