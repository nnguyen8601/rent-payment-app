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
    let connection;
    try {
        connection = await sql.connect(config);
        
        // Get all properties
        const result = await sql.query`
            SELECT PropertyId as id, PropertyName as name
            FROM Properties
            ORDER BY PropertyName
        `;

        context.res = {
            status: 200,
            body: result.recordset
        };
    } catch (error) {
        context.log.error('Error fetching properties:', error);
        context.res = {
            status: 500,
            body: { error: 'Failed to fetch properties' }
        };
    } finally {
        if (connection) {
            await sql.close();
        }
    }
}; 