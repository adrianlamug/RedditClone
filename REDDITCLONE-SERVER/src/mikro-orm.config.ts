import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
import { MikroORM } from "@mikro-orm/core";
import path from 'path';
import { User } from "./entities/User";

console.log("dirname: ", __dirname);
export default {
    migrations: {
        path: path.join(__dirname, "./migrations"),
        pattern: /^[\w-]+\d+\.[jt]s$/,
        // path: './src/migrations'
    },
    entities: [Post, User],
    dbName: 'redditclone',
    user: 'postgres',
    password: 'password',
    type: "postgresql",
    allowGlobalContext: true,
    // logs what sql is being executed under the hud
    debug: !__prod__
} as Parameters<typeof MikroORM.init>[0];
