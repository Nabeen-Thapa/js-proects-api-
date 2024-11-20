import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "../../users/db/userTable";

export const dbDetails = new DataSource({
    type:"postgres",
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: "Nt@post",
    database: "typescript_userapi",
    synchronize: true,
    logging: true,
    entities: [User], // Path to entity files
})