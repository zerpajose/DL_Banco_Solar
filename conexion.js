const { Pool } = require("pg");

const config = {
    user: "postgres",
    host: "localhost",
    password: "1a11aaaa",
    database: "bancosolar",
    port: 5432,
    max: 20,
    idleTimeoutMillis: 5000,
    connectionTimeoutMillis: 2000,
};
    
const pool = new Pool(config);

module.exports = pool;