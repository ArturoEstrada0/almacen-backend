import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator"

// Validador para RFC mexicano
@ValidatorConstraint({ name: "isValidRFC", async: false })
export class IsValidRFCConstraint implements ValidatorConstraintInterface {
  validate(value: string) {
    if (!value) return false

    // RFC válido: 12 caracteres (personas morales) o 13 caracteres (personas físicas)
    // Formato: XXXXXX######XXX o XXXXXXXXXXXXXXXX
    // Primeras 6 letras del nombre/razón social, 6 dígitos de fecha (yymmdd), 3 caracteres alfabéticos de verificación
    const rfcRegex = /^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/

    return rfcRegex.test(value.toUpperCase())
  }

  defaultMessage() {
    return "RFC debe ser válido. Formato: XXXXXX######XXX (mínimo 12, máximo 13 caracteres)"
  }
}

export function IsValidRFC(validationOptions?: ValidationOptions) {
  return function (target: object, propertyName: string) {
    registerDecorator({
      target: target.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidRFCConstraint,
    })
  }
}

// Validador para teléfono mexicano
@ValidatorConstraint({ name: "isValidMexicoPhone", async: false })
export class IsValidMexicoPhoneConstraint implements ValidatorConstraintInterface {
  validate(value: string) {
    if (!value) return false

    // Eliminar espacios, guiones y caracteres especiales
    const cleanPhone = value.replace(/[\s\-()]/g, "")

    // Teléfono válido: 10 dígitos para México (sin contar código de país)
    // O 12 dígitos si incluye el código de país +52
    const phoneRegex = /^(\+?52)?1?\d{10}$/

    return phoneRegex.test(cleanPhone)
  }

  defaultMessage() {
    return "El teléfono debe ser válido. Debe contener 10 dígitos o +52 seguido de 10 dígitos"
  }
}

export function IsValidMexicoPhone(validationOptions?: ValidationOptions) {
  return function (target: object, propertyName: string) {
    registerDecorator({
      target: target.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidMexicoPhoneConstraint,
    })
  }
}

// Validador para CLABE (Clave Bancaria Estandarizada)
@ValidatorConstraint({ name: "isValidCLABE", async: false })
export class IsValidCLABEConstraint implements ValidatorConstraintInterface {
  validate(value: string) {
    if (!value) return false

    // CLABE: 18 dígitos exactos
    const clabeRegex = /^\d{18}$/

    if (!clabeRegex.test(value)) return false

    // Validar dígito de control (algoritmo de Luhn)
    let sum = 0
    const weights = [3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7, 1]

    for (let i = 0; i < 17; i++) {
      const digit = parseInt(value[i], 10)
      const product = (digit * weights[i]) % 10
      sum = (sum + product) % 10
    }

    const checkDigit = (10 - sum) % 10
    return checkDigit === parseInt(value[17], 10)
  }

  defaultMessage() {
    return "CLABE debe ser válida. Debe contener 18 dígitos y pasar la validación de dígito de control"
  }
}

export function IsValidCLABE(validationOptions?: ValidationOptions) {
  return function (target: object, propertyName: string) {
    registerDecorator({
      target: target.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidCLABEConstraint,
    })
  }
}
