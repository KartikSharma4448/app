import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Package } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('products'); // 'products' or 'orders'
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    title: '',
    description: '',
    original_price: '',
    sale_price: '',
    image_url: '',
    category: 'Book',
    stock: '100'
  });

  useEffect(() => {
    fetchProducts();
    fetchOrders();
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

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/admin/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    }
  };

  const handleProductFormChange = (e) => {
    setProductForm({
      ...productForm,
      [e.target.name]: e.target.value
    });
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    const productData = {
      ...productForm,
      original_price: parseFloat(productForm.original_price),
      sale_price: productForm.sale_price ? parseFloat(productForm.sale_price) : null,
      stock: parseInt(productForm.stock)
    };

    try {
      if (editingProduct) {
        await axios.put(
          `${API}/admin/products/${editingProduct.id}`,
          productData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Product updated successfully');
      } else {
        await axios.post(
          `${API}/admin/products`,
          productData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Product created successfully');
      }
      
      setShowProductModal(false);
      setEditingProduct(null);
      setProductForm({
        title: '',
        description: '',
        original_price: '',
        sale_price: '',
        image_url: '',
        category: 'Book',
        stock: '100'
      });
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Failed to save product');
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      title: product.title,
      description: product.description,
      original_price: product.original_price.toString(),
      sale_price: product.sale_price ? product.sale_price.toString() : '',
      image_url: product.image_url || '',
      category: product.category,
      stock: product.stock.toString()
    });
    setShowProductModal(true);
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/admin/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Product deleted successfully');
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API}/admin/orders/${orderId}/status?status=${newStatus}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Order status updated');
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
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

  return (
    <div>
      <Navbar />
      
      <section className="section" data-testid="admin-panel-section">
        <h1 className="section-title" data-testid="admin-panel-title">Admin Panel</h1>
        
        {/* Tab Navigation */}
        <div style={{ maxWidth: '1400px', margin: '0 auto 2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button
            onClick={() => setActiveTab('products')}
            data-testid="admin-products-tab"
            style={{
              background: activeTab === 'products' ? '#8B1538' : 'white',
              color: activeTab === 'products' ? 'white' : '#8B1538',
              border: '2px solid #8B1538',
              padding: '1rem 3rem',
              borderRadius: '50px',
              fontSize: '1.1rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Products Management
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            data-testid="admin-orders-tab"
            style={{
              background: activeTab === 'orders' ? '#8B1538' : 'white',
              color: activeTab === 'orders' ? 'white' : '#8B1538',
              border: '2px solid #8B1538',
              padding: '1rem 3rem',
              borderRadius: '50px',
              fontSize: '1.1rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Orders Management
          </button>
        </div>

        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          {/* Products Management */}
          {activeTab === 'products' && (
            <div>
              <div style={{ marginBottom: '2rem', textAlign: 'right' }}>
                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setShowProductModal(true);
                  }}
                  data-testid="add-product-btn"
                  style={{
                    background: '#8B1538',
                    color: 'white',
                    padding: '1rem 2rem',
                    border: 'none',
                    borderRadius: '50px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <Plus size={20} />
                  Add New Product
                </button>
              </div>

              <div style={{ display: 'grid', gap: '1.5rem' }}>
                {products.map(product => (
                  <div
                    key={product.id}
                    data-testid={`admin-product-${product.id}`}
                    style={{
                      background: 'white',
                      padding: '1.5rem',
                      borderRadius: '12px',
                      display: 'grid',
                      gridTemplateColumns: '100px 1fr auto',
                      gap: '1.5rem',
                      alignItems: 'center',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                  >
                    <img
                      src={product.image_url}
                      alt={product.title}
                      style={{ width: '100px', height: '140px', objectFit: 'cover', borderRadius: '8px' }}
                    />
                    
                    <div>
                      <h3 style={{ color: '#8B1538', marginBottom: '0.5rem' }} data-testid="admin-product-title">{product.title}</h3>
                      <p style={{ color: '#666', marginBottom: '0.5rem' }} data-testid="admin-product-category">{product.category}</p>
                      <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>{product.description.substring(0, 100)}...</p>
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <span style={{ fontSize: '1.2rem', fontWeight: '700', color: '#8B1538' }}>₹{product.sale_price || product.original_price}</span>
                        {product.sale_price && (
                          <span style={{ fontSize: '1rem', color: '#999', textDecoration: 'line-through' }}>₹{product.original_price}</span>
                        )}
                        <span style={{ fontSize: '0.9rem', color: '#666' }}>Stock: {product.stock}</span>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleEditProduct(product)}
                        data-testid={`edit-product-${product.id}`}
                        style={{
                          background: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          padding: '0.75rem',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Edit size={20} />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        data-testid={`delete-product-${product.id}`}
                        style={{
                          background: '#dc2626',
                          color: 'white',
                          border: 'none',
                          padding: '0.75rem',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Orders Management */}
          {activeTab === 'orders' && (
            <div>
              {orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem' }}>
                  <Package size={64} color="#999" style={{ marginBottom: '1rem' }} />
                  <p style={{ fontSize: '1.5rem', color: '#666' }}>No orders yet</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                  {orders.map(order => (
                    <div
                      key={order.id}
                      data-testid={`admin-order-${order.id}`}
                      style={{
                        background: 'white',
                        padding: '2rem',
                        borderRadius: '12px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem' }}>
                        <div>
                          <h3 style={{ color: '#8B1538', marginBottom: '0.5rem' }} data-testid="admin-order-id">Order #{order.id.substring(0, 8).toUpperCase()}</h3>
                          <p style={{ color: '#666' }}>{new Date(order.order_date).toLocaleDateString('en-IN')}</p>
                          <p style={{ color: '#666', marginTop: '0.5rem' }}>Total: <strong style={{ color: '#8B1538', fontSize: '1.2rem' }}>₹{order.total_amount}</strong></p>
                        </div>
                        <div>
                          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#8B1538' }}>Order Status</label>
                          <select
                            value={order.status}
                            onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                            data-testid={`admin-order-status-${order.id}`}
                            style={{
                              padding: '0.75rem',
                              border: '2px solid #8B1538',
                              borderRadius: '8px',
                              fontSize: '1rem',
                              fontWeight: '600',
                              color: getStatusColor(order.status),
                              cursor: 'pointer'
                            }}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>

                      <div style={{ borderTop: '2px solid #f0f0f0', paddingTop: '1rem', marginBottom: '1rem' }}>
                        <h4 style={{ color: '#8B1538', marginBottom: '0.75rem' }}>Products</h4>
                        {order.products.map((product, index) => (
                          <div key={index} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span>{product.title} x {product.quantity}</span>
                            <span style={{ fontWeight: '600' }}>₹{product.price * product.quantity}</span>
                          </div>
                        ))}
                      </div>

                      <div style={{ borderTop: '2px solid #f0f0f0', paddingTop: '1rem' }}>
                        <h4 style={{ color: '#8B1538', marginBottom: '0.75rem' }}>Shipping Details</h4>
                        <p><strong>Name:</strong> {order.shipping_address.full_name}</p>
                        <p><strong>Address:</strong> {order.shipping_address.address}, {order.shipping_address.city}, {order.shipping_address.state} - {order.shipping_address.postal_code}</p>
                        <p><strong>Mobile:</strong> {order.shipping_address.mobile_number}</p>
                        <p><strong>Payment:</strong> {order.payment_mode}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Product Modal */}
      {showProductModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '2rem'
          }}
          onClick={() => setShowProductModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '12px',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto'
            }}
          >
            <h2 style={{ color: '#8B1538', marginBottom: '1.5rem' }} data-testid="product-modal-title">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h2>
            
            <form onSubmit={handleProductSubmit}>
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#8B1538' }}>Title</label>
                  <input
                    type="text"
                    name="title"
                    value={productForm.title}
                    onChange={handleProductFormChange}
                    required
                    data-testid="product-title-input"
                    style={{ width: '100%', padding: '0.75rem', border: '2px solid #ddd', borderRadius: '8px', fontSize: '1rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#8B1538' }}>Description</label>
                  <textarea
                    name="description"
                    value={productForm.description}
                    onChange={handleProductFormChange}
                    required
                    rows="3"
                    data-testid="product-description-input"
                    style={{ width: '100%', padding: '0.75rem', border: '2px solid #ddd', borderRadius: '8px', fontSize: '1rem', resize: 'vertical' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#8B1538' }}>Original Price</label>
                    <input
                      type="number"
                      name="original_price"
                      value={productForm.original_price}
                      onChange={handleProductFormChange}
                      required
                      step="0.01"
                      data-testid="product-original-price-input"
                      style={{ width: '100%', padding: '0.75rem', border: '2px solid #ddd', borderRadius: '8px', fontSize: '1rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#8B1538' }}>Sale Price (optional)</label>
                    <input
                      type="number"
                      name="sale_price"
                      value={productForm.sale_price}
                      onChange={handleProductFormChange}
                      step="0.01"
                      data-testid="product-sale-price-input"
                      style={{ width: '100%', padding: '0.75rem', border: '2px solid #ddd', borderRadius: '8px', fontSize: '1rem' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#8B1538' }}>Image URL</label>
                  <input
                    type="url"
                    name="image_url"
                    value={productForm.image_url}
                    onChange={handleProductFormChange}
                    data-testid="product-image-url-input"
                    style={{ width: '100%', padding: '0.75rem', border: '2px solid #ddd', borderRadius: '8px', fontSize: '1rem' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#8B1538' }}>Category</label>
                    <select
                      name="category"
                      value={productForm.category}
                      onChange={handleProductFormChange}
                      required
                      data-testid="product-category-input"
                      style={{ width: '100%', padding: '0.75rem', border: '2px solid #ddd', borderRadius: '8px', fontSize: '1rem' }}
                    >
                      <option value="Book">Book</option>
                      <option value="Magazine">Magazine</option>
                      <option value="Novel">Novel</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#8B1538' }}>Stock</label>
                    <input
                      type="number"
                      name="stock"
                      value={productForm.stock}
                      onChange={handleProductFormChange}
                      required
                      data-testid="product-stock-input"
                      style={{ width: '100%', padding: '0.75rem', border: '2px solid #ddd', borderRadius: '8px', fontSize: '1rem' }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  data-testid="product-modal-cancel-btn"
                  style={{
                    flex: 1,
                    background: '#ddd',
                    color: '#333',
                    padding: '0.75rem',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  data-testid="product-modal-save-btn"
                  style={{
                    flex: 1,
                    background: '#8B1538',
                    color: 'white',
                    padding: '0.75rem',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  {editingProduct ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default AdminPanel;