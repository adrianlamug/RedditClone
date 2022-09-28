import { MikroORM} from "@mikro-orm/core";
import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
import mikroConfig from "./mikro-orm.config";
import express from 'express';
import {ApolloServer} from 'apollo-server-express';
import {buildSchema} from 'type-graphql';
import { HelloResolver } from "./resolvers/hello";


const main = async() => {
    // connect to the database
    const  orm = await MikroORM.init(mikroConfig);
    // run migrations
    await orm.getMigrator().up()
    //run sql
    // const post = orm.em.create(Post, {title: 'my first post'});
    // what to insert into the database
    // await orm.em.persistAndFlush(post);
    // const posts = await orm.em.find(Post, {}); 
    // console.log(posts); 
    const app = express();

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver],
            validate: false
        }),
    });

    await apolloServer.start();
    // create graphql endpoint for us on express
    apolloServer.applyMiddleware({app});

    app.listen(4000, () => {
        console.log('server started on localhost:4000')
    })

}

main().catch((err) => {
    console.error(err)
})