import { BaseController } from "@/shared/infrastructure/base/controllers";
import { Controller } from "@/shared/infrastructure/decorators";

@Controller({
  tag: "Users",
  prefix: "/users",
  description: "User management and profile endpoints",
})
export class WatchlistsController extends BaseController {
  constructor(
  ) {
    super();
  }


}
