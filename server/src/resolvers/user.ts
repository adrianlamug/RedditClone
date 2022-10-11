import { User } from "../entities/User";
import { MyContext } from "src/types";
import { Resolver, Mutation, Arg, InputType, Field, Ctx, ObjectType, Query } from "type-graphql";
import argon2 from 'argon2';
import {EntityManager} from "@mikro-orm/postgresql"
import { COOKIE_NAME } from "../constants";

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
    @Query(()=> User, {nullable: true})
    async me(
        @Ctx() { req, em } : MyContext
    ) {
        // you are not logged in
        if (!req.session.userId) {
            return null
        }   
        const user = await em.findOne(User, {id: req.session.userId });
        return user;
    }
    
    @Mutation(() => UserResponse)
    async register(
        @Arg('options', ()=> UsernamePasswordInput, {nullable: false}) options: UsernamePasswordInput,
        @Ctx() {req, em}: MyContext
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
        const hashedPassword = await argon2.hash(options.password);
        let user;
        try {
            const result = await (em as EntityManager).createQueryBuilder(User).getKnexQuery().insert(
                {
                    username: options.username,
                    password: hashedPassword,
                    created_at: new Date(),
                    updated_at: new Date()
                }
            ).returning("*");
            user = result[0];
        } catch(err) {
            // console.log("message: ", err.message);
            //duplicate username error
            if (err.code === "23505" || err.detail.includes("already exists")) {
                return{
                    errors: [{
                        field: 'username',
                        message: 'username already taken'
                    }]
                }
            }
        }
        // store user id session, will set a cookie on the user to keep them logged in
        req.session.userId = user.id;
        return {user};
    }

    @Mutation(() => UserResponse)
    async login(
        @Arg('options', ()=> UsernamePasswordInput, {nullable: false}) options: UsernamePasswordInput,
        @Ctx() {em, req}: MyContext
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
        req.session.userId = user.id;
        
        return {user};
    }

    @Mutation(() => Boolean)
    logout(
        @Ctx() {req, res}: MyContext
    ) {
       return new Promise(resolve => req.session.destroy(err=> {
        res.clearCookie(COOKIE_NAME);
        if (err) {
            console.log(err);
            resolve(false)
            return
        }
        resolve(true)
       }))
    }
}