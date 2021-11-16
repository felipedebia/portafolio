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
        sql = "select pedido_detalle.id_pedidoD, pedido_detalle.cantidad, fruta.nombre, fruta_calidad.nombre, pedido_detalle.fk_id_pedido from pedido_detalle join fruta on pedido_detalle.fk_id_fruta = fruta.id_fruta join fruta_calidad on pedido_detalle.fk_id_calidad = fruta_calidad.id_calidad";
        result = await settings.OpenConnection(sql, binds, true);

        PedidoDetalles = [];

        result.rows.map(detalle => {
            let detalleSchema = {
                "id_pedidoD": detalle[0],
                "cantidad": detalle[1],
                "fruta_fk_nombre": detalle[2],
                "frutacalidad_fk_nombre": detalle[3],
                "id_pedido": detalle[4]
            }

            PedidoDetalles.push(detalleSchema);
        })
        res.json({ title: 'PedidoDetalles', 'mydata': PedidoDetalles });

    } catch (error) {
        res.status(400);
        res.send("Ocurrió un error al obtener los datos de la base de datos")
        console.log(error);
    }

});


// Crear pedido
router.post('/crearPedido', async(req, res) => {
    try {

        var { direccion_despacho, fk_id_ciudad } = req.body;
        var fk_id_usuario = req.session.id_usuario;
        var fk_id_tipo = 1; // Ver si esta bien ya que hay pedido externo y local
        var fk_id_estado = 1;
        var fecha_creacion = functions.obtenerFechaActual();

        sql = "INSERT INTO pedido(direccion_despacho, fecha_creacion, fk_id_tipo, fk_id_ciudad, fk_id_usuario, fk_id_estado) VALUES (:direccion_despacho,to_DATE(:fecha_creacion,'YYYY/MM/DD'),:fk_id_tipo,:fk_id_ciudad,:fk_id_usuario,:fk_id_estado)";
        await settings.OpenConnection(sql, [direccion_despacho, fecha_creacion, fk_id_tipo, fk_id_ciudad, fk_id_usuario, fk_id_estado], true);

        // Si tuvo conexión a la DB
        if (res.status(200)) {
            console.log("[!] Pedido creado con éxito");

            // Tomamos el ultimo registro en la tabla pedido para redirigir al pedido detalle
            sql2 = "SELECT id_pedido FROM (SELECT * FROM pedido ORDER BY id_pedido DESC ) WHERE rownum = 1";
            result = await settings.OpenConnection(sql2, [], true);

            var idPedidoSql = result.rows[0];

            if (idPedidoSql) {
                res.redirect('/pedido_detalles/' + idPedidoSql);
            }
        } else {
            console.log("[!] Ocurrió un error al intentar registrar el pedido ");
            res.redirect('/mispedidos');
        }

    } catch (error) {
        res.status(400);
        res.send("Ocurrió un error al obtener los datos de la base de datos")
        console.log(error);
    }

});


// Agregar Pedido Detalle
router.post('/crearPedidoDetalle', async(req, res) => {
    try {

        var { fk_id_fruta, fk_id_calidad, fk_id_pedido, cantidad } = req.body;
        var fecha_creacion = functions.obtenerFechaActual();

        sql = "INSERT INTO pedido_detalle(cantidad, fecha_creacion, fecha_actualizacion, fk_id_calidad, fk_id_fruta, fk_id_pedido) VALUES (:cantidad, to_DATE(:fecha_creacion,'YYYY/MM/DD'), to_DATE(:fecha_creacion,'YYYY/MM/DD'), :fk_id_calidad, :fk_id_fruta, :fk_id_pedido)";
        await settings.OpenConnection(sql, [cantidad, fecha_creacion, fecha_creacion, fk_id_calidad, fk_id_fruta, fk_id_pedido], true);

        // Si tuvo conexión a la DB
        if (res.status(200)) {
            console.log("[!] Pedido detalle creado con éxito");
            functions.ListarPedidoDetalles();
            res.redirect('/pedido_detalles/' + fk_id_pedido);
        } else {
            console.log("[!] Ocurrió un error al intentar registrar el pedido detalle ");
            res.redirect('/mispedidos');
        }

    } catch (error) {
        res.status(400);
        res.send("Ocurrió un error al obtener los datos de la base de datos")
        console.log(error);
    }

});


//Confirmar pedido
router.get("/confirmarPedido/:id_pedido", async(req, res) => {
    try {

        var id_pedido_bind = req.params.id_pedido;

        sql = "UPDATE pedido SET fk_id_estado=2 WHERE id_pedido = :id_pedido_bind";
        var consulta = await settings.OpenConnection(sql, [id_pedido_bind], true);

        if (consulta) {
            console.log("[!] Pedido " + req.params.id_pedido + " enviado con éxito");
            res.redirect('/mispedidos');
        } else {
            console.log("[!] Ocurrió un error al intentar enviar el pedido " + req.params.id_pedido);
            res.redirect('/mispedidos');
        }

    } catch (error) {
        res.status(400);
        res.send("Ocurrió un error al obtener los datos de la base de datos")
        console.log(error);
    }

});


//Eliminar Pedido Detalle
router.get("/eliminarPedidoDetalles/:id_pedidoD", async(req, res) => {
    try {

        var id_pedido_bind = req.params.id_pedidoD;

        sql = "DELETE FROM pedido_detalle WHERE id_pedidoD = :id_pedidoD";
        var consulta = await settings.OpenConnection(sql, [id_pedido_bind], true);

        if (consulta) {
            console.log("[!] Detalle pedido " + id_pedido_bind + " eliminado con éxito");
            functions.ListarPedidoDetalles();
            res.redirect(req.get('referer'));
        } else {
            console.log("[!] Ocurrió un error al intentar eliminar el detalle pedido " + id_pedido_bind);
        }

    } catch (error) {
        res.status(400);
        res.send("Ocurrió un error al obtener los datos de la base de datos")
        console.log(error);
    }

});


//Anular pedido - tambien se tienen que cancelar las subastas y todo
router.get("/anularPedido/:id_pedido", async(req, res) => {
    try {

        var id_pedido_bind = req.params.id_pedido;

        sql = "UPDATE pedido SET fk_id_estado=8 WHERE id_pedido = :id_pedido_bind";
        await settings.OpenConnection(sql, [id_pedido_bind], true);

        if(res.status(200)) {
            console.log("[!] Pedido " + id_pedido_bind + " anulado con éxito");
            res.redirect('/pedidos');
        } else {
            console.log("[!] Ocurrió un error al intentar anular el pedido " + id_pedido_bind);
            res.redirect('/pedidos');
        }

    } catch (error) {
        res.status(400);
        res.send("Ocurrió un error al obtener los datos de la base de datos")
        console.log(error);
    }

});


//Anular pedido
router.get("/anularMiPedido/:id_pedido", async(req, res) => {
    try {
        
        var id_pedido_bind = req.params.id_pedido;

        sql = "UPDATE pedido SET fk_id_estado=8 WHERE id_pedido = :id_pedido_bind";
        await settings.OpenConnection(sql, [id_pedido_bind], true);

        if(res.status(200)) {
            console.log("[!] Pedido " + id_pedido_bind + " anulado con éxito");
            res.redirect('/mispedidos');
        } else {
            console.log("[!] Ocurrió un error al intentar anular el pedido " + id_pedido_bind);
            res.redirect('/mispedidos');
        }

    } catch (error) {
        res.status(400);
        res.send("Ocurrió un error al obtener los datos de la base de datos")
        console.log(error);
    }

});


module.exports = router;
