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
    context.log('Login function processing request');
    
    // Set response headers
    context.res = {
        headers: {
            'Content-Type': 'application/json'
        }
    };
    
    try {
        if (!req.body || !req.body.email || !req.body.password) {
            context.log('Missing email or password');
            context.res = {
                status: 400,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ error: "Email and password are required" })
            };
            return;
        }

        context.log('Connecting to database...');
        await sql.connect(config);
        context.log('Connected to database');

        const result = await sql.query`
            SELECT UserId, Email, Name
            FROM Users
            WHERE Email = ${req.body.email}
            AND Password = ${req.body.password}
        `;

        context.log(`Query returned ${result.recordset.length} records`);

        if (result.recordset.length > 0) {
            context.res = {
                status: 200,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user: {
                        id: result.recordset[0].UserId,
                        email: result.recordset[0].Email,
                        name: result.recordset[0].Name
                    }
                })
            };
        } else {
            context.res = {
                status: 401,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ error: "Invalid email or password" })
            };
        }
    } catch (error) {
        context.log.error('Error in login function:', error);
        context.log.error('Error details:', {
            message: error.message,
            stack: error.stack,
            code: error.code,
            state: error.state
        });
        context.res = {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                error: "An error occurred during login",
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            })
        };
    } finally {
        if (sql.connected) {
            await sql.close();
        }
    }
}; 