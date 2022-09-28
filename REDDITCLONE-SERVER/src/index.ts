import { MikroORM} from "@mikro-orm/core";
import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
import mikroConfig from "./mikro-orm.config"


const main = async() => {
    // connect to the database
    const  orm = await MikroORM.init(mikroConfig);
    // run migrations
    await orm.getMigrator().up()
    //run sql
    // const post = orm.em.create(Post, {title: 'my first post'});
    // what to insert into the database
    // await orm.em.persistAndFlush(post);
    const posts = await orm.em.find(Post, {});
    console.log(posts);

}

main().catch((err) => {
    console.error(err)
})