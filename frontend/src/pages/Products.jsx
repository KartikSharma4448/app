import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { AuthContext } from '@/App';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Products = () => {
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState('All');
  const { fetchCartCount } = useContext(AuthContext);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API}/products`);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    }
  };

  const handleAddToCart = async (productId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to add items to cart');
      return;
    }

    try {
      await axios.post(
        `${API}/cart`,
        { product_id: productId, quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Item added to cart!');
      fetchCartCount();
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart');
    }
  };

  const filteredProducts = filter === 'All' 
    ? products 
    : products.filter(p => p.category === filter);

  return (
    <div>
      <Navbar />
      
      <section className="section" data-testid="products-section">
        <h1 className="section-title" data-testid="products-title">Our Publications</h1>
        
        {/* Filter Buttons */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          {['All', 'Book', 'Magazine', 'Novel'].map(category => (
            <button
              key={category}
              onClick={() => setFilter(category)}
              data-testid={`filter-${category.toLowerCase()}`}
              style={{
                background: filter === category ? '#8B1538' : 'white',
                color: filter === category ? 'white' : '#8B1538',
                border: '2px solid #8B1538',
                padding: '0.75rem 2rem',
                margin: '0 0.5rem',
                borderRadius: '50px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '600',
                transition: 'all 0.3s ease'
              }}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="products-grid">
          {filteredProducts.map(product => (
            <div key={product.id} className="product-card" data-testid={`product-card-${product.id}`}>
              <img 
                src={product.image_url} 
                alt={product.title} 
                className="product-image"
                data-testid="product-image"
              />
              <div className="product-details">
                <h3 className="product-title" data-testid="product-title">{product.title}</h3>
                <p className="product-category" data-testid="product-category">{product.category}</p>
                <p style={{ fontSize: '0.95rem', color: '#666', marginBottom: '1rem' }} data-testid="product-description">
                  {product.description.substring(0, 80)}...
                </p>
                <div className="product-price">
                  {product.sale_price ? (
                    <>
                      <span className="original-price" data-testid="original-price">₹{product.original_price}</span>
                      <span className="sale-price" data-testid="sale-price">₹{product.sale_price}</span>
                    </>
                  ) : (
                    <span className="sale-price" data-testid="sale-price">₹{product.original_price}</span>
                  )}
                </div>
                <button 
                  className="add-to-cart-btn" 
                  onClick={() => handleAddToCart(product.id)}
                  data-testid={`add-to-cart-${product.id}`}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <p style={{ textAlign: 'center', fontSize: '1.2rem', color: '#666' }}>No products found in this category.</p>
        )}
      </section>

      <Footer />
    </div>
  );
};

export default Products;