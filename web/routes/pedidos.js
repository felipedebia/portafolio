// Importaciones
const express = require('express');
const router = express.Router();
const settings = require('../bin/settings');
var moment = require('moment');
var functions = require('./functions');

// CRUD PEDIDOS

// Listar todos los pedidos
router.get('/listarPedidos', async (req, res) => {
    try {
  
        binds = {};
        sql = "SELECT id_pedido, direccion_despacho, fecha_creacion, fk_id_tipo, fk_id_ciudad, fk_id_usuario, fk_id_estado, estado_pedido.descripcion FROM pedido JOIN estado_pedido ON pedido.fk_id_estado = estado_pedido.id_estado";
        result = await settings.OpenConnection(sql, binds, true);

        Pedidos = [];

        result.rows.map(pedido => {
            let pedidoSchema = {
                "id_pedido": pedido[0],
                "direccion_despacho": pedido[1],
                "fecha_creacion": moment(pedido[2]).format('DD-MM-YYYY'),
                "fk_id_tipo": pedido[3],
                "fk_id_ciudad": pedido[4],
                "fk_id_usuario": pedido[5],
                "fk_id_estado": pedido[6],
                "fk_texto_estado": pedido[7]
            }

            Pedidos.push(pedidoSchema);
        })
        res.json({title: 'Pedidos', 'mydata': Pedidos});

    } catch (error) {
        res.status(400);
        res.json({ "error": error });
        console.log(error);
    }

});


//Listar detalles de todos los pedidos
router.get('/listarPedidoDetalles', async(req, res) => {
    try {

        binds = {};
        sql = "select pedido_detalle.id_pedidoD, pedido_detalle.cantidad, pedido_detalle.fk_id_fruta, fruta.nombre, fruta_calidad.nombre, pedido_detalle.fk_id_pedido from pedido_detalle join fruta on pedido_detalle.fk_id_fruta = fruta.id_fruta join fruta_calidad on pedido_detalle.fk_id_calidad = fruta_calidad.id_calidad";
        result = await settings.OpenConnection(sql, binds, true);

        PedidoDetalles = [];

        result.rows.map(detalle => {
            let detalleSchema = {
                "id_pedidoD": detalle[0],
                "cantidad": detalle[1],
                "fk_id_fruta": detalle[2],
                "fruta_fk_nombre": detalle[3],
                "frutacalidad_fk_nombre": detalle[4],
                "id_pedido": detalle[5]
            }

            PedidoDetalles.push(detalleSchema);
        })
        res.json({ title: 'PedidoDetalles', 'mydata': PedidoDetalles });

    } catch (error) {
        res.status(400);
        res.send("Ocurri?? un error al obtener los datos de la base de datos")
        console.log(error);
    }

});


// Crear pedido
router.post('/crearPedido', async(req, res) => {
    try {

        var { direccion_despacho, fk_id_ciudad } = req.body;
        var fk_id_usuario = req.session.id_usuario;
        var fk_id_tipo = 1;

        // Asignamos estado 1 = En preparaci??n
        var fk_id_estado = 1;

        var fecha_creacion = functions.obtenerFechaActual();

        sql1 = "CALL PA_PEDIDO_CREAR(:direccion_despacho, :fecha_creacion, :fk_id_tipo, :fk_id_ciudad, :fk_id_usuario, :fk_id_estado)";
        resultado1 = await settings.OpenConnection(sql1, [direccion_despacho, fecha_creacion, fk_id_tipo, fk_id_ciudad, fk_id_usuario, fk_id_estado], true);

        // Si tuvo conexi??n a la DB
        if (resultado1) {
            console.log("[!] Pedido creado con ??xito");

            // Tomamos el ultimo registro en la tabla pedido para redirigir al pedido detalle
            sql2 = "SELECT id_pedido FROM (SELECT * FROM pedido ORDER BY id_pedido DESC ) WHERE rownum = 1";
            resultado2 = await settings.OpenConnection(sql2, [], true);

            var idPedidoSql = resultado2.rows[0];

            if (idPedidoSql) {
                res.redirect('/pedido_detalles/' + idPedidoSql);
            }
        } else {
            console.log("[!] Ocurri?? un error al intentar registrar el pedido ");
            res.redirect('/mispedidos');
        }

    } catch (error) {
        res.status(400);
        res.send("Ocurri?? un error al obtener los datos de la base de datos")
        console.log(error);
    }

});


// Agregar Pedido Detalle
router.post('/crearPedidoDetalle', async(req, res) => {
    try {

        var { fk_id_fruta, fk_id_calidad, fk_id_pedido, cantidad } = req.body;
        var fecha_creacion = functions.obtenerFechaActual();

        sql = "CALL PA_PEDIDO_DETALLE_CREAR(:cantidad, :fecha_creacion, :fecha_actualizacion, :fk_id_calidad, :fk_id_fruta, :fk_id_pedido)";
        resultado = await settings.OpenConnection(sql, [cantidad, fecha_creacion, fecha_creacion, fk_id_calidad, fk_id_fruta, fk_id_pedido], true);

        // Si tuvo conexi??n a la DB
        if (resultado) {
            console.log("[!] Pedido detalle creado con ??xito");
            functions.ListarPedidoDetalles();
            var refresh_page = "true";
            res.redirect('/pedido_detalles/' + fk_id_pedido + '/?refresh_status=' + refresh_page);
        } else {
            console.log("[!] Ocurri?? un error al intentar registrar el pedido detalle ");
            res.redirect('/mispedidos');
        }

    } catch (error) {
        res.status(400);
        res.send("Ocurri?? un error al obtener los datos de la base de datos")
        console.log(error);
    }

});


//Confirmar pedido
router.get("/confirmarPedido/:id_pedido", async(req, res) => {
    try {

        var id_pedido_bind = req.params.id_pedido;
        
        // Actualizamos pedido a estado 2 = Recepcionado
        sql = "CALL PA_PEDIDO_CONFIRMAR(:id_pedido_bind)";
        resultado = await settings.OpenConnection(sql, [id_pedido_bind], true);

        if (resultado) {
            console.log("[!] Pedido " + req.params.id_pedido + " enviado con ??xito");
            var refresh_page = "true";
            res.redirect('/mispedidos/?refresh_status=' + refresh_page);
        } else {
            console.log("[!] Ocurri?? un error al intentar enviar el pedido " + req.params.id_pedido);
            res.redirect('/mispedidos');
        }

    } catch (error) {
        res.status(400);
        res.send("Ocurri?? un error al obtener los datos de la base de datos")
        console.log(error);
    }

});


//Eliminar Pedido Detalle
router.get("/eliminarPedidoDetalles/:id_pedidoD", async(req, res) => {
    try {

        var id_pedido_bind = req.params.id_pedidoD;

        sql = "CALL PA_PEDIDO_DETALLE_DELETE(:id_pedido_bind)";
        resultado = await settings.OpenConnection(sql, [id_pedido_bind], true);

        if (resultado) {
            console.log("[!] Pedido detalle " + id_pedido_bind + " eliminado con ??xito");
            functions.ListarPedidoDetalles();
            res.redirect(req.get('referer'));
        } else {
            console.log("[!] Ocurri?? un error al intentar eliminar el pedido detalle " + id_pedido_bind);
        }

    } catch (error) {
        res.status(400);
        res.send("Ocurri?? un error al obtener los datos de la base de datos")
        console.log(error);
    }

});


//Anular pedido - tambien se tienen que cancelar las subastas y todo
router.get("/anularPedido/:id_pedido", async(req, res) => {
    try {

        var id_pedido_bind = req.params.id_pedido;

        sql = "CALL PA_PEDIDO_ANULAR(:id_pedido_bind)";
        resultado = await settings.OpenConnection(sql, [id_pedido_bind], true);

        if(resultado) {
            console.log("[!] Pedido " + id_pedido_bind + " anulado con ??xito");
            var refresh_page = "true";
            res.redirect('/pedidos/?refresh_status=' + refresh_page);
        } else {
            console.log("[!] Ocurri?? un error al intentar anular el pedido " + id_pedido_bind);
            res.redirect('/pedidos');
        }

    } catch (error) {
        res.status(400);
        res.send("Ocurri?? un error al obtener los datos de la base de datos")
        console.log(error);
    }

});


//Anular pedido
router.get("/anularMiPedido/:id_pedido", async(req, res) => {
    try {
        
        var id_pedido_bind = req.params.id_pedido;

        sql = "CALL PA_PEDIDO_ANULAR(:id_pedido_bind)";
        resultado = await settings.OpenConnection(sql, [id_pedido_bind], true);

        if(resultado) {
            console.log("[!] Pedido " + id_pedido_bind + " anulado con ??xito");
            var refresh_page = "true";
            res.redirect('/mispedidos/?refresh_status=' + refresh_page);
        } else {
            console.log("[!] Ocurri?? un error al intentar anular el pedido " + id_pedido_bind);
            res.redirect('/mispedidos');
        }

    } catch (error) {
        res.status(400);
        res.send("Ocurri?? un error al obtener los datos de la base de datos")
        console.log(error);
    }

});


module.exports = router;
