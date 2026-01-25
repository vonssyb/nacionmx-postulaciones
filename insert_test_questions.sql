-- ========================================
-- PREGUNTAS DEL TEST DE STAFF - NACIÓN MX
-- ========================================
-- Ejecutar en Supabase SQL Editor

-- 1. CREAR TABLA (si no existe)
CREATE TABLE IF NOT EXISTS staff_test_questions (
    id BIGSERIAL PRIMARY KEY,
    question TEXT NOT NULL,
    correct_answer TEXT NOT NULL,
    category TEXT NOT NULL,
    difficulty TEXT NOT NULL DEFAULT 'basico',
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Limpiar preguntas existentes (opcional)
-- DELETE FROM staff_test_questions;

-- 3. Insertar preguntas del test
INSERT INTO staff_test_questions (question, correct_answer, category, difficulty, active) VALUES

-- CATEGORÍA: REGLAS BÁSICAS
('¿Qué significa RDM?', 'Random Deathmatch - Matar a un jugador sin razón de roleplay válida', 'reglas', 'basico', true),
('¿Qué es VDM?', 'Vehicle Deathmatch - Atropellar intencionalmente sin razón de RP', 'reglas', 'basico', true),
('¿Qué significa "FailRP"?', 'Realizar acciones que tu personaje no haría en la vida real', 'reglas', 'basico', true),
('¿Está permitido el Meta Gaming?', 'No, usar información OOC (fuera del juego) en IC (dentro del juego) está prohibido', 'reglas', 'basico', true),
('¿Qué es PowerGaming?', 'Forzar acciones sobre otro jugador sin darle oportunidad de reaccionar', 'reglas', 'basico', true),

-- CATEGORÍA: PROCEDIMIENTOS DE STAFF
('¿Cuánto tiempo máximo puede durar una detención temporal sin autorización superior?', '15 minutos', 'procedimientos', 'intermedio', true),
('Si un jugador reporta RDM, ¿cuál es el primer paso?', 'Revisar los logs del servidor y contactar a ambas partes para escuchar su versión', 'procedimientos', 'intermedio', true),
('¿Qué debe hacer un staff si un jugador insulta a otro?', 'Advertir verbalmente primero, luego aplicar warn si continúa. Casos graves reportar a admin', 'procedimientos', 'intermedio', true),
('¿Puede un staff participar en RP mientras está de servicio?', 'Solo si no hay reportes pendientes y con modo invisible/god activado para no interferir', 'procedimientos', 'intermedio', true),
('¿Cómo se debe documentar una sanción?', 'En el sistema de logs con: usuario, razón, evidencia, duración y staff que aplicó la sanción', 'procedimientos', 'avanzado', true),

-- CATEGORÍA: GESTIÓN DE SITUACIONES
('Un jugador afirma que fue baneado injustamente, ¿qué haces?', 'Revisar logs, contactar al staff que aplicó el ban, escuchar al jugador y elevar a admin si es necesario', 'situaciones', 'intermedio', true),
('Dos jugadores están discutiendo en chat OOC, ¿cómo lo manejas?', 'Mover a chat privado/ticket, mediar la situación, advertir si es necesario y documentar', 'situaciones', 'intermedio', true),
('Detectas a un hacker en el servidor, ¿qué acción tomas?', 'Ban inmediato con evidencia, reportar a owner/admin, revisar si afectó otros jugadores', 'situaciones', 'avanzado', true),

-- CATEGORÍA: CONOCIMIENTO TÉCNICO
('¿Qué comando se usa para revisar el historial de un jugador?', '/historial [usuario] o comando equivalente del sistema', 'tecnico', 'basico', true),
('¿Cómo verificas si un jugador tiene ALTs?', 'Revisar IPs y dispositivos en logs del sistema', 'tecnico', 'intermedio', true);

-- Verificar inserción
SELECT COUNT(*) as total_preguntas FROM staff_test_questions WHERE active = true;

-- Ver preguntas por categoría
SELECT category, COUNT(*) as cantidad 
FROM staff_test_questions 
WHERE active = true 
GROUP BY category;
