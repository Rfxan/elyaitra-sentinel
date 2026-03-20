import hashlib
import bcrypt

def hash_password(password: str) -> str:
    # Pre-hash with SHA256 to handle long passwords and maintain consistency
    password_hash = hashlib.sha256(password.encode()).hexdigest().encode()
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password_hash, salt).decode()


def verify_password(password: str, hashed_password: str) -> bool:
    password_hash = hashlib.sha256(password.encode()).hexdigest().encode()
    return bcrypt.checkpw(password_hash, hashed_password.encode())

print(f"Bcrypt version: {bcrypt.__version__}")

try:
    password = "testpassword123"
    print(f"Original password: {password}")
    
    hashed = hash_password(password)
    print(f"Hashed password: {hashed}")
    
    verified = verify_password(password, hashed)
    print(f"Verification successful: {verified}")
    
    # Test long password
    long_pwd = "a" * 100
    hashed_long = hash_password(long_pwd)
    verified_long = verify_password(long_pwd, hashed_long)
    print(f"Long password verification successful: {verified_long}")

except Exception as e:
    print(f"Caught exception: {type(e).__name__}: {e}")
    import traceback
    traceback.print_exc()
