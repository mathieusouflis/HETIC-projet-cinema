import { openApi } from "../../../../shared/infrastructure/openapi";
import { changePasswordSchema } from "../../application/validators/change-password.validator";
import { emailSchema } from "../../application/validators/email.validator";
import { loginSchema } from "../../application/validators/login.validator";
import { passwordSchema } from "../../application/validators/password.validator";
import { refreshTokenSchema } from "../../application/validators/refresh-token.validator";
import { registerSchema } from "../../application/validators/register.validator";
import { usernameSchema } from "../../application/validators/username.validator";

export function registerOpenApiRoutes() {
  const registry = openApi.getRegistry()
  registry.register("AuthChangePassword", changePasswordSchema)
  registry.register("AuthEmail", emailSchema)
  registry.register("AuthLogin", loginSchema)
  registry.register("AuthPassword", passwordSchema)
  registry.register("AuthRefreshToken", refreshTokenSchema)
  registry.register("AuthRegister", registerSchema)
  registry.register("AuthUsername", usernameSchema)
}
