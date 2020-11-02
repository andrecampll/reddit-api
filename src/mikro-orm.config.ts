import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import { Post } from "./entities/Post";

export default {
  entities: [Post],
  dbName: 'reddit',
  type: 'postgresql',
  user: 'postgres',
  password: 'docker',
  debug: !__prod__,
} as Parameters<typeof MikroORM.init>[0];
