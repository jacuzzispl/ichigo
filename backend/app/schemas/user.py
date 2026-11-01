#user profile responses
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from dotenv import load_dotenv
import os

load_dotenv()

class UserBase(BaseModel):
    username: str = Field(min_length = 1, max_length = 20)
    email: EmailStr = Field(max_length=120)

class UserRequest(UserBase):
    password: str = Field(min_length = 8)

class UserPublicResponse(BaseModel):
    username: str = Field(min_length = 1, max_length = 20)

class UserPrivateResponse(UserBase):
    pass

class Token(BaseModel):
    access_token: str
    token_type: str


    
