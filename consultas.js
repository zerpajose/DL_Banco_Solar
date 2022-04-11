const pool = require('./conexion');

const insertarUsuario = async (datos) => {
    const consulta = {
        text: "INSERT INTO usuarios (nombre, balance) values ($1, $2);" , 
        values: datos 
    };
    
    try {
        const result = await pool.query(consulta);
        return result;
    } catch (error) {
        console.log(error.code);
        return error;
    }
};

const realizarTransferencia = async (datos) => { //datos=[emisor, receptor, monto]
    
    let f = await fechaHoraActual();

    f = f.rows[0].now;

    const marcadetiempo = f.getFullYear()+"-"+f.getMonth()+"-"+f.getDate()+" "+f.getHours()+":"+f.getMinutes()+":"+f.getSeconds();

    const primera = datos.filter((e, i)=>{
        return i != 1;
    });

    const segunda = datos.filter((e, i)=>{
        return i != 0;
    });

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        await client.query('UPDATE usuarios SET balance = balance - $2 WHERE id=$1 RETURNING *', primera);
        
        await client.query('UPDATE usuarios SET balance = balance + $2 WHERE id=$1 RETURNING *', segunda);
        
        const transf = await client.query(`INSERT INTO transferencias (emisor, receptor, monto, fecha) VALUES ($1, $2, $3, '${marcadetiempo}') RETURNING *;`, datos);
        
        await client.query('COMMIT');

        return transf;
    } catch (e) {
        console.log(`Error: ${e}`);
        client.query('ROLLBACK');
        return e;
    } finally {
        client.release();
    }
}

const fechaHoraActual = async () => {
    const consulta = {
        text: `SELECT now()`
    };
    
    try {
        const result = await pool.query(consulta);
        return result;
    } catch (error) {
        console.log(error.code);
        return error;
    }
}

const consultarTransferencias = async () => {
    try {

        //consulta emisores
        const resultEmisor = await pool.query(`
        SELECT usuarios.nombre as emisor
        FROM usuarios
        INNER JOIN transferencias
        ON usuarios.id=transferencias.emisor;`);

        //consulta receptores
        const resultReceptor = await pool.query(`
        SELECT usuarios.nombre as receptor
        FROM usuarios
        INNER JOIN transferencias
        ON usuarios.id=transferencias.receptor;`);

        //consulta montos
        const resultMonto = await pool.query(`
        SELECT transferencias.monto as monto, transferencias.fecha as fecha
        FROM transferencias`);
        resultMonto.rows;

        const transferenciasArray = resultEmisor.rows;

        transferenciasArray.forEach((e, i)=>{
            e.receptor = resultReceptor.rows[i].receptor;
            e.monto = resultMonto.rows[i].monto;
            e.fecha = resultMonto.rows[i].fecha;
        });

        return transferenciasArray;        

    } catch (error) {
        console.log(error.code);
        return error;
    }
};

const consultarUsuarios = async () => {
    
    try {
        const result = await pool.query(`SELECT * FROM usuarios`);
        
        return result.rows;

    } catch (error) {
        console .log(error.code);
        return error;
    }
};

const editUsuario = async (datos, id) => {
    const consulta = {
        text: `UPDATE usuarios SET nombre = $1, balance = $2 WHERE id = ${id} RETURNING *` ,
        values: datos,
    };
    try {
        const result = await pool.query(consulta);
        return result;
    } catch (error) {
        console .log(error);
        return error;
    }
};

const eliminarUsuario = async (id) => {

    try {
        const result = await pool.query( `DELETE FROM usuarios WHERE id = '${id}'`);
        return result;
    } catch (error) {
        console .log(error.code);
        return error;
    }
};
    
module.exports = { insertarUsuario, consultarUsuarios, consultarTransferencias, editUsuario, eliminarUsuario, realizarTransferencia };
