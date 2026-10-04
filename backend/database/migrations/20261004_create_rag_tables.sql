-- Add the two RAG data tables. Existing MVP tables are not altered.
-- Table creation is idempotent; apply this versioned migration once per database.

CREATE TABLE IF NOT EXISTS rag_documents (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  title VARCHAR(200) NOT NULL,
  description TEXT NULL,
  original_filename VARCHAR(255) NOT NULL,
  file_path VARCHAR(255) NOT NULL,
  file_sha256 CHAR(64) NOT NULL,
  status ENUM('pending', 'processing', 'ready', 'failed') NOT NULL DEFAULT 'pending',
  error_message TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_rag_documents_status (status),
  KEY idx_rag_documents_file_sha256 (file_sha256),
  CONSTRAINT chk_rag_documents_status
    CHECK (status IN ('pending', 'processing', 'ready', 'failed'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS rag_chunks (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  document_id BIGINT UNSIGNED NOT NULL,
  chunk_text MEDIUMTEXT NOT NULL,
  page_number INT UNSIGNED NULL,
  chunk_order INT UNSIGNED NOT NULL,
  embedding JSON NOT NULL,
  embedding_model VARCHAR(150) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_rag_chunks_document_order (document_id, chunk_order),
  CONSTRAINT fk_rag_chunks_document
    FOREIGN KEY (document_id) REFERENCES rag_documents (id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
