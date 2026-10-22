module.exports = {
  apps: [{
    name: 'orcamento-api',
    script: 'C:/orcamento-ultrimagem/venv/Scripts/python.exe',
    args: '-m uvicorn main:app --host 0.0.0.0 --port 8000',
    cwd: 'C:/orcamento-ultrimagem/api',
    env: {
      PYTHONUNBUFFERED: "1"
    }
  }]
}