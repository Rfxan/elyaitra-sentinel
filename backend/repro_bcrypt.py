import hashlib
from passlib.context import CryptContext
import bcrypt

print(f"Bcrypt version: {bcrypt.__version__}")

try:
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    password = "testpassword123"
    # Pre-hash like in auth.py
    pre_hashed = hashlib.sha256(password.encode()).hexdigest()
    print(f"Pre-hashed length: {len(pre_hashed)}")
    
    hashed = pwd_context.hash(pre_hashed)
    print("Hashing successful")
    
    verified = pwd_context.verify(pre_hashed, hashed)
    print(f"Verification successful: {verified}")
except Exception as e:
    print(f"Caught exception: {type(e).__name__}: {e}")
    import traceback
    traceback.print_exc()
