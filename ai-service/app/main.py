from fastapi import FastAPI
from app.api.routes.evaulate import router as evaluate_router

app = FastAPI()

app.include_router(evaluate_router)