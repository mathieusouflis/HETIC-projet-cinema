import { BaseController } from "../../../../shared/infrastructure/base/controllers/BaseController.js";
import { Controller } from "../../../../shared/infrastructure/decorators/controller.decorator.js";

@Controller({
  tag: "Contents",
  prefix: "/contents",
  description: "Content management for movies, series and actors",
})
export class ContentsController extends BaseController {
  constructor(
  ) {
    super();
  }

}
