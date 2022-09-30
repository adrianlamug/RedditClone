import { User } from "../entities/User";
import { MyContext } from "src/types";
import { Resolver, Mutation, Arg, InputType, Field, Ctx, ObjectType } from "type-graphql";
import argon2 from 'argon2'

// Object Type we can return from our mutations, Input Type we use for arguments
@InputType()
class UsernamePasswordInput {
    @Field()
    username: string
    @Field()
    password: string
}

// something wrong with particular field(email, password)
@ObjectType()
class FieldError {
    @Field()
    field: string;
    
    @Field()
    message:string;
}

@ObjectType()
class UserResponse {
    // returns user and errors
    @Field(()=> [FieldError], {nullable: true})
    errors?: FieldError[]

    @Field(()=> User, {nullable: true})
    user?: User
}

@Resolver()
export class UserResolver {
    @Mutation(() => UserResponse)
    async register(
        @Arg('options', ()=> UsernamePasswordInput, {nullable: false}) options: UsernamePasswordInput,
        @Ctx() {em}: MyContext
    ): Promise<UserResponse> {
        if (options.username.length <=2) {
            return {
                errors: [{
                    field: "username",
                    message: "length must be greater than 2"
                }]
            }
        }
        if (options.password.length <=4) {
            return {
                errors: [{
                    field: "password",
                    message: "length must be greater than 4"
                }]
            }
        }
        const hashedPassword = await argon2.hash(options.password)
        const user = em.create(User, {username: options.username, password: hashedPassword});
        try {
            await em.persistAndFlush(user)
        } catch(err) {
            if (err.code === "23505" || err.detail.includes("already exists")) {
                // duplicate username error
                return{
                    errors: [{
                        field: 'username',
                        message: 'username already taken'
                    }]
                }
            }
            console.log("message: ", err.message)
        }
        return {user};
    }

    @Mutation(() => UserResponse)
    async login(
        @Arg('options', ()=> UsernamePasswordInput, {nullable: false}) options: UsernamePasswordInput,
        @Ctx() {em}: MyContext
    ): Promise<UserResponse> {
        const user = await em.findOne(User, {username: options.username});
        if (!user) {
            return {
                errors: [{
                    field: 'username',
                    message: "invalid login"
                },
            ],
            }
        }
        const valid = await argon2.verify(user.password, options.password);
        if (!valid) {
            return {
                errors: [{
                    field: "password",
                    message: "invalid login"
                }]
            }
        }
        return {user};
    }
}