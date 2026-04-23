module.exports = {
  apps: [{
    name: 'orcamento-ultrimagem',
    script: '../venv/Scripts/uvicorn.exe',
    args: 'main:app --host 0.0.0.0 --port 8000',
    interpreter: 'none'
  }]
}