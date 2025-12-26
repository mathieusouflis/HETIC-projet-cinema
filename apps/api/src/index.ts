import { log } from "@packages/logger";
import { createServer } from "./server.js";
import { config } from "@packages/config";

const port = config.env.backend.port || 5001;
const server = createServer();

server.listen(port, () => {
  log(`api running on ${port}`);
});
