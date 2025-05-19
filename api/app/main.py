from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.middleware import setup_auth_middleware
from app.routers.auth import router as auth_router
from app.routers.inventory import router as inventory_router
from app.routers.item import router as item_router
from app.routers.warehouse import router as warehouse_router

app = FastAPI(
    title="Warehouse Management API",
    description="API for managing warehouses, items, and inventory",
    version="0.1.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

setup_auth_middleware(app)

# Include routers
app.include_router(auth_router)
app.include_router(warehouse_router)
app.include_router(item_router)
app.include_router(inventory_router)


@app.get("/")
async def read_root():
    return {"message": "Welcome to the Warehouse Management API!"}
