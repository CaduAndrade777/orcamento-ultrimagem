@echo off
set PYTHONIOENCODING=utf-8
"%~dp0..\venv\Scripts\python.exe" -m uvicorn main:app --host 0.0.0.0 --port 8000