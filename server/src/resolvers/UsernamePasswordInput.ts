import { InputType, Field } from "type-graphql";

// Object Type we can return from our mutations, Input Type we use for arguments

@InputType()
export class UsernamePasswordInput {
    @Field()
    username: string;
    @Field()
    email: string;
    @Field()
    password: string;
}
