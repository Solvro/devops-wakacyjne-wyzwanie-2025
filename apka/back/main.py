from fastapi import FastAPI
from pydantic import BaseModel

from sqlalchemy import Column, Integer, String, select

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base


from fastapi.middleware.cors import CORSMiddleware

DATABASE_URL = "postgresql+asyncpg://test:test@postgres-service:5432/notes"

engine = create_async_engine(DATABASE_URL, echo=True)
SessionLocal = sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)



Base = declarative_base()

class Note(Base):
    __tablename__ = "notes"
    id = Column(Integer, primary_key=True, index=True)
    text = Column(String, nullable=False)

class PostNote(BaseModel):
    text: str

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*']
)

@app.on_event("startup")
async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


# Endpoint GET
@app.get("/notes")
async def get_posts():
    async with SessionLocal() as session:
        result = await session.execute(select(Note))
        notes = result.scalars().all()
        return notes

# Endpoint POST
@app.post("/notes")
async def create_note(note: PostNote):
    async with SessionLocal() as session:
        new_note = Note(text=note.text)
        session.add(new_note)
        await session.commit()
        await session.refresh(new_note)
        return new_note
