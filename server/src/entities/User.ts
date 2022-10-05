import { Entity, OptionalProps, PrimaryKey, Property } from "@mikro-orm/core";
import { ObjectType, Field } from "type-graphql"

// with Field() we can choose what to expose on the graphql schema
@ObjectType()
@Entity()
export class User {
    [OptionalProps]?: "updatedAt" | "createdAt";

    @Field()
    @PrimaryKey()
    id!: number;

    @Field(() => String)
    @Property({type: "date"})
    createdAt = new Date();

    @Field(() => String)
    @Property({ type: "date", onUpdate: () => new Date()})
    updatedAt = new Date();

    @Field()
    @Property({type: 'text', unique: true})
    username!: string;


    @Property({type: "text"})
    password!: string;
}