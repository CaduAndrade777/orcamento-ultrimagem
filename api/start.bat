@echo off
cd /d "C:\orcamento-ultrimagem\api"
"C:\orcamento-ultrimagem\venv\Scripts\python.exe" -m uvicorn main:app --host 0.0.0.0 --port 8000