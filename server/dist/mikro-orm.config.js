"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Post_1 = require("./entities/Post");
const User_1 = require("./entities/User");
const constants_1 = require("./constants");
console.log("dirname: ", __dirname);
exports.default = {
    migrations: {
        path: 'dist/migrations',
        pathTs: 'src/migrations'
    },
    entities: [Post_1.Post, User_1.User],
    dbName: constants_1.DATABASE_NAME,
    user: constants_1.DB_USER,
    password: constants_1.DB_PASS,
    type: "postgresql",
    allowGlobalContext: true,
    debug: !constants_1.__prod__
};
//# sourceMappingURL=mikro-orm.config.js.map