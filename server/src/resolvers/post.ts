import { Arg, Int, Mutation, Query, Resolver } from "type-graphql";
import { Post } from "../entities/Post";

@Resolver()
export class PostResolver {
    // [Post] is graphql type
    // Post[] is typescript type
    @Query(()=> [Post])
    posts(): Promise<Post[]> {
        return Post.find();
    } 

    // return post or null, graphql type Post, {nullable:true} and typescript type Post | null
    @Query(()=> Post, {nullable: true})
    async post(
        @Arg("id", () => Int) id: number): Promise<Post | null> {
        return await Post.findOneBy({id: id});
    } 

    // infer means typegrahpql is able to figure out the type based on typescript type
    @Mutation(()=> Post)
    async createPost(
        @Arg("title", () => String) title: string): Promise<Post | null> {
        //2 sql queries
        return Post.create({title}).save();
    } 

    @Mutation(()=> Post, {nullable: true})
    async updatePost(
        @Arg("id", () => Int) id: number,
        @Arg("title", ()=>String, {nullable: true}) title : string) : Promise<Post | null> {
            const post = await Post.findOneBy({id});
            if (!post) {
                return null as any;
            }
            // if they give us a title
            if (typeof title !== 'undefined'){
                post.title = title
                Post.update({id}, {title});
            }
            return post;
        }

    // ()=> is return
    @Mutation(()=> Boolean)
    async deletePost(
        @Arg("id", ()=> Int) id: number,): Promise<boolean> {
            try {
                await Post.delete({id});
            } catch {
                return false;
            }
            return true;
        }
}