"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbDetails = void 0;
require("reflect-metadata");
const typeorm_1 = require("typeorm");
exports.dbDetails = new typeorm_1.DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: "Nt@post",
    database: "typescript_apidb",
    synchronize: true,
    logging: true,
    entities: ["../users/db*.ts"], // Path to entity files
});
//# sourceMappingURL=DB_details.js.map