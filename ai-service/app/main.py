from fastapi import FastAPI
from app.api.routes.evaulate import router as evaluate_router
from app.api.routes.trace import router as trace_router

app = FastAPI()

app.include_router(evaluate_router)
app.include_router(trace_router)