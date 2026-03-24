import fs from "node:fs";
import { authModule } from "./src/modules/auth/auth.module.js";
import { categoriesModule } from "./src/modules/categories/categories.module.js";
import { contentsModule } from "./src/modules/contents/contents.module.js";
import { conversationsModule } from "./src/modules/conversations/conversations.module.js";
import { friendshipsModule } from "./src/modules/friendships/friendships.module.js";
import { messagesModule } from "./src/modules/messages/messages.module.js";
import { moviesModule } from "./src/modules/movies/movie.module.js";
import { peoplesModule } from "./src/modules/peoples/peoples.module.js";
import { seriesModule } from "./src/modules/series/serie.module.js";
import { usersModule } from "./src/modules/users/users.module.js";
import { watchlistModule } from "./src/modules/watchlist/watchlist.module.js";
import { watchpartyModule } from "./src/modules/watchparty/watchparty.module.js";
import { moduleRegistry } from "./src/shared/infrastructure/openapi/module-registry.js";
import { OpenAPISpecAggregator } from "./src/shared/infrastructure/openapi/openapi-spec-aggregator.js";

moduleRegistry.register("auth", authModule);
moduleRegistry.register("users", usersModule);
moduleRegistry.register("categories", categoriesModule);
moduleRegistry.register("contents", contentsModule);
moduleRegistry.register("movies", moviesModule);
moduleRegistry.register("series", seriesModule);
moduleRegistry.register("watchlist", watchlistModule);
moduleRegistry.register("peoples", peoplesModule);
moduleRegistry.register("watchparties", watchpartyModule);
moduleRegistry.register("friendships", friendshipsModule);
moduleRegistry.register("conversations", conversationsModule);
moduleRegistry.register("messages", messagesModule);

const aggregator = new OpenAPISpecAggregator();
const spec = aggregator.generateSpec();

fs.writeFileSync("./api-documentation.json", JSON.stringify(spec, null, 2));
console.log("Spec generated with all modules!");
