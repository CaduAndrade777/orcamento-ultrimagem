from sqlalchemy import Column, Integer, String, Float
from .database import Base

class ProcedimentoDB(Base):
    __tablename__ = "procedimentos"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(255), unique=True, index=True)
    categoria = Column(String(100))
    valor_particular = Column(Float)
    valor_desconto = Column(Float)
    valor_especial = Column(Float)
    valor_prefeitura = Column(Float)