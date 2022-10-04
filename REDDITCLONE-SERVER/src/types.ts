import { EntityManager, IDatabaseDriver, Connection } from "@mikro-orm/core"
import { Request, Response, Express } from "express"

export type MyContext = {
    em: EntityManager<IDatabaseDriver<Connection>>;
    req: Request & {session: {userId: number}} ;
    // & {session: Express.Sesion};
    res: Response;
}