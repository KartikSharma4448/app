from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext
import jwt
from bson import ObjectId

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_HOURS = 24

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# ============== MODELS ==============

class UserSignup(BaseModel):
    username: str
    email: Optional[str] = None
    mobile_number: Optional[str] = None
    password: str

class UserLogin(BaseModel):
    identifier: str  # email or mobile
    password: str

class UserResponse(BaseModel):
    id: str
    username: str
    email: Optional[str] = None
    mobile_number: Optional[str] = None
    role: str = "user"

class ProductCreate(BaseModel):
    title: str
    description: str
    original_price: float
    sale_price: Optional[float] = None
    image_url: Optional[str] = None
    category: str  # Book, Magazine, Novel
    stock: int = 100

class ProductResponse(BaseModel):
    id: str
    title: str
    description: str
    original_price: float
    sale_price: Optional[float] = None
    image_url: Optional[str] = None
    category: str
    stock: int

class CartItem(BaseModel):
    product_id: str
    quantity: int

class AddToCart(BaseModel):
    product_id: str
    quantity: int = 1

class ShippingAddress(BaseModel):
    full_name: str
    address: str
    city: str
    state: str
    postal_code: str
    mobile_number: str

class OrderCreate(BaseModel):
    shipping_address: ShippingAddress

class OrderProduct(BaseModel):
    product_id: str
    title: str
    quantity: int
    price: float

class OrderResponse(BaseModel):
    id: str
    user_id: str
    products: List[OrderProduct]
    total_amount: float
    shipping_address: Dict[str, Any]
    payment_mode: str = "COD"
    status: str = "Pending"
    order_date: str

class ContactForm(BaseModel):
    name: str
    email: str
    message: str

# ============== HELPER FUNCTIONS ==============

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
        
        user = await db.users.find_one({"id": user_id})
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Could not validate credentials")

async def get_current_admin(user: dict = Depends(get_current_user)):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

# ============== AUTH ROUTES ==============

@api_router.post("/auth/signup")
async def signup(user_data: UserSignup):
    # Validate that at least email or mobile is provided
    if not user_data.email and not user_data.mobile_number:
        raise HTTPException(status_code=400, detail="Either email or mobile number is required")
    
    # Check if user already exists
    existing_user = None
    if user_data.email:
        existing_user = await db.users.find_one({"email": user_data.email})
    if not existing_user and user_data.mobile_number:
        existing_user = await db.users.find_one({"mobile_number": user_data.mobile_number})
    
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")
    
    # Create new user
    user_id = str(uuid.uuid4())
    hashed_pwd = hash_password(user_data.password)
    
    user_doc = {
        "id": user_id,
        "username": user_data.username,
        "email": user_data.email,
        "mobile_number": user_data.mobile_number,
        "password": hashed_pwd,
        "role": "user",
        "cart": [],
        "addresses": []
    }
    
    await db.users.insert_one(user_doc)
    
    # Create access token
    access_token = create_access_token({"sub": user_id, "role": "user"})
    
    return {
        "message": "User created successfully",
        "access_token": access_token,
        "user": UserResponse(
            id=user_id,
            username=user_data.username,
            email=user_data.email,
            mobile_number=user_data.mobile_number,
            role="user"
        )
    }

@api_router.post("/auth/login")
async def login(login_data: UserLogin):
    # Find user by email or mobile
    user = await db.users.find_one({
        "$or": [
            {"email": login_data.identifier},
            {"mobile_number": login_data.identifier}
        ]
    })
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Verify password
    if not verify_password(login_data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Create access token
    access_token = create_access_token({"sub": user["id"], "role": user["role"]})
    
    return {
        "message": "Login successful",
        "access_token": access_token,
        "user": UserResponse(
            id=user["id"],
            username=user["username"],
            email=user.get("email"),
            mobile_number=user.get("mobile_number"),
            role=user["role"]
        )
    }

@api_router.get("/auth/me")
async def get_me(user: dict = Depends(get_current_user)):
    return UserResponse(
        id=user["id"],
        username=user["username"],
        email=user.get("email"),
        mobile_number=user.get("mobile_number"),
        role=user["role"]
    )

# ============== PRODUCT ROUTES ==============

@api_router.get("/products", response_model=List[ProductResponse])
async def get_products():
    products = await db.products.find({}, {"_id": 0}).to_list(1000)
    return products

@api_router.get("/products/{product_id}", response_model=ProductResponse)
async def get_product(product_id: str):
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@api_router.post("/admin/products", response_model=ProductResponse)
async def create_product(product_data: ProductCreate, admin: dict = Depends(get_current_admin)):
    product_id = str(uuid.uuid4())
    product_doc = {
        "id": product_id,
        **product_data.model_dump()
    }
    await db.products.insert_one(product_doc)
    return ProductResponse(id=product_id, **product_data.model_dump())

@api_router.put("/admin/products/{product_id}", response_model=ProductResponse)
async def update_product(product_id: str, product_data: ProductCreate, admin: dict = Depends(get_current_admin)):
    result = await db.products.update_one(
        {"id": product_id},
        {"$set": product_data.model_dump()}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return ProductResponse(id=product_id, **product_data.model_dump())

@api_router.delete("/admin/products/{product_id}")
async def delete_product(product_id: str, admin: dict = Depends(get_current_admin)):
    result = await db.products.delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted successfully"}

# ============== CART ROUTES ==============

@api_router.get("/cart")
async def get_cart(user: dict = Depends(get_current_user)):
    cart_items = user.get("cart", [])
    
    # Fetch product details for cart items
    cart_with_details = []
    for item in cart_items:
        product = await db.products.find_one({"id": item["product_id"]}, {"_id": 0})
        if product:
            cart_with_details.append({
                "product": product,
                "quantity": item["quantity"]
            })
    
    return {"cart": cart_with_details}

@api_router.post("/cart")
async def add_to_cart(cart_item: AddToCart, user: dict = Depends(get_current_user)):
    # Check if product exists
    product = await db.products.find_one({"id": cart_item.product_id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Update cart
    cart = user.get("cart", [])
    
    # Check if item already in cart
    existing_item = next((item for item in cart if item["product_id"] == cart_item.product_id), None)
    
    if existing_item:
        existing_item["quantity"] += cart_item.quantity
    else:
        cart.append({"product_id": cart_item.product_id, "quantity": cart_item.quantity})
    
    await db.users.update_one(
        {"id": user["id"]},
        {"$set": {"cart": cart}}
    )
    
    return {"message": "Item added to cart"}

@api_router.put("/cart/{product_id}")
async def update_cart_item(product_id: str, quantity: int, user: dict = Depends(get_current_user)):
    cart = user.get("cart", [])
    
    for item in cart:
        if item["product_id"] == product_id:
            if quantity <= 0:
                cart.remove(item)
            else:
                item["quantity"] = quantity
            break
    
    await db.users.update_one(
        {"id": user["id"]},
        {"$set": {"cart": cart}}
    )
    
    return {"message": "Cart updated"}

@api_router.delete("/cart/{product_id}")
async def remove_from_cart(product_id: str, user: dict = Depends(get_current_user)):
    cart = user.get("cart", [])
    cart = [item for item in cart if item["product_id"] != product_id]
    
    await db.users.update_one(
        {"id": user["id"]},
        {"$set": {"cart": cart}}
    )
    
    return {"message": "Item removed from cart"}

# ============== ORDER ROUTES ==============

@api_router.post("/orders", response_model=OrderResponse)
async def create_order(order_data: OrderCreate, user: dict = Depends(get_current_user)):
    cart = user.get("cart", [])
    
    if not cart:
        raise HTTPException(status_code=400, detail="Cart is empty")
    
    # Calculate order details
    order_products = []
    total_amount = 0
    
    for item in cart:
        product = await db.products.find_one({"id": item["product_id"]})
        if product:
            price = product.get("sale_price") or product["original_price"]
            order_products.append({
                "product_id": item["product_id"],
                "title": product["title"],
                "quantity": item["quantity"],
                "price": price
            })
            total_amount += price * item["quantity"]
    
    # Create order
    order_id = str(uuid.uuid4())
    order_doc = {
        "id": order_id,
        "user_id": user["id"],
        "products": order_products,
        "total_amount": total_amount,
        "shipping_address": order_data.shipping_address.model_dump(),
        "payment_mode": "COD",
        "status": "Pending",
        "order_date": datetime.now(timezone.utc).isoformat()
    }
    
    await db.orders.insert_one(order_doc)
    
    # Clear cart
    await db.users.update_one(
        {"id": user["id"]},
        {"$set": {"cart": []}}
    )
    
    return OrderResponse(**order_doc)

@api_router.get("/orders", response_model=List[OrderResponse])
async def get_user_orders(user: dict = Depends(get_current_user)):
    orders = await db.orders.find({"user_id": user["id"]}, {"_id": 0}).to_list(1000)
    return orders

@api_router.get("/admin/orders", response_model=List[OrderResponse])
async def get_all_orders(admin: dict = Depends(get_current_admin)):
    orders = await db.orders.find({}, {"_id": 0}).to_list(1000)
    return orders

@api_router.put("/admin/orders/{order_id}/status")
async def update_order_status(order_id: str, status: str, admin: dict = Depends(get_current_admin)):
    valid_statuses = ["Pending", "Shipped", "Delivered", "Cancelled"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    result = await db.orders.update_one(
        {"id": order_id},
        {"$set": {"status": status}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return {"message": "Order status updated"}

# ============== CONTACT ROUTE ==============

@api_router.post("/contact")
async def submit_contact(contact_data: ContactForm):
    contact_doc = {
        "id": str(uuid.uuid4()),
        "name": contact_data.name,
        "email": contact_data.email,
        "message": contact_data.message,
        "submitted_at": datetime.now(timezone.utc).isoformat()
    }
    await db.contacts.insert_one(contact_doc)
    return {"message": "Message sent successfully"}

# ============== INIT ROUTE ==============

@api_router.post("/init")
async def initialize_data():
    # Check if admin exists
    admin = await db.users.find_one({"role": "admin"})
    if not admin:
        admin_id = str(uuid.uuid4())
        admin_doc = {
            "id": admin_id,
            "username": "Admin",
            "email": "admin@anukriti.com",
            "mobile_number": "9876543210",
            "password": hash_password("Admin@123"),
            "role": "admin",
            "cart": [],
            "addresses": []
        }
        await db.users.insert_one(admin_doc)
    
    # Check if products exist
    product_count = await db.products.count_documents({})
    if product_count == 0:
        sample_products = [
            {
                "id": str(uuid.uuid4()),
                "title": "चाँद गोधूलि का",
                "description": "एक मनमोहक कविता संग्रह जो जीवन की सुंदरता और प्रकृति के रंगों को समेटता है।",
                "original_price": 150.00,
                "sale_price": 75.00,
                "image_url": "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop",
                "category": "Book",
                "stock": 100
            },
            {
                "id": str(uuid.uuid4()),
                "title": "साहित्य सरिता",
                "description": "हिंदी साहित्य की गहराइयों में डूबने वाली मासिक पत्रिका।",
                "original_price": 80.00,
                "sale_price": None,
                "image_url": "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop",
                "category": "Magazine",
                "stock": 200
            },
            {
                "id": str(uuid.uuid4()),
                "title": "रंगीन यादें",
                "description": "जीवन की छोटी-छोटी यादों का खूबसूरत संग्रह।",
                "original_price": 200.00,
                "sale_price": 150.00,
                "image_url": "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=600&fit=crop",
                "category": "Novel",
                "stock": 50
            },
            {
                "id": str(uuid.uuid4()),
                "title": "काव्य कुंज",
                "description": "आधुनिक हिंदी कविताओं का समृद्ध संकलन।",
                "original_price": 120.00,
                "sale_price": None,
                "image_url": "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&h=600&fit=crop",
                "category": "Book",
                "stock": 75
            },
            {
                "id": str(uuid.uuid4()),
                "title": "आत्मकथा: एक सफर",
                "description": "एक प्रेरणादायक आत्मकथा जो जीवन के संघर्षों और सफलता की कहानी बयान करती है।",
                "original_price": 250.00,
                "sale_price": 200.00,
                "image_url": "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&h=600&fit=crop",
                "category": "Book",
                "stock": 60
            },
            {
                "id": str(uuid.uuid4()),
                "title": "यात्रा वृत्तांत",
                "description": "भारत और विदेशों की यात्राओं के रोचक अनुभव।",
                "original_price": 180.00,
                "sale_price": None,
                "image_url": "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400&h=600&fit=crop",
                "category": "Book",
                "stock": 80
            }
        ]
        await db.products.insert_many(sample_products)
    
    return {"message": "Data initialized successfully"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()