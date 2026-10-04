-- T37.1 stores extracted text before T37.2 creates embeddings.
ALTER TABLE rag_chunks
  MODIFY embedding JSON NULL,
  MODIFY embedding_model VARCHAR(150) NULL;

-- Enforce duplicate rejection even when simultaneous uploads share a hash.
ALTER TABLE rag_documents
  DROP INDEX idx_rag_documents_file_sha256,
  ADD UNIQUE KEY uq_rag_documents_file_sha256 (file_sha256);
