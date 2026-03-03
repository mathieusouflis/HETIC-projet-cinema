import { WebSocketController } from "../../../../shared/infrastructure/base/controllers";
import { Namespace } from "../../../../shared/infrastructure/decorators/web-socket";

@Namespace({
  path: "/messages",
  description: "Message websockets endpoints",
})
export class MessageWSController extends WebSocketController {
  constructor() {
    super();
  }
}
