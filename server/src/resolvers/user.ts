import argon2 from 'argon2';
import { MyContext } from "src/types";
import { Arg, Ctx, Field, Mutation, ObjectType, Query, Resolver } from "type-graphql";
import { v4 } from 'uuid';
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from "../constants";
import { User } from "../entities/User";
import { dataSource } from "../index";
import { sendEmail } from "../utils/sendEmail";
import { validateRegister } from "../utils/validateRegister";
import { UsernamePasswordInput } from "./UsernamePasswordInput";

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
    async changePassword(
        @Arg('token') token: string,
        @Arg('newPassword') newPassword: string,
        @Ctx() { redis, req}: MyContext
    ): Promise<UserResponse> {
        if (newPassword.length <=4) {
            return {errors:[{
                    field: "newPassword",
                    message: "length must be greater than 4"
                }]}
        }
        const userId = await redis.get(FORGET_PASSWORD_PREFIX + token);
        if (!userId) {
            return {errors:[{
                field: "token",
                message: "token expired, please refresh token"
            }]}
        }
        const uId = parseInt(userId)
        const user = await User.findOneBy({id: uId});

        if(!user) {
            return {
                errors: [{
                    field: "token",
                    message: "user no longer exists",
                }]
            }
        }
        await User.update({id: uId}, {password:await argon2.hash(newPassword) } );

        redis.del(FORGET_PASSWORD_PREFIX+token);

        // log in user after changing password
        req.session.userId = user.id;
        
        return {user}
    }

    @Mutation(() => Boolean)
    async forgotPassword(
        @Arg('email') email: string,
        @Ctx() {redis}: MyContext
    ) {
        const user = await User.findOneBy({email: email});
        if (!user) {
            // the email is not in the db
            // prevents phishing
            return true;
        }
        const token = v4();
        // storing in redis
        await redis.set(FORGET_PASSWORD_PREFIX + token, user.id, 'EX', 1000*60*60*24*3) // 3 days
        sendEmail(email, `<a href="http://localhost:3000/change-password/${token}">reset password</a>`)
        return true;
    }

    @Query(()=> User, {nullable: true})
    me(
        @Ctx() { req } : MyContext
    ) {
        // you are not logged in
        if (!req.session.userId) {
            return null
        }   
        return User.findOneBy({id: req.session.userId});
        
    }
    
    @Mutation(() => UserResponse)
    async register(
        @Arg('options', ()=> UsernamePasswordInput, {nullable: false}) options: UsernamePasswordInput,
        @Ctx() {req,}: MyContext
    ): Promise<UserResponse> {
        const errors = validateRegister(options);
        if (errors) {
            return {errors};
        }
        const hashedPassword = await argon2.hash(options.password);
        let user;
        try {
            const result = await dataSource
                .createQueryBuilder()
                .insert()
                .into(User)
                .values([
                    {
                        username: options.username,
                        email: options.email,
                        password: hashedPassword,
                    }
                ])
                .returning("*")
                .execute()
            console.log("result: ", result);
            user = result.raw[0];
        } catch(err) {
            // console.log('err: ', err)
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
        @Arg("usernameOrEmail", {nullable: false}) usernameOrEmail: string,
        @Arg("password") password: string,
        @Ctx() {req}: MyContext
    ): Promise<UserResponse> {
        const user = await User.findOneBy(
            usernameOrEmail.includes("@") ? {email: usernameOrEmail} : {username: usernameOrEmail}
            );
        if (!user) {
            return {
                errors: [{
                    field: 'usernameOrEmail',
                    message: "invalid login"
                },
            ],
            }
        }
        const valid = await argon2.verify(user.password, password);
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