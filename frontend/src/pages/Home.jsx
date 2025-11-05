import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { BookOpen } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const response = await axios.get(`${API}/products`);
      setFeaturedProducts(response.data.slice(0, 3));
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  return (
    <div>
      <Navbar />
      
      {/* Hero Section */}
      <section className="hero-section" data-testid="hero-section">
        <div className="hero-content">
          <h1 className="hero-title" data-testid="hero-title">
            Welcome to Anukriti Prakashan
          </h1>
          <p className="hero-subtitle" data-testid="hero-subtitle">
            Celebrating over two decades of excellence in Hindi literature.
            Discover stories, poems, novels, and more that inspire generations.
          </p>
          <Link to="/products" className="hero-button" data-testid="explore-products-btn">
            <BookOpen size={20} style={{ display: 'inline', marginRight: '10px', verticalAlign: 'middle' }} />
            Explore Our Collection
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="section" data-testid="featured-section">
        <h2 className="section-title">Featured Publications</h2>
        <div className="products-grid">
          {featuredProducts.map(product => (
            <div key={product.id} className="product-card" data-testid={`featured-product-${product.id}`}>
              <img 
                src={product.image_url} 
                alt={product.title} 
                className="product-image"
                data-testid="product-image"
              />
              <div className="product-details">
                <h3 className="product-title" data-testid="product-title">{product.title}</h3>
                <p className="product-category" data-testid="product-category">{product.category}</p>
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
                <Link to="/products">
                  <button className="add-to-cart-btn" data-testid="view-all-btn">View All Products</button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;