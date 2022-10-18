import { EntityManager, IDatabaseDriver, Connection } from "@mikro-orm/core";
import { Request, Response, Express } from "express";
import Redis from "ioredis";

export type MyContext = {
    req: Request & {session: {userId: number}} ;
    // & {session: Express.Sesion};
    res: Response;
    redis: Redis;
}