import { BaseController } from "../../../../shared/infrastructure/base/controllers";
import { Controller } from "../../../../shared/infrastructure/decorators";

@Controller({
  tag: "Peoples",
  prefix: "/peoples",
  description: "Peoples management.",
})

export class PeoplesController extends BaseController {
  constructor(

  ) {
    super();
  }

}
