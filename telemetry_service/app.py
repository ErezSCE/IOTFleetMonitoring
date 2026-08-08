"""FastAPI application for telemetry ingestion service."""

from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from .router import router
from .dependencies import init_db_pool, close_db_pool, init_rabbitmq, close_rabbitmq

app = FastAPI(title="Telemetry Ingestion Service")

app.include_router(router)

# Custom validation error handler to return 400 instead of 422
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    return JSONResponse(status_code=400, content={"detail": exc.errors()})

# Startup and shutdown events to manage resources
@app.on_event("startup")
async def startup_event():
    await init_db_pool()
    await init_rabbitmq()

@app.on_event("shutdown")
async def shutdown_event():
    await close_rabbitmq()
    await close_db_pool()
