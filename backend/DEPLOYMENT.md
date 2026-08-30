# Render Deployment Guide for Legal Lens Backend (Flask)

## Overview
This document outlines the deployment configuration for hosting the Legal Lens Flask backend on Render.

## Render Configuration Settings
- **Service Type**: Web Service
- **Environment**: Python 3
- **Root Directory**: `backend`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `gunicorn app:app`

## Environment Variables to Set on Render
Set the following keys under **Environment** in your Render service dashboard:

| Environment Variable | Recommended Value / Description |
|----------------------|---------------------------------|
| `JWT_SECRET`         | A secure random string for JWT token generation |
| `FRONTEND_URL`       | Deployed frontend URL (e.g. `https://your-app.vercel.app`) |
| `FLASK_ENV`          | `production` |
| `PORT`               | `5000` (Render will automatically inject `$PORT` if needed) |

## Health Check Endpoint
- **Path**: `/health` or `/`
- Expected JSON response: `{"status": "ok", "service": "Legal Lens Backend"}`

## ⚠️ Important Note regarding Ollama / LLM Support
- The `ollama` Python package is included in `requirements.txt`.
- **However**, the Ollama server and local model running on `localhost:11434` on your local machine will **NOT** be running inside the Render server instance.
- To use LLM features in live Render production, you should connect to a cloud-hosted LLM API (such as Google Gemini, OpenAI, or a remote Ollama server).
- The existing Ollama code has been preserved so local development continues to work seamlessly without breaking changes.
