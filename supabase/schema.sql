-- Esquema de persistencia para el Test de Personalidad y Liderazgo (Gaman Global)
-- Ejecutar una sola vez en: Supabase Dashboard > SQL Editor > New query
--
-- Reemplaza a la tabla plana "respuestas_candidatos" usada en versiones anteriores.
-- Diseno pensado para: (a) historico consultable por candidato, (b) cumplimiento
-- basico Ley 19.628 (datos sensibles con acceso restringido), (c) trazabilidad.

create extension if not exists "pgcrypto";

-- Un candidato puede rendir mas de una evaluacion en el tiempo (historico).
create table if not exists candidatos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  correo text not null,
  rut text,
  created_at timestamptz not null default now(),
  unique (correo)
);

-- Ficha de cargo: puntajes minimos aceptables por dimension, definidos por el
-- evaluador desde /admin, para comparar contra el candidato real.
create table if not exists perfiles_deseados (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,               -- ej: "Gerente Comercial - Perfil Ideal"
  cargo text,
  puntajes_minimos jsonb not null,    -- { [dimension]: minimo 0-100 } solo para las dimensiones relevantes
  temperamento_preferido text,        -- opcional: colerico | sanguineo | flematico | melancolico
  created_at timestamptz not null default now()
);

-- Link de invitacion generado desde /admin, ligado a un perfil deseado
-- especifico (o sin perfil, si solo se quiere el analisis sin comparacion).
create table if not exists invitaciones (
  id uuid primary key default gen_random_uuid(),
  token text unique not null,
  perfil_id uuid references perfiles_deseados(id) on delete set null,
  cargo text,
  usado boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists evaluaciones (
  id uuid primary key default gen_random_uuid(),
  candidato_id uuid not null references candidatos(id) on delete cascade,
  cargo_postulado text not null,
  token text unique,
  motor_ia text not null default 'groq',
  perfil_id uuid references perfiles_deseados(id) on delete set null,

  respuestas jsonb not null,          -- array de { pregunta, respuesta }
  puntajes jsonb,                     -- dimensiones -> puntaje 0-100 (ver lib/scoring.ts)
  nivel_liderazgo text,               -- 'operativo' | 'estrategico' | 'no_concluyente'
  alertas jsonb,                      -- lista de alertas de estabilidad emocional / riesgo
  indice_deseabilidad_social numeric, -- 0-100, heuristico + evaluacion de la IA
  analisis_ia text,                   -- informe narrativo generado por la IA
  resumen_ejecutivo text,              -- sintesis de 3-5 frases para lectura rapida
  analisis_cualitativo jsonb,          -- { miedosNucleares, patronesRepetitivos, temperamento, patronesCognitivosSensoriales }
  compatibilidad_pct numeric,          -- 0-100, solo si la evaluacion estaba ligada a un perfil_id
  compatibilidad_detalle jsonb,        -- desglose por dimension (minimo vs obtenido)
  escalas_validadas jsonb,             -- resultados TIPI/WLEIS/BRS/CBI/MC-SDS-13 (ver lib/liderazgo/escalas.ts)
  hipotesis jsonb,                     -- [{ hipotesis, pregunta_entrevista }]

  consentimiento_datos boolean not null default false,
  consentimiento_fecha timestamptz,

  pdf_generado_en timestamptz,
  created_at timestamptz not null default now()
);

-- Si la tabla ya existia de una version anterior de este esquema, agrega las
-- columnas nuevas sin perder los datos existentes.
alter table evaluaciones add column if not exists analisis_cualitativo jsonb;
alter table evaluaciones add column if not exists resumen_ejecutivo text;
alter table evaluaciones add column if not exists perfil_id uuid references perfiles_deseados(id) on delete set null;
alter table evaluaciones add column if not exists compatibilidad_pct numeric;
alter table evaluaciones add column if not exists compatibilidad_detalle jsonb;
alter table evaluaciones add column if not exists escalas_validadas jsonb;
alter table evaluaciones add column if not exists hipotesis jsonb;

create index if not exists idx_evaluaciones_candidato on evaluaciones(candidato_id);
create index if not exists idx_evaluaciones_created_at on evaluaciones(created_at);
create index if not exists idx_invitaciones_token on invitaciones(token);

-- =========================================================================
-- MODULO CLINICO (Test Psicologico para pacientes) — completamente separado
-- de las tablas de RRHH de arriba. Datos de salud sensibles bajo Ley 19.628
-- y Ley 20.584. Se administra siempre desde /api/psicologico/submit con
-- service_role; no hay policies para "anon" en ninguna de estas tablas.
-- =========================================================================

create table if not exists pacientes (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  correo text not null,
  created_at timestamptz not null default now(),
  unique (correo)
);

create table if not exists invitaciones_psicologicas (
  id uuid primary key default gen_random_uuid(),
  token text unique not null,
  motivo_consulta text,
  usado boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists evaluaciones_psicologicas (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid not null references pacientes(id) on delete cascade,
  token text unique,
  motor_ia text not null default 'groq',
  motivo_consulta text,

  respuestas jsonb not null,           -- array de { pregunta, respuesta }
  evento_indice_pcl5 text,             -- evento de referencia identificado via LEC-5 para el PCL-5
  escalas jsonb not null,               -- resultados PHQ9/GAD7/PCL5/ASRS/AQ10/AUDIT-C/MDQ/SCOFF
  riesgo_detectado boolean not null default false,
  riesgo_detalle jsonb,                -- palabras/frases de riesgo detectadas en texto libre

  resumen_clinico text,
  miedos_nucleares jsonb,
  patrones_repetitivos text,
  temperamento jsonb,                  -- { dominante, justificacion } — marco narrativo, no validado
  observaciones_somaticas text,
  factores_protectores jsonb,
  puntos_atencion_clinica jsonb,
  hipotesis_clinicas jsonb,             -- [{ hipotesis, pregunta_sesion }]

  consentimiento_datos boolean not null default false,
  consentimiento_fecha timestamptz,

  created_at timestamptz not null default now()
);

alter table evaluaciones_psicologicas add column if not exists hipotesis_clinicas jsonb;
alter table evaluaciones_psicologicas add column if not exists evento_indice_pcl5 text;
alter table evaluaciones_psicologicas add column if not exists factores_protectores jsonb;

create index if not exists idx_evaluaciones_psicologicas_paciente on evaluaciones_psicologicas(paciente_id);
create index if not exists idx_evaluaciones_psicologicas_created_at on evaluaciones_psicologicas(created_at);
create index if not exists idx_invitaciones_psicologicas_token on invitaciones_psicologicas(token);

alter table pacientes enable row level security;
alter table invitaciones_psicologicas enable row level security;
alter table evaluaciones_psicologicas enable row level security;

-- Sin policies para "anon": todo el modulo clinico opera exclusivamente con
-- service_role desde el servidor.

-- Log de errores del sistema, visible solo para administradores (service_role).
create table if not exists errores_sistema (
  id uuid primary key default gen_random_uuid(),
  origen text not null,        -- ej: 'api/analyze', 'api/save', 'api/report'
  mensaje text not null,
  detalle jsonb,
  created_at timestamptz not null default now()
);

-- =========================================================================
-- Row Level Security: los datos de personalidad son datos sensibles bajo la
-- Ley 19.628. La API key "anon" NUNCA debe poder leer estas tablas; solo
-- debe poder insertar (para que el formulario publico guarde su propia
-- evaluacion), nunca listar evaluaciones de otros candidatos.
-- La lectura (para el panel de RRHH / generacion de PDF por id) debe hacerse
-- con la service_role key, exclusivamente desde el servidor (nunca en el
-- navegador).
-- =========================================================================

alter table candidatos enable row level security;
alter table evaluaciones enable row level security;
alter table errores_sistema enable row level security;
alter table perfiles_deseados enable row level security;
alter table invitaciones enable row level security;

-- perfiles_deseados e invitaciones: sin politicas para "anon" en absoluto.
-- Solo se leen/escriben desde /api/admin/* y /api/submit, ambos con
-- service_role en el servidor. El candidato nunca debe poder listarlos ni
-- crearlos.

drop policy if exists anon_insert_candidatos on candidatos;
create policy anon_insert_candidatos
  on candidatos for insert
  to anon
  with check (true);

drop policy if exists anon_insert_evaluaciones on evaluaciones;
create policy anon_insert_evaluaciones
  on evaluaciones for insert
  to anon
  with check (true);

drop policy if exists anon_insert_errores on errores_sistema;
create policy anon_insert_errores
  on errores_sistema for insert
  to anon
  with check (true);

-- Sin políticas de SELECT/UPDATE/DELETE para "anon": queda denegado por defecto.
-- service_role omite RLS automaticamente (uso exclusivo desde el servidor).
