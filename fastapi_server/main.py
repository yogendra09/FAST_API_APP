from fastapi import FastAPI, HTTPException, Depends, Header, Query
from kiteconnect import KiteConnect
from pydantic import BaseModel
from database import execute_query, execute_query_many
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional , List
from fastapi.middleware.cors import CORSMiddleware
from config.api import apikey
import random
import httpx
from fastapi.responses import JSONResponse


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Specific origin
    allow_credentials=True,  # Allow cookies and credentials
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all HTTP headers
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY = "your-secret-key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 600



# Define your Pydantic models
class Item(BaseModel):
    name: str
    description: str
    price: float

class User(BaseModel):
    name: str
    email: str
    age: int
    phone: str
    password: str
    
class Token(BaseModel):
    access_token: str
    token_type: str    

class AccessTokenRequest(BaseModel):
    access_token: str

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt   


def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return email
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

def isAuthenticated(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authorization header missing or invalid")
    token = authorization.split(" ")[1]
    email = verify_token(token)
    query = "SELECT id, name, email, age, phone FROM users WHERE email = %s"
    values = (email,)
    user = execute_query(query, values)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user[0] 

# Routes
@app.get("/items")
def get_items():
    query = "SELECT * FROM items"
    try:
        result = execute_query(query, None)
        return result
    except HTTPException as e:
        raise e

@app.post("/items")
def create_item(item: Item):
    query = "INSERT INTO items (name, description, price) VALUES (%s, %s, %s) RETURNING *"
    values = (item.name, item.description, item.price)
    try:
        result = execute_query(query, values)
        return result
    except HTTPException as e:
        raise e

@app.post("/items/bulk")
def create_items_bulk(items: list[Item]):
    query = "INSERT INTO items (name, description, price) VALUES (%s, %s, %s)"
    values = [(item.name, item.description, item.price) for item in items]
    try:
        result = execute_query_many(query, values)
        return {"message": "Bulk insert successful", "result": result}
    except HTTPException as e:
        raise e

@app.delete("/items/{item_id}")
def delete_item(item_id: int):
    query = "DELETE FROM items WHERE id = %s RETURNING *"
    values = (item_id,)
    try:
        result = execute_query(query, values)
        if not result:
            raise HTTPException(status_code=404, detail="Item not found")
        return result
    except HTTPException as e:
        raise e

@app.get("/users")
def get_users():
    query = "SELECT * FROM users"
    try:
        result = execute_query(query, None)
        return result
    except HTTPException as e:
        raise e

@app.post("/signup")
def create_user(user: User):
    hashed_password = get_password_hash(user.password)
    query = "INSERT INTO users (name, age, phone, email, password) VALUES (%s, %s, %s, %s, %s) RETURNING *"
    values = (user.name,user.age,user.phone ,user.email, hashed_password)
    try:
        user = execute_query(query, values)
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user[0]['email']}, expires_delta=access_token_expires
        )
        token_query = "INSERT INTO accesstoken (userId, token) VALUES (%s, %s) RETURNING id, token"
        token_values = (user[0]['id'], access_token)
        execute_query(token_query, token_values)
        return { "user":user, "access_token": access_token, "token_type": "bearer","status":1}
    except HTTPException as e:
        raise e

@app.put("/users/{user_id}")
def update_user(user_id: int, user: User):
    query = """
    UPDATE users SET name = %s, email = %s, password = %s
    WHERE id = %s RETURNING *
    """
    values = (user.name, user.email, user.password, user_id)
    try:
        result = execute_query(query, values)
        if not result:
            raise HTTPException(status_code=404, detail="User not found")
        return result
    except HTTPException as e:
        raise e

@app.delete("/users/{user_id}")
def delete_user(user_id: int):
    query = "DELETE FROM users WHERE id = %s RETURNING *"
    values = (user_id,)
    try:
        result = execute_query(query, values)
        if not result:
            raise HTTPException(status_code=404, detail="User not found")
        return result
    except HTTPException as e:
        raise e

@app.post("/token", response_model=Token)
def login_for_access_token(email: str, password: str):
    query = "SELECT * FROM users WHERE email = %s"
    values = (email,)
    try:
        user = execute_query(query, values)
        if not user or not verify_password(password, user[0]['password']):
            raise HTTPException(
                status_code=401,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user[0]['email']}, expires_delta=access_token_expires
        )
        token_query = "INSERT INTO accesstoken (userId, token) VALUES (%s, %s) RETURNING id, token"
        token_values = (user[0]['id'], access_token)
        execute_query(token_query, token_values)
        return {"access_token": access_token, "token_type": "bearer","status":1}
    except HTTPException as e:
        raise e
    
    
@app.post('/forget-password')
def forget_password(email: str):
    query = "SELECT * FROM users WHERE email = %s"
    values = (email,)
    try:
        user = execute_query(query, values)
        if not user:
            raise HTTPException(
                status_code=404,
                detail="User not found",
            )

        # Generate a 4-digit OTP
        otp = random.randint(1000, 9999)
        access_token_expires = timedelta(minutes=2)
        access_token = create_access_token(
            data={"sub": user[0]['email']}, expires_delta=access_token_expires
        )
        # Update the user's OTP in the database
        update_query = """
        UPDATE users SET otp = %s WHERE email = %s RETURNING *
        """
        update_values = (otp, email)
        updated_user = execute_query(update_query, update_values)

        if not updated_user:
            raise HTTPException(
                status_code=500,
                detail="Failed to update OTP",
            )

        # Send OTP to frontend (returning here for simplicity)
        return {"message": "OTP generated successfully", "otp": otp, "access_token": access_token}

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="An error occurred while processing your request."
        )   
    
@app.post("/currentuser")
def get_current_user_route(current_user: dict = Depends(isAuthenticated)):
    return current_user    

@app.post("/logout")
def logout_user(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authorization header missing or invalid")
    token = authorization.split(" ")[1]
    delete_query = "DELETE FROM accesstoken WHERE token = %s RETURNING id"
    values = (token,)
    try:
        result = execute_query(delete_query, values)
        if not result:
            raise HTTPException(status_code=404, detail="Token not found or already expired")
        return {"message": "Logged out successfully"}
    except HTTPException as e:
        raise e
    
    
        
@app.post('/reset-password')
def reset_password(token: str, otp: int, new_password: str):
    try:
        # Decode token to extract email
        email = verify_token(token)  # This function should return the email if valid
        if not email:
            raise HTTPException(status_code=400, detail="Invalid or expired token")

        # Fetch user by email
        query = "SELECT * FROM users WHERE email = %s"
        user = execute_query(query, (email,))
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Check if user is empty before accessing first element
        if len(user) == 0:
            raise HTTPException(status_code=404, detail="User not found")
        user = user[0]

        # Verify OTP
        if 'otp' not in user or user['otp'] is None or int(user['otp']) != otp:
            raise HTTPException(status_code=400, detail="Invalid OTP")

        # Update password and clear OTP
        hashed_password = get_password_hash(new_password)
        update_query = "UPDATE users SET password = %s, otp = NULL WHERE email = %s RETURNING id"
        result = execute_query(update_query, (hashed_password, email))
        
        if not result or len(result) == 0:
            raise HTTPException(status_code=500, detail="Failed to update password")

        return {"message": "Password updated successfully"}
    
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Unexpected error: {str(e)}")  # Log the unexpected error
        raise HTTPException(status_code=500, detail="An error occurred while processing your request.")
    
    
@app.get("/stocklist")
def get_stock_list(search: str = Query("", min_length=1)) -> List[dict]:

    if search:
        # This will match names that start with or include the search term
        query = """
            SELECT * FROM instruments 
            WHERE (name LIKE %s OR name LIKE %s) 
            AND instrument_type = 'EQ'
           LIMIT 10
           """
        params = (f"{search}%", f"%{search}%")
    else:
        query = """
        SELECT * FROM instruments ORDER BY id ASC LIMIT 10
        """
        params = ()

    result = execute_query(query, params)
    return result


API_KEY = apikey["API_KEY"]
API_SECRET = apikey["API_SECRET"]
REDIRECT_URL = apikey["REDIRECT_URL"]



kite = KiteConnect(api_key=API_KEY)

@app.get("/login")
def get_login_url():
    login_url = kite.login_url()
    return {"login_url": login_url}
    
def save_user_access_token(user_id: str, access_token: str):
    print(user_id, access_token)
    update_query = """UPDATE users SET access_token = %s WHERE id = %s returning * """
    # UPDATE users SET password = %s, otp = NULL WHERE email = %s RETURNING id
    update_values = (access_token, user_id,)
    execute_query(update_query, update_values)

@app.get("/callback")
def generate_access_token(request_token: str,current_user: dict = Depends(isAuthenticated)):
    try:
        # Generate session       
        data = kite.generate_session(request_token, api_secret=API_SECRET)
        access_token = data["access_token"]
        print(access_token,"363")
        save_user_access_token(current_user['id'], access_token)
        kite.set_access_token(access_token)
                
        return {"message": "Authentication Successful", "access_token": access_token}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))    
    
@app.post("/place_order/")
def place_order(
    tradingsymbol: str,
    price: float,
    exchange: str = "NSE",
    transaction_type: str = Query(..., regex="^(BUY|SELL)$"),
    quantity: int = Query(..., gt=0),
    order_type: str = "LIMIT",
    current_user: dict = Depends(isAuthenticated),
):
    try:
        
        query = "SELECT access_token FROM users WHERE email = %s"
        values = (current_user['email'],)
        user = execute_query(query, values)
        access_token = user[0]['access_token']
        print(user[0]['access_token'],tradingsymbol,exchange,transaction_type,quantity,price,order_type)
        if not access_token:
            raise HTTPException(status_code=401, detail="User not authenticated")

        kite.set_access_token(access_token)

        order_id = kite.place_order(
            variety=kite.VARIETY_REGULAR,
            exchange=exchange,
            tradingsymbol=tradingsymbol,
            transaction_type=transaction_type,
            quantity=quantity,
            order_type=order_type,
            product=kite.PRODUCT_MIS,
            price=price
        )
        
        return {"message": "Order placed successfully", "order_id": order_id}
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    

@app.post('/save_access_token')
def save_access_token(access_token: str, current_user: dict = Depends(isAuthenticated)):
    try:
        save_user_access_token(current_user['id'], access_token)
        return {"message": "Access token saved successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    


@app.get("/kite/orders")
async def get_holdings(current_user: dict = Depends(isAuthenticated),):
     query = "SELECT access_token FROM users WHERE email = %s"
     values = (current_user['email'],)
     user = execute_query(query, values)
     access_token = user[0]['access_token']
     print(user[0]['access_token'],)
     if not access_token:
            raise HTTPException(status_code=401, detail="User not authenticated")

     url = "https://api.kite.trade/orders"
     headers = {"Authorization": f"token {apikey['API_KEY']}:{access_token}"}

     async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=headers)

     return JSONResponse(content=response.json())