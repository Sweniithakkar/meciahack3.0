from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(512), nullable=False)
    role = Column(String(32), default="user", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    documents = relationship("Document", back_populates="user", cascade="all, delete-orphan")
    activity_logs = relationship("ActivityLog", back_populates="user", cascade="all, delete-orphan")

    def to_dict(self, include_password=False):
        d = {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "role": self.role or "user",
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
        if include_password:
            d["password_hash"] = self.password_hash
        return d


class Document(Base):
    __tablename__ = "documents"

    id = Column(String(128), primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    filename = Column(String(512), nullable=False)
    display_name = Column(String(512), nullable=True)
    file_path = Column(String(1024), nullable=True)
    document_hash = Column(String(256), nullable=True)
    file_size = Column(String(64), nullable=True)
    upload_date = Column(String(128), nullable=True)
    status = Column(String(128), nullable=True)
    summary = Column(Text, nullable=True)
    checklist_json = Column(Text, nullable=True)
    risks_json = Column(Text, nullable=True)
    sources_json = Column(Text, nullable=True)
    clauses_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="documents")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "filename": self.filename,
            "display_name": self.display_name,
            "file_path": self.file_path,
            "document_hash": self.document_hash,
            "file_size": self.file_size,
            "upload_date": self.upload_date,
            "status": self.status,
            "summary": self.summary,
            "checklist_json": self.checklist_json,
            "risks_json": self.risks_json,
            "sources_json": self.sources_json,
            "clauses_json": self.clauses_json,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }


class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    action = Column(String(128), nullable=False)
    details = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="activity_logs")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "action": self.action,
            "details": self.details,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
