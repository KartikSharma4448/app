import requests
import sys
import json
from datetime import datetime

class AnukritiEcommerceAPITester:
    def __init__(self, base_url="https://prakashan-ecom.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.user_token = None
        self.admin_token = None
        self.test_user_id = None
        self.test_product_id = None
        self.test_order_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def log_test(self, name, success, details=""):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
            self.failed_tests.append({"test": name, "error": details})

    def make_request(self, method, endpoint, data=None, headers=None, expected_status=200):
        """Make HTTP request and return response"""
        url = f"{self.api_url}/{endpoint}"
        default_headers = {'Content-Type': 'application/json'}
        if headers:
            default_headers.update(headers)

        try:
            if method == 'GET':
                response = requests.get(url, headers=default_headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=default_headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=default_headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=default_headers)

            success = response.status_code == expected_status
            return success, response
        except Exception as e:
            return False, str(e)

    def test_init_data(self):
        """Test data initialization"""
        print("\n🔧 Testing Data Initialization...")
        success, response = self.make_request('POST', 'init', expected_status=200)
        
        if success:
            self.log_test("Data Initialization", True)
            return True
        else:
            self.log_test("Data Initialization", False, f"Status: {response.status_code if hasattr(response, 'status_code') else response}")
            return False

    def test_user_signup(self):
        """Test user signup"""
        print("\n👤 Testing User Authentication...")
        
        # Test user signup
        timestamp = datetime.now().strftime("%H%M%S")
        signup_data = {
            "username": f"testuser_{timestamp}",
            "email": f"test_{timestamp}@example.com",
            "password": "TestPass123!"
        }
        
        success, response = self.make_request('POST', 'auth/signup', signup_data, expected_status=200)
        
        if success:
            data = response.json()
            self.user_token = data.get('access_token')
            self.test_user_id = data.get('user', {}).get('id')
            self.log_test("User Signup", True)
            return True
        else:
            self.log_test("User Signup", False, f"Status: {response.status_code if hasattr(response, 'status_code') else response}")
            return False

    def test_user_login(self):
        """Test user login"""
        # Test with admin credentials
        login_data = {
            "identifier": "admin@anukriti.com",
            "password": "Admin@123"
        }
        
        success, response = self.make_request('POST', 'auth/login', login_data, expected_status=200)
        
        if success:
            data = response.json()
            self.admin_token = data.get('access_token')
            self.log_test("Admin Login", True)
            return True
        else:
            self.log_test("Admin Login", False, f"Status: {response.status_code if hasattr(response, 'status_code') else response}")
            return False

    def test_get_user_profile(self):
        """Test get current user profile"""
        if not self.user_token:
            self.log_test("Get User Profile", False, "No user token available")
            return False
            
        headers = {'Authorization': f'Bearer {self.user_token}'}
        success, response = self.make_request('GET', 'auth/me', headers=headers, expected_status=200)
        
        if success:
            self.log_test("Get User Profile", True)
            return True
        else:
            self.log_test("Get User Profile", False, f"Status: {response.status_code if hasattr(response, 'status_code') else response}")
            return False

    def test_products_api(self):
        """Test products API"""
        print("\n📚 Testing Products API...")
        
        # Test get all products
        success, response = self.make_request('GET', 'products', expected_status=200)
        
        if success:
            products = response.json()
            if len(products) > 0:
                self.test_product_id = products[0]['id']
                self.log_test("Get All Products", True)
                
                # Test get single product
                success2, response2 = self.make_request('GET', f'products/{self.test_product_id}', expected_status=200)
                if success2:
                    self.log_test("Get Single Product", True)
                else:
                    self.log_test("Get Single Product", False, f"Status: {response2.status_code if hasattr(response2, 'status_code') else response2}")
            else:
                self.log_test("Get All Products", False, "No products found")
        else:
            self.log_test("Get All Products", False, f"Status: {response.status_code if hasattr(response, 'status_code') else response}")

    def test_cart_operations(self):
        """Test cart operations"""
        print("\n🛒 Testing Cart Operations...")
        
        if not self.user_token or not self.test_product_id:
            self.log_test("Cart Operations", False, "Missing user token or product ID")
            return False

        headers = {'Authorization': f'Bearer {self.user_token}'}
        
        # Test add to cart
        cart_data = {
            "product_id": self.test_product_id,
            "quantity": 2
        }
        
        success, response = self.make_request('POST', 'cart', cart_data, headers, expected_status=200)
        
        if success:
            self.log_test("Add to Cart", True)
            
            # Test get cart
            success2, response2 = self.make_request('GET', 'cart', headers=headers, expected_status=200)
            if success2:
                cart_data = response2.json()
                if len(cart_data.get('cart', [])) > 0:
                    self.log_test("Get Cart", True)
                    
                    # Test update cart quantity
                    success3, response3 = self.make_request('PUT', f'cart/{self.test_product_id}?quantity=3', headers=headers, expected_status=200)
                    if success3:
                        self.log_test("Update Cart Quantity", True)
                    else:
                        self.log_test("Update Cart Quantity", False, f"Status: {response3.status_code if hasattr(response3, 'status_code') else response3}")
                else:
                    self.log_test("Get Cart", False, "Cart is empty after adding item")
            else:
                self.log_test("Get Cart", False, f"Status: {response2.status_code if hasattr(response2, 'status_code') else response2}")
        else:
            self.log_test("Add to Cart", False, f"Status: {response.status_code if hasattr(response, 'status_code') else response}")

    def test_order_operations(self):
        """Test order operations"""
        print("\n📦 Testing Order Operations...")
        
        if not self.user_token:
            self.log_test("Order Operations", False, "Missing user token")
            return False

        headers = {'Authorization': f'Bearer {self.user_token}'}
        
        # Test create order
        order_data = {
            "shipping_address": {
                "full_name": "Test User",
                "address": "123 Test Street, Test Area",
                "city": "Test City",
                "state": "Test State",
                "postal_code": "123456",
                "mobile_number": "9876543210"
            }
        }
        
        success, response = self.make_request('POST', 'orders', order_data, headers, expected_status=200)
        
        if success:
            order_response = response.json()
            self.test_order_id = order_response.get('id')
            self.log_test("Create Order", True)
            
            # Test get user orders
            success2, response2 = self.make_request('GET', 'orders', headers=headers, expected_status=200)
            if success2:
                orders = response2.json()
                if len(orders) > 0:
                    self.log_test("Get User Orders", True)
                else:
                    self.log_test("Get User Orders", False, "No orders found")
            else:
                self.log_test("Get User Orders", False, f"Status: {response2.status_code if hasattr(response2, 'status_code') else response2}")
        else:
            self.log_test("Create Order", False, f"Status: {response.status_code if hasattr(response, 'status_code') else response}")

    def test_admin_operations(self):
        """Test admin operations"""
        print("\n👑 Testing Admin Operations...")
        
        if not self.admin_token:
            self.log_test("Admin Operations", False, "Missing admin token")
            return False

        headers = {'Authorization': f'Bearer {self.admin_token}'}
        
        # Test create product
        product_data = {
            "title": "Test Book",
            "description": "A test book for API testing",
            "original_price": 100.0,
            "sale_price": 80.0,
            "image_url": "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop",
            "category": "Book",
            "stock": 50
        }
        
        success, response = self.make_request('POST', 'admin/products', product_data, headers, expected_status=200)
        
        if success:
            created_product = response.json()
            created_product_id = created_product.get('id')
            self.log_test("Admin Create Product", True)
            
            # Test update product
            updated_data = {**product_data, "title": "Updated Test Book"}
            success2, response2 = self.make_request('PUT', f'admin/products/{created_product_id}', updated_data, headers, expected_status=200)
            if success2:
                self.log_test("Admin Update Product", True)
                
                # Test delete product
                success3, response3 = self.make_request('DELETE', f'admin/products/{created_product_id}', headers=headers, expected_status=200)
                if success3:
                    self.log_test("Admin Delete Product", True)
                else:
                    self.log_test("Admin Delete Product", False, f"Status: {response3.status_code if hasattr(response3, 'status_code') else response3}")
            else:
                self.log_test("Admin Update Product", False, f"Status: {response2.status_code if hasattr(response2, 'status_code') else response2}")
        else:
            self.log_test("Admin Create Product", False, f"Status: {response.status_code if hasattr(response, 'status_code') else response}")

        # Test get all orders (admin)
        success4, response4 = self.make_request('GET', 'admin/orders', headers=headers, expected_status=200)
        if success4:
            self.log_test("Admin Get All Orders", True)
            
            # Test update order status if we have an order
            if self.test_order_id:
                success5, response5 = self.make_request('PUT', f'admin/orders/{self.test_order_id}/status?status=Shipped', headers=headers, expected_status=200)
                if success5:
                    self.log_test("Admin Update Order Status", True)
                else:
                    self.log_test("Admin Update Order Status", False, f"Status: {response5.status_code if hasattr(response5, 'status_code') else response5}")
        else:
            self.log_test("Admin Get All Orders", False, f"Status: {response4.status_code if hasattr(response4, 'status_code') else response4}")

    def test_contact_form(self):
        """Test contact form submission"""
        print("\n📧 Testing Contact Form...")
        
        contact_data = {
            "name": "Test User",
            "email": "test@example.com",
            "message": "This is a test message from API testing."
        }
        
        success, response = self.make_request('POST', 'contact', contact_data, expected_status=200)
        
        if success:
            self.log_test("Contact Form Submission", True)
        else:
            self.log_test("Contact Form Submission", False, f"Status: {response.status_code if hasattr(response, 'status_code') else response}")

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting Anukriti Prakashan E-commerce API Tests...")
        print(f"🌐 Testing against: {self.base_url}")
        
        # Initialize data first
        if not self.test_init_data():
            print("❌ Failed to initialize data. Stopping tests.")
            return False
        
        # Test authentication
        if not self.test_user_signup():
            print("❌ User signup failed. Some tests may not work.")
        
        if not self.test_user_login():
            print("❌ Admin login failed. Admin tests will be skipped.")
        
        # Test user profile
        self.test_get_user_profile()
        
        # Test products
        self.test_products_api()
        
        # Test cart operations
        self.test_cart_operations()
        
        # Test order operations
        self.test_order_operations()
        
        # Test admin operations
        self.test_admin_operations()
        
        # Test contact form
        self.test_contact_form()
        
        # Print summary
        print(f"\n📊 Test Summary:")
        print(f"Total Tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {len(self.failed_tests)}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        if self.failed_tests:
            print(f"\n❌ Failed Tests:")
            for test in self.failed_tests:
                print(f"  - {test['test']}: {test['error']}")
        
        return len(self.failed_tests) == 0

def main():
    tester = AnukritiEcommerceAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())