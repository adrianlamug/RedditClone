import { ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core';
import { ApolloServer } from 'apollo-server-express';
import connectRedis from 'connect-redis';
import cors from "cors";
import express from 'express';
import session from 'express-session';
import Redis from 'ioredis';
import "reflect-metadata";
import { buildSchema } from 'type-graphql';
import { DataSource } from 'typeorm';
import { COOKIE_NAME, DATABASE_NAME, DB_PASS, DB_USER, __prod__ } from "./constants";
import { Post } from "./entities/Post";
import { User } from "./entities/User";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";

export const dataSource = new DataSource({
    type:'postgres',
    database: DATABASE_NAME,
    username: DB_USER,
    password: DB_PASS,
    logging: true,
    synchronize: true,
    entities: [Post, User]
});


const main = async() => {
    // connect to the database
    dataSource.initialize()
        .then(() => {
            console.log("Data Source initialized")
        })
        .catch((err) => {
            console.error("Error: ", err)
        })
    // const  orm = await MikroORM.init(mikroConfig);


    // run migrations
    // await orm.getMigrator().up()
    //run sql
    // const post = orm.em.create(Post, {title: 'my first post'});
    // what to insert into the database
    // await orm.em.persistAndFlush(post);
    // const posts = await orm.em.find(Post, {}); 
    // console.log(posts); 
    const app = express();

    const RedisStore = connectRedis(session)
    const redis = new Redis();
    // const redisClient = redis.createClient({legacyMode: true});
    // await redis.connect();
    // in between app and applymiddleware, need to use session middleware inside apollo middleware
    app.use(
        cors({
            origin: "http://localhost:3000",
            credentials: true
        })
    );
    app.use(
        session({
            name: COOKIE_NAME,
            store: new RedisStore({client: redis as any,
                disableTouch: true,
            }),
            cookie: {
                maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
                httpOnly: true, // good for security, in frontend js can't access cookie
                sameSite: 'lax', // csrf
                secure: __prod__, // cookie only works in https
                
            },
            saveUninitialized: false,
            secret: 'something',
            resave: false,
        })
    )

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver, UserResolver],
            validate: false,
        }),
        // adding the plug in here forces apollo to use graphql playground,
        // resulting in the url to be localhost:4000 instead of redirecting to
        // studio.apollographql.com
        plugins: [ApolloServerPluginLandingPageGraphQLPlayground],
        // function that returns an object for the context
        context: ({req, res}) => ({req, res, redis}),
        csrfPrevention: true,

    });
    

    await apolloServer.start();
    // const corsOptions = { origin: "https://studio.apollographql.com", credentials: true}
    // apolloServer.applyMiddleware({app, cors: corsOptions});
    apolloServer.applyMiddleware({app, cors: {origin: false}})
    app.listen(4000, () => {
        console.log('server started on localhost:4000')
    })
}

main().catch((err) => {
    console.error(err)
})
