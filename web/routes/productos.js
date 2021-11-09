// Importaciones
const express = require('express');
const router = express.Router();
const settings = require('../bin/settings');
var moment = require('moment');

// CRUD PRODUCTOS

// Leer - Todos los productos
router.get('/listarProductos', async (req, res) => {
  
  binds = {};
  sql = "SELECT id_producto, cantidad, fecha_actualizacion, f.nombre as nombreFruta, fr.nombre as Calidad, u.nombre as usuario FROM producto p LEFT JOIN fruta f ON p.fk_id_fruta = f.id_fruta INNER JOIN fruta_calidad fr ON p.fk_id_calidad=fr.id_calidad LEFT JOIN usuario u ON p.fk_id_usuario=u.id_usuario";
  result = await settings.OpenConnection(sql, binds, true);

  Productos = [];

  result.rows.map(producto => {
      let productoSchema = {
          "id_producto": producto[0],
          "cantidad": producto[1],
          "fecha_actualizacion": moment(producto[2]).format('DD-MM-YYYY'),
          "nombreFruta": producto[3],
          "Calidad": producto[4],
          "usuario": producto[5]
      }

      Productos.push(productoSchema);
  })
  res.json({title: 'Productos', 'mydata': Productos});
});

// Agregar Producto
router.post('/crearProducto', async (req, res) => {
  var { cantidad,fecha_actualizacion,fk_fruta,fk_calidad,fk_usuario } = req.body;
  // Definimos el contrato activado
  

  sql = "INSERT INTO producto(cantidad,fecha_actualizacion,fk_id_fruta,fk_id_calidad,fk_id_usuario) values (:cantidad,to_date(:fecha_actualizacion,'YYYY-MM-DD'),:fk_fruta,:fk_calidad,:fk_usuario)";
  await settings.OpenConnection(sql, [cantidad, fecha_actualizacion, fk_fruta, fk_calidad,fk_usuario], true);

  // Si tuvo conexión a la DB
  if(res.status(200)) {
    console.log("[!] Producto creado con éxito");
    res.redirect('/productos');
    //res.refresh();
	} else {
		console.log("[!] Ocurrió un error al intentar crear el producto");
    res.redirect('/productos');
	}
})

//MODIFICAR
router.post("/modificarProducto/:id_producto", async (req, res) => {
  
  var id_producto = req.params.id_producto;
  var { cantidad, fecha_actualizacion,fk_id_fruta,fk_id_calidad,fk_id_usuario} = req.body;

  sql = "UPDATE producto SET cantidad=:cantidad,fecha_actualizacion=to_date(:fecha_actualizacion,'YYYY-MM-DD'), fk_id_fruta= :fk_id_fruta,fk_id_calidad=:fk_id_calidad,fk_id_usuario=:fk_id_usuario  WHERE id_producto=:id_producto";
  await settings.OpenConnection(sql, [cantidad, fecha_actualizacion,fk_id_fruta,fk_id_calidad,fk_id_usuario, id_fruta], true);

  // Si tuvo conexión a la DB
  if(res.status(200)) {
    console.log("[!] Producto " + id_Producto + " modificado con éxito");
    res.redirect('/productos');
  } else {
    console.log("[!] Ocurrió un error al intentar modificar el producto " + id_producto);
    res.redirect('/productos');
  }

})


// Eliminar
router.get("/eliminarProducto/:id_producto", async (req, res) => {
  var id_producto_bind = req.params.id_producto;
  sql = "DELETE FROM producto WHERE id_producto = :id_producto_bind";
  await settings.OpenConnection(sql, [id_producto_bind], true);

  if(res.status(200)) {
    console.log("[!] Producto " + id_producto_bind + " eliminado con éxito");
    res.redirect('/productos');
	} else {
		console.log("[!] Ocurrió un error al intentar eliminar el producto " + id_producto_bind);
    res.redirect('/productos');
	}
})

module.exports = router;