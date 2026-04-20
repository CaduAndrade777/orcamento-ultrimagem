from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import Column, Integer, String, Float
from pydantic import BaseModel
import database

app = FastAPI()

# Permite que seu Front-end acesse o Back-end
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- MODELO DO BANCO DE DADOS (SQLAlchemy) ---
class ProcedimentoDB(database.Base):
    __tablename__ = "procedimentos"
    id = Column(Integer, primary_key=True, index=True)
    categoria = Column(String(100))
    nome = Column(String(255), unique=True)
    particular = Column(Float)
    desconto = Column(Float)
    especial = Column(Float)
    prefeitura = Column(Float)

# Cria a tabela se não existir
database.Base.metadata.create_all(bind=database.engine)

# --- ESQUEMAS DE DADOS (Pydantic para o JSON) ---
class Valores(BaseModel):
    particular: float
    desconto: float
    especial: float
    prefeitura: float

class ProcedimentoRequest(BaseModel):
    categoria: str
    nome: str
    valores: Valores

# --- ROTAS ---

@app.get("/api/procedimentos")
def listar(db: Session = Depends(database.get_db)):
    procs = db.query(ProcedimentoDB).all()
    # Organiza em categorias para o seu front
    resultado = {}
    for p in procs:
        cat = p.categoria.upper()
        if cat not in resultado:
            resultado[cat] = []
        resultado[cat].append({
            "nome": p.nome,
            "valores": {
                "particular": p.particular,
                "desconto": p.desconto,
                "especial": p.especial,
                "prefeitura": p.prefeitura
            }
        })
    return resultado

@app.post("/api/procedimentos")
def salvar(req: ProcedimentoRequest, db: Session = Depends(database.get_db)):
    db_proc = db.query(ProcedimentoDB).filter(ProcedimentoDB.nome == req.nome).first()
    
    if db_proc:
        # Atualiza
        db_proc.categoria = req.categoria
        db_proc.particular = req.valores.particular
        db_proc.desconto = req.valores.desconto
        db_proc.especial = req.valores.especial
        db_proc.prefeitura = req.valores.prefeitura
    else:
        # Cria novo
        novo = ProcedimentoDB(
            categoria=req.categoria,
            nome=req.nome,
            particular=req.valores.particular,
            desconto=req.valores.desconto,
            especial=req.valores.especial,
            prefeitura=req.valores.prefeitura
        )
        db.add(novo)
    
    db.commit()
    return {"status": "sucesso"}