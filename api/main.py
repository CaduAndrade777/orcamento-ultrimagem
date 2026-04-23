from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles 
from fastapi.responses import FileResponse   
from pydantic import BaseModel
from typing import Dict
import urllib.parse
import pymysql
import pymysql.cursors
import os
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.abspath(os.path.join(CURRENT_DIR, ".."))

print(f"\n--- SISTEMA ULTRIMAGEM CONECTADO ---")
print(f"Diretório Raiz: {BASE_DIR}")
print(f"---------------------------------------\n")

def get_db_connection():
    try:
        conn = pymysql.connect(
            host="127.0.0.1", 
            user="root",        
            password="Admin@ultri", 
            database="OrcaUltri_db",
            connect_timeout=10,
            cursorclass=pymysql.cursors.DictCursor
        )
        return conn
    except Exception as e:
        print(f" ERRO NO MYSQL: {e}")
        return None

class ProcedimentoSchema(BaseModel):
    categoria: str
    nome: str
    valores: Dict[str, float]

@app.post("/api/procedimentos")
async def salvar_procedimento(proc: ProcedimentoSchema):
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Banco desligado")
    try:
        with conn.cursor() as cursor:
            # SQL AJUSTADO COM OS NOMES REAIS DAS COLUNAS
            sql = """
                INSERT INTO procedimentos 
                (categoria, nome, particular, desconto, especial, prefeitura)
                VALUES (%s, %s, %s, %s, %s, %s)
                ON DUPLICATE KEY UPDATE 
                categoria=VALUES(categoria), 
                particular=VALUES(particular), 
                desconto=VALUES(desconto), 
                especial=VALUES(especial), 
                prefeitura=VALUES(prefeitura)
            """
            vals = (
                proc.categoria.upper(), proc.nome, 
                proc.valores.get('particular', 0), proc.valores.get('desconto', 0), 
                proc.valores.get('especial', 0), proc.valores.get('prefeitura', 0)
            )
            cursor.execute(sql, vals)
        conn.commit()
        print(f" Sucesso: {proc.nome} salvo.")
        return {"status": "success"}
    except Exception as e:
        print(f"❌ ERRO AO SALVAR: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

@app.get("/api/procedimentos")
async def listar_procedimentos():
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Banco desligado")
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM procedimentos ORDER BY categoria, nome")
            exames = cursor.fetchall()
            
            resultado = {}
            for exame in exames:
                cat = exame['categoria'].upper()
                if cat not in resultado:
                    resultado[cat] = []
                resultado[cat].append({
                    "nome": exame['nome'],
                    "valores": {
                        "particular": float(exame['particular']),
                        "desconto": float(exame['desconto']),
                        "especial": float(exame['especial']),
                        "prefeitura": float(exame['prefeitura'])
                    }
                })
            return resultado
    except Exception as e:
        print(f"❌ ERRO AO LISTAR: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

@app.delete("/api/procedimentos/{nome}")
async def excluir_procedimento(nome: str):
    nome_real = urllib.parse.unquote(nome)
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Banco desligado")
    try:
        with conn.cursor() as cursor:
            cursor.execute("DELETE FROM procedimentos WHERE nome = %s", (nome_real,))
        conn.commit()
        return {"status": "success"}
    except Exception as e:
        print(f"❌ ERRO AO EXCLUIR: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

for folder in ["css", "js", "src"]:
    path = os.path.join(BASE_DIR, folder)
    if os.path.exists(path):
        app.mount(f"/{folder}", StaticFiles(directory=path), name=folder)

@app.get("/")
async def read_index():
    index_path = os.path.join(BASE_DIR, 'index.html')
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return {"error": "index.html nao encontrado"}