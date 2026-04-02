import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from "@nestjs/common"
import { Reflector } from "@nestjs/core"

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>("roles", context.getHandler())
    if (!requiredRoles) {
      return true
    }

    const request = context.switchToHttp().getRequest()
    const user = request.user

    if (!user) {
      throw new ForbiddenException("Usuario no autenticado")
    }

    // Verificar si el usuario tiene uno de los roles requeridos
    // El campo 'role' debe venir en el token JWT de Supabase o en el contexto del usuario
    const hasRole = () => {
      const jwtRole = user.role
      const metadataRole = user.app_metadata?.role || user.user_metadata?.role
      const effectiveRole =
        metadataRole || (jwtRole && !["authenticated", "anon"].includes(jwtRole) ? jwtRole : "guest")

      return requiredRoles.includes(effectiveRole)
    }

    if (!hasRole()) {
      throw new ForbiddenException(`Se requieren los siguientes roles: ${requiredRoles.join(", ")}`)
    }

    return true
  }
}
