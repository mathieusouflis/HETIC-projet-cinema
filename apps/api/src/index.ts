import { log } from "@repo/logger";
import { createServer } from "./server";
import { config } from "@repo/config";

const port = config.env.BACKEND_PORT || 5001;
const server = createServer();

server.listen(port, () => {
  log(`api running on ${port}`);
});
