from fastapi import FastAPI


app = FastAPI(
    title="Warehouse Management API",
    description="API for managing warehouses, items, and inventory",
    version="0.1.0",
)


@app.get("/")
async def read_root():
    return {"message": "Welcome to the Warehouse Management API!"}
