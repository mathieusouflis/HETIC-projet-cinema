import { BaseController } from "../../../../shared/infrastructure/base/controllers";
import { Controller } from "../../../../shared/infrastructure/decorators/rest";

@Controller({
  tag: "Messages",
  prefix: "/messages",
  description: "Messages management",
})
export class MessagesRestController extends BaseController {
  constructor() {
    super();
  }
}
