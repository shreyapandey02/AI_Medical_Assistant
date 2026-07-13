from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.user import UserLogin
from app.auth.password import verify_password
from app.utils.jwt import create_access_token


def login_user(db: Session, data: UserLogin):

    # Find user by email
    user = db.query(User).filter(User.email == data.email).first()

    if not user:
        return {"message": "Invalid Email"}

    # Verify password
    if not verify_password(data.password, user.hashed_password):
        return {"message": "Invalid Password"}

    # Generate JWT token
    token = create_access_token(
        data={"sub": user.email}
    )

    return {
        "access_token": token,
        "token_type": "bearer"
    }