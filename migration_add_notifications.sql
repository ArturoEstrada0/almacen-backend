-- Crear tabla de notificaciones
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(20) NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
    priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    category VARCHAR(50) NOT NULL DEFAULT 'system' CHECK (category IN ('system', 'inventory', 'purchase_order', 'producer', 'supplier', 'user', 'report', 'payment')),
    "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    read BOOLEAN NOT NULL DEFAULT FALSE,
    "readAt" TIMESTAMP,
    metadata JSONB,
    "actionUrl" VARCHAR(255),
    "actionLabel" VARCHAR(100),
    "expiresAt" TIMESTAMP,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications("userId", read, "createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_category ON notifications("userId", category, "createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_priority ON notifications("userId", priority, "createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_expires ON notifications("expiresAt") WHERE "expiresAt" IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications("createdAt" DESC);

-- Función para actualizar updatedAt automáticamente
CREATE OR REPLACE FUNCTION update_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updatedAt
DROP TRIGGER IF EXISTS trigger_update_notifications_updated_at ON notifications;
CREATE TRIGGER trigger_update_notifications_updated_at
    BEFORE UPDATE ON notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_notifications_updated_at();

-- Comentarios para documentación
COMMENT ON TABLE notifications IS 'Sistema de notificaciones en tiempo real para usuarios';
COMMENT ON COLUMN notifications.type IS 'Tipo de notificación: info, success, warning, error';
COMMENT ON COLUMN notifications.priority IS 'Prioridad: low, medium, high, urgent';
COMMENT ON COLUMN notifications.category IS 'Categoría de la notificación para filtrado';
COMMENT ON COLUMN notifications.metadata IS 'Datos adicionales en formato JSON';
COMMENT ON COLUMN notifications."actionUrl" IS 'URL a la que redirigir cuando se hace clic';
COMMENT ON COLUMN notifications."expiresAt" IS 'Fecha de expiración de la notificación (opcional)';
