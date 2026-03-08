# bot/api.py
from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Detox Course API", version="1.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health():
    return {"status": "ok", "service": "detox-api"}

@app.get("/content")
async def get_content():
    # Здесь будет логика из БД (пока заглушка)
    return {
        "hero": {"title": "21-дневный детокс-курс"},
        "author": {},
        "method": {},
        "course": {},
        "cases": [],
        "quiz": [],
        "blocks": {}
    }

# Админские эндпоинты (заглушки)
@app.get("/admin/settings")
async def get_settings():
    return {"primaryColor": "#10b981"}

@app.put("/admin/settings")
async def update_settings(request: Request):
    return {"status": "updated"}

# 404
@app.exception_handler(404)
async def not_found(request, exc):
    return JSONResponse(status_code=404, content={"detail": "Not found"})