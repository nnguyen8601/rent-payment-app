const sql = require('mssql');

const config = {
    server: process.env.SQL_SERVER,
    database: process.env.SQL_DATABASE,
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    options: {
        encrypt: true
    }
};

module.exports = async function (context, req) {
    try {
        if (!req.body || !req.body.email || !req.body.password) {
            context.res = {
                status: 400,
                body: { error: "Email and password are required" }
            };
            return;
        }

        await sql.connect(config);

        const result = await sql.query`
            SELECT UserId, Email, Name
            FROM Users
            WHERE Email = ${req.body.email}
            AND Password = ${req.body.password}
        `;

        if (result.recordset.length > 0) {
            context.res = {
                status: 200,
                body: {
                    user: {
                        id: result.recordset[0].UserId,
                        email: result.recordset[0].Email,
                        name: result.recordset[0].Name
                    }
                }
            };
        } else {
            context.res = {
                status: 401,
                body: { error: "Invalid email or password" }
            };
        }
    } catch (error) {
        context.res = {
            status: 500,
            body: { error: "An error occurred during login" }
        };
    } finally {
        if (sql.connected) {
            await sql.close();
        }
    }
}; 