/**
 * Utilidad para mapear errores técnicos a mensajes amigables para el usuario
 */

export interface ErrorMapping {
  code?: string
  pattern?: RegExp
  message: string
  httpStatus?: number
}

/**
 * Mapeo de errores de base de datos a mensajes amigables
 */
export const DATABASE_ERROR_MAPPINGS: ErrorMapping[] = [
  // Errores de duplicación
  {
    pattern: /duplicate key value violates unique constraint.*"products_sku_key"/i,
    message: 'Ya existe un producto con ese SKU. Por favor, utilice un SKU diferente.',
    httpStatus: 409,
  },
  {
    pattern: /duplicate key value violates unique constraint.*"suppliers.*email"/i,
    message: 'Ya existe un proveedor con ese correo electrónico.',
    httpStatus: 409,
  },
  {
    pattern: /duplicate key value violates unique constraint.*"producers.*code"/i,
    message: 'Ya existe un productor con ese código.',
    httpStatus: 409,
  },
  {
    pattern: /duplicate key value violates unique constraint/i,
    message: 'Este registro ya existe. Por favor, verifique los datos e intente nuevamente.',
    httpStatus: 409,
  },
  
  // Errores de llave foránea
  {
    pattern: /foreign key constraint.*"fk_.*category"/i,
    message: 'La categoría seleccionada no existe o ha sido eliminada.',
    httpStatus: 400,
  },
  {
    pattern: /foreign key constraint.*"fk_.*supplier"/i,
    message: 'El proveedor seleccionado no existe o ha sido eliminado.',
    httpStatus: 400,
  },
  {
    pattern: /foreign key constraint.*"fk_.*product"/i,
    message: 'El producto seleccionado no existe o ha sido eliminado.',
    httpStatus: 400,
  },
  {
    pattern: /foreign key constraint.*"fk_.*warehouse"/i,
    message: 'El almacén seleccionado no existe o ha sido eliminado.',
    httpStatus: 400,
  },
  {
    pattern: /foreign key constraint/i,
    message: 'No se puede completar la operación porque hace referencia a datos que no existen.',
    httpStatus: 400,
  },
  
  // Errores de restricción NOT NULL
  {
    pattern: /null value in column "name" violates not-null constraint/i,
    message: 'El nombre es obligatorio. Por favor, proporcione un nombre.',
    httpStatus: 400,
  },
  {
    pattern: /null value in column "sku" violates not-null constraint/i,
    message: 'El SKU es obligatorio. Por favor, proporcione un SKU.',
    httpStatus: 400,
  },
  {
    pattern: /null value in column "email" violates not-null constraint/i,
    message: 'El correo electrónico es obligatorio.',
    httpStatus: 400,
  },
  {
    pattern: /null value in column .* violates not-null constraint/i,
    message: 'Faltan campos obligatorios. Por favor, complete todos los campos requeridos.',
    httpStatus: 400,
  },
  
  // Errores de conexión a base de datos
  {
    pattern: /connection.*refused|ECONNREFUSED/i,
    message: 'No se pudo conectar con la base de datos. Por favor, intente nuevamente en unos momentos.',
    httpStatus: 503,
  },
  {
    pattern: /timeout|ETIMEDOUT/i,
    message: 'La operación tardó demasiado tiempo. Por favor, intente nuevamente.',
    httpStatus: 504,
  },
  
  // Errores de validación de datos
  {
    pattern: /invalid input syntax for.*integer/i,
    message: 'El valor proporcionado debe ser un número válido.',
    httpStatus: 400,
  },
  {
    pattern: /invalid input syntax for.*uuid/i,
    message: 'El identificador proporcionado no es válido.',
    httpStatus: 400,
  },
  {
    pattern: /value too long for type character varying/i,
    message: 'El texto proporcionado es demasiado largo. Por favor, reduzca la longitud.',
    httpStatus: 400,
  },
]

/**
 * Mapeo de errores de autenticación
 */
export const AUTH_ERROR_MAPPINGS: ErrorMapping[] = [
  {
    pattern: /invalid.*credentials|wrong.*password/i,
    message: 'Credenciales incorrectas. Por favor, verifique su correo y contraseña.',
    httpStatus: 401,
  },
  {
    pattern: /user.*not.*found/i,
    message: 'No se encontró un usuario con ese correo electrónico.',
    httpStatus: 404,
  },
  {
    pattern: /token.*invalid|token.*expired/i,
    message: 'Su sesión ha expirado. Por favor, inicie sesión nuevamente.',
    httpStatus: 401,
  },
  {
    pattern: /unauthorized|not.*authorized/i,
    message: 'No tiene permisos para realizar esta acción.',
    httpStatus: 403,
  },
]

/**
 * Mapeo de errores de archivo
 */
export const FILE_ERROR_MAPPINGS: ErrorMapping[] = [
  {
    pattern: /file.*too.*large|payload.*too.*large/i,
    message: 'El archivo es demasiado grande. El tamaño máximo permitido es 10MB.',
    httpStatus: 413,
  },
  {
    pattern: /invalid.*file.*type|unsupported.*format/i,
    message: 'Formato de archivo no válido. Por favor, utilice un archivo compatible.',
    httpStatus: 400,
  },
  {
    pattern: /file.*not.*found|ENOENT/i,
    message: 'No se encontró el archivo solicitado.',
    httpStatus: 404,
  },
]

/**
 * Función principal para convertir un error técnico en un mensaje amigable
 */
export function getFriendlyErrorMessage(error: any): { message: string; statusCode: number } {
  const errorMessage = typeof error === 'string' ? error : error?.message || error?.detail || ''
  
  // Buscar en todos los mapeos
  const allMappings = [...DATABASE_ERROR_MAPPINGS, ...AUTH_ERROR_MAPPINGS, ...FILE_ERROR_MAPPINGS]
  
  for (const mapping of allMappings) {
    if (mapping.pattern && mapping.pattern.test(errorMessage)) {
      return {
        message: mapping.message,
        statusCode: mapping.httpStatus || 400,
      }
    }
  }
  
  // Si no se encuentra un mapeo específico, devolver un mensaje genérico
  return {
    message: 'Ocurrió un error al procesar su solicitud. Por favor, intente nuevamente.',
    statusCode: 500,
  }
}

/**
 * Función para extraer información útil de un error de validación
 */
export function getValidationErrorMessage(validationErrors: any[]): string {
  if (!Array.isArray(validationErrors) || validationErrors.length === 0) {
    return 'Los datos proporcionados no son válidos.'
  }
  
  const errors = validationErrors.map(err => {
    const constraints = err.constraints || {}
    const messages = Object.values(constraints)
    return messages.join(', ')
  })
  
  return errors.join('. ')
}
