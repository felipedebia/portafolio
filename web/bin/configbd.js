const oracledb = require('oracledb');

config = {
    user: "portafolio",
    password: "portafolio",
    connectString: "localhost:1521/xe"
}

async function Open(sql, binds, autoCommit) {
    let cnn = await oracledb.getConnection(config);
    console.log('[!] Connected to database');
    let result = await cnn.execute(sql, binds, { autoCommit });
    console.log('[!] Query executed');
    cnn.release();
    return result;
}

exports.Open = Open;