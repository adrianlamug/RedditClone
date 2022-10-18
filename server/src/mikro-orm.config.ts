import { Post } from  "./entities/Post";
import { MikroORM } from "@mikro-orm/core";
import path from 'path';
import { User } from "./entities/User";
import { DATABASE_NAME, DB_PASS, DB_USER, __prod__ } from "./constants";

console.log("dirname: ", __dirname);
export default {
    migrations:
    //  ["dist/migrations/*.js"],
    {
        // path: path.join(__dirname, "./migrations"),
        // pattern: /^[\w-]+\d+\.[jt]s$/,
        path: 'dist/migrations',
        pathTs: 'src/migrations'
    },
    entities: [Post, User],
    dbName: DATABASE_NAME,
    user: DB_USER,
    password: DB_PASS,
    type: "postgresql",
    allowGlobalContext: true,
    // logs what sql is being executed under the hud
    debug: !__prod__
} as Parameters<typeof MikroORM.init>[0];
