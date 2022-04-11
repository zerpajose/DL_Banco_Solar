const http = require ( "http" );
const fs = require ( "fs" );
const url = require('url');

const { insertarUsuario, consultarUsuarios, consultarTransferencias, editUsuario, eliminarUsuario, realizarTransferencia } = require ( "./consultas" );

http.createServer( async (req, res) => {

    // Ingreso a sitio

    if (req.url == "/" && req.method === "GET" ) {
        res.setHeader( "content-type" , "text/html" );
        const html = fs.readFileSync( "index.html" , "utf8" );
        res.end(html);
    }

    
    // Insertar Usuario

    if ((req.url == "/usuario" && req.method == "POST" )) {
        
        let body = "" ;

        req.on( "data" , (chunk) => {
            body += chunk;
        });

        req.on( "end" , async () => {

            const datos = Object.values(JSON.parse(body));
            const respuesta = await insertarUsuario(datos);
            res.end(JSON.stringify(respuesta));
            
        });
    }
        
    // Consultar Usuarios

    if (req.url == "/usuarios" && req.method === "GET" ) {
        const registros = await consultarUsuarios();
        res.end(JSON.stringify(registros));
    }

    // Realizar Transferencia

    if ((req.url == "/transferencia" && req.method == "POST" )) {

        let body = "";

        req.on( "data" , (chunk) => {
            body += chunk;
        });

        req.on( "end" , async () => {
            
            const datos = Object.values(JSON.parse(body));
            
            const respuesta = await realizarTransferencia(datos);
            
            res.end(JSON.stringify(respuesta));
        });
    }

    // Consultar Transferencias

    if (req.url == "/transferencias" && req.method === "GET" ) {
        const registros = await consultarTransferencias();
        res.end(JSON.stringify(registros));
    }

    // Editar Usuario

    if (req.url.startsWith( "/usuario?" ) && req.method == "PUT" ) {

        const { id } = url.parse(req.url,true).query;
    
        let body = "" ;

            req.on( "data" , (chunk) => {
                body += chunk;
            });
            
            req.on( "end" , async () => {
                const datos = Object.values( JSON.parse(body));
                const respuesta = await editUsuario(datos, id);
                res.end(JSON.stringify(respuesta));
            });
    }


    // Eliminar Usuario
        
    if (req.url.startsWith( "/usuario?" ) && req.method == "DELETE" ) {
        const { id } = url.parse(req.url,true).query;
        const respuesta = await eliminarUsuario(id);
        res.end( JSON.stringify(respuesta));
    }

}).listen( 3000, () => console.log("Servidor corriendo en puerto 3000") );

