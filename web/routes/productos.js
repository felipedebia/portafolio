// Importaciones
const express = require('express');
const router = express.Router();
const settings = require('../bin/settings');
var moment = require('moment');
var functions = require('./functions');

// CRUD PRODUCTOS

// Listar todos los productos
router.get('/listarProductos', async (req, res) => {
  try {
  
    binds = {};
    sql = "SELECT p.id_producto, p.cantidad, p.fecha_creacion, p.fk_id_fruta, f.nombre, p.fk_id_calidad, fr.nombre, p.fk_id_usuario, CONCAT(CONCAT(u.nombre,' '), u.apellido), p.fk_id_estado, ep.descripcion FROM producto p JOIN fruta f ON p.fk_id_fruta = f.id_fruta JOIN fruta_calidad fr ON p.fk_id_calidad=fr.id_calidad JOIN usuario u ON p.fk_id_usuario=u.id_usuario JOIN estado_producto ep ON p.fk_id_estado=ep.id_estado";
    result = await settings.OpenConnection(sql, binds, true);

    Productos = [];

    result.rows.map(producto => {
        let productoSchema = {
            "id_producto": producto[0],
            "cantidad": producto[1],
            "fecha_creacion": moment(producto[2]).format('DD-MM-YYYY'),
            "fk_id_fruta":producto[3],
            "fk_nombre_fruta": producto[4],
            "fk_id_calidad": producto[5],
            "fk_nombre_calidad": producto[6],
            "fk_id_usuario":producto[7],
            "fk_nombre_usuario": producto[8],
            "fk_id_estado": producto[9],
            "fk_texto_estado": producto[10]
            
        }

        Productos.push(productoSchema);
    })
    res.json({title: 'Productos', 'mydata': Productos});

  } catch (error) {
    res.status(400);
    res.json({ "error": error });
    console.log(error);
  }

});


// Agregar Producto
router.post('/crearProducto', async (req, res) => {
  try {

    var { cantidad, fk_fruta, fk_calidad } = req.body;
    var fecha_creacion = functions.obtenerFechaActual();
    var fk_id_estado = 1;
    var fk_usuario = req.session.id_usuario;

    sql = "CALL PA_PRODUCTO_CREAR(:cantidad, :fecha_creacion, :fk_fruta, :fk_calidad, :fk_usuario, :fk_id_estado)";
    resultado = await settings.OpenConnection(sql, [cantidad, fecha_creacion, fk_fruta, fk_calidad, fk_usuario, fk_id_estado], true);

    // Si tuvo conexi??n a la DB
    if(resultado) {
      console.log("[!] Producto creado con ??xito");
      var refresh_page = "true";
      res.redirect('/productos/?refresh_status=' + refresh_page);
    } else {
      console.log("[!] Ocurri?? un error al intentar crear el producto");
      res.redirect('/productos');
    }

  } catch (error) {
    res.status(400);
    res.send("Ocurri?? un error al obtener los datos de la base de datos")
    console.log(error);
  }

});


// Modificar producto
router.post("/modificarProducto/:id_producto", async (req, res) => {
  try {
  
    var id_producto = req.params.id_producto;
    var { cantidad, fk_id_fruta, fk_id_calidad} = req.body;
    
    sql = "CALL PA_PRODUCTO_UPDATE(:id_producto, :cantidad, :fk_id_fruta, :fk_id_calidad)";
    resultado = await settings.OpenConnection(sql, [id_producto, cantidad, fk_id_fruta, fk_id_calidad], true);

    // Si tuvo conexi??n a la DB
    if(resultado) {
      console.log("[!] Producto " + id_producto + " modificado con ??xito");
      var refresh_page = "true";
      res.redirect('/productos/?refresh_status=' + refresh_page);
    } else {
      console.log("[!] Ocurri?? un error al intentar modificar el producto " + id_producto);
      res.redirect('/productos');
    }

  } catch (error) {
    res.status(400);
    res.send("Ocurri?? un error al obtener los datos de la base de datos")
    console.log(error);
  }

});


// Anular producto
router.get("/anularProducto/:id_producto", async (req, res) => {
  try {

    var id_producto_bind = req.params.id_producto;

    sql = "CALL PA_PRODUCTO_ANULAR(:id_producto_bind)";
    resultado = await settings.OpenConnection(sql, [id_producto_bind], true);

    if(resultado) {
      console.log("[!] Producto " + id_producto_bind + " anulado con ??xito");
      var refresh_page = "true";
      res.redirect('/productos/?refresh_status=' + refresh_page);
    } else {
      console.log("[!] Ocurri?? un error al intentar anular el producto " + id_producto_bind);
      res.redirect('/productos');
    }

  } catch (error) {
    res.status(400);
    res.send("Ocurri?? un error al obtener los datos de la base de datos")
    console.log(error);
  }

});


module.exports = router;