import { Post } from "../entities/Post";
import { Resolver, Query, Ctx, Arg, Int, Mutation} from "type-graphql";
import { MyContext } from "src/types";

@Resolver()
export class PostResolver {
    // [Post] is graphql type
    // Post[] is typescript type
    @Query(()=> [Post])
    posts(@Ctx() {em}: MyContext) : Promise<Post[]> {
        return em.find(Post, {});
    } 

    // return post or null, graphql type Post, {nullable:true} and typescript type Post | null
    @Query(()=> Post, {nullable: true})
    post(
        @Arg("id", () => Int) id: number, 
        @Ctx() {em}: MyContext) : Promise<Post | null> {
        return em.findOne(Post, {id});
    } 

    // infer means typegrahpql is able to figure out the type based on typescript type
    @Mutation(()=> Post)
    async createPost(
        @Arg("title", () => String) title: string, 
        @Ctx() {em}: MyContext) : Promise<Post | null> {
        const post = em.create(Post, {title});
        await em.persistAndFlush(post);
        return post;
    } 

    @Mutation(()=> Post, {nullable: true})
    async updatePost(
        @Arg("id", () => Int) id: number,
        @Arg("title", ()=>String, {nullable: true}) title : string,
        @Ctx() {em} : MyContext) : Promise<Post | null> {
            const post = await em.findOne(Post, {id});
            if (!post) {
                return null as any;
            }
            // if they give us a title
            if (typeof title !== 'undefined'){
                post.title = title
                await em.persistAndFlush(post)
            }
            return post;
        }

    // ()=> is return
    @Mutation(()=> Boolean)
    async deletePost(
        @Arg("id", ()=> Int) id: number,
        @Ctx() {em}: MyContext): Promise<boolean> {
            try {
                await em.nativeDelete(Post, {id})
            } catch {
                return false;
            }
            return true;
        }
}