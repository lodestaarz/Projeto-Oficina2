/// Modelo para a criação do banco de dados, para definir o nome dos atributos. 

CREATE TABLE IF NOT EXISTS usuarios (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome        VARCHAR(100) NOT NULL,
  email       VARCHAR(255) NOT NULL UNIQUE,
  senha_hash  TEXT,
  google_id   VARCHAR(255) UNIQUE,
  criado_em   TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Toda conta tem pelo menos uma forma de acesso (RF13)
  CONSTRAINT usuario_tem_forma_de_acesso
    CHECK (senha_hash IS NOT NULL OR google_id IS NOT NULL),

  -- E-mails são sempre guardados em minúsculas, então o UNIQUE vale
  -- para qualquer combinação de maiúsculas e minúsculas (RN06)
  CONSTRAINT email_em_minusculas
    CHECK (email = lower(email)),

  CONSTRAINT nome_nao_vazio
    CHECK (length(trim(nome)) > 0)
);
