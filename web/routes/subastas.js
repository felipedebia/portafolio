// Importaciones
const express = require('express');
const router = express.Router();
const BD = require('../bin/configbd');

// CRUD SUBASTA TRANSPORTES

// Leer - Todos las subastas Frutas
router.get('/listarSubastasFrutas', async (req, res) => {
  
  binds = {};
  sql = "SELECT id_subastaF, fecha_creacion, fecha_actualizacion, fecha_termino, estado_subasta FROM subasta_fruta";
  result = await BD.Open(sql, binds, true);

  Subastas = [];

  result.rows.map(subasta => {
      let subastaSchema = {
          "id_subastaF": subasta[0],
          "fecha_creacion": subasta[1],
          "fecha_actualizacion": subasta[2],
          "fecha_termino": subasta[3],
          "estado_subasta": subasta[4]
      }

      Subastas.push(subastaSchema);
  })
  res.json({title: 'Subastas', 'mydata': Subastas});
});


// Leer - Subasta en especifico Frutas
router.get('/listarSubastasFrutas/:id_subastaF', async (req, res) => {
  
  binds = { "id_subastaF_bind": req.params.id_subasta };
  sql = "SELECT fecha_creacion, fecha_actualizacion, fecha_termino, estado_subasta FROM subasta_fruta WHERE id_subastaF = :id_subastaF_bind";
  result = await BD.Open(sql, binds, true);

  Subastas = [];

  result.rows.map(subasta => {
      let subastaSchema = {
        "id_subastaF": id_subastaF_bind,
        "fecha_creacion": subasta[0],
        "fecha_actualizacion": subasta[1],
        "fecha_termino": subasta[2],
        "estado_subasta": subasta[3]
      }

      Subastas.push(subastaSchema);
  })
  res.json({title: 'Subastas', 'mydata': Subastas});
});


// Anular Frutas
router.get("/anularSubastaFruta/:id_subasta", async (req, res) => {
  var { id_subasta } = req.params;
  sql = "UPDATE subasta_fruta SET estado_subasta=2 WHERE id_subasta = :id_subasta";
  await BD.Open(sql, [id_subasta], true);

  if(res.status(200)) {
    console.log("[!] Subasta de Frutas " + req.params.id_subasta + " anulada con éxito");
    res.redirect('/ventas');
	} else {
		console.log("[!] Ocurrió un error al intentar anular la subasta de Frutas " + req.params.id_subasta);
    res.redirect('/ventas');
	}
})


// CRUD SUBASTA TRANSPORTES

// Leer - Todos las subastas Transportes
router.get('/listarSubastasTransportes', async (req, res) => {
  
  binds = {};
  sql = "SELECT id_subastaT, fecha_creacion, fecha_actualizacion, fecha_termino, cantidad, direccion_despacho, estado_subasta FROM subasta_transporte";
  result = await BD.Open(sql, binds, true);

  Subastas = [];

  result.rows.map(subasta => {
      let subastaSchema = {
          "id_subastaT": subasta[0],
          "fecha_creacion": subasta[1],
          "fecha_actualizacion": subasta[2],
          "fecha_termino": subasta[3],
          "cantidad": subasta[4],
          "direccion_despacho": subasta[5],
          "estado_subasta": subasta[6]
      }

      Subastas.push(subastaSchema);
  })
  res.json({title: 'Subastas', 'mydata': Subastas});
});


// Leer - Subasta en especifico Transportes
router.get('/listarSubastasTransportes/:id_subastaT', async (req, res) => {
  
  binds = { "id_subastaT_bind": req.params.id_subasta };
  sql = "SELECT fecha_creacion, fecha_actualizacion, fecha_termino, cantidad, direccion_despacho, estado_subasta FROM subasta_transporte WHERE id_subasta = :id_subastaT_bind";
  result = await BD.Open(sql, binds, true);

  Subastas = [];

  result.rows.map(subasta => {
      let subastaSchema = {
        "id_subastaT": id_subastaT_bind,
        "fecha_creacion": subasta[0],
        "fecha_actualizacion": subasta[1],
        "fecha_termino": subasta[2],
        "cantidad": subasta[4],
        "direccion_despacho": subasta[5],
        "estado_subasta": subasta[6]
      }

      Subastas.push(subastaSchema);
  })
  res.json({title: 'Subastas', 'mydata': Subastas});
});


// Anular Transportes
router.get("/anularSubastaTransport/:id_subasta", async (req, res) => {
  var { id_subasta } = req.params;
  sql = "UPDATE subasta_transporte SET estado_subasta=2 WHERE id_subasta = :id_subasta";
  await BD.Open(sql, [id_subasta], true);

  if(res.status(200)) {
    console.log("[!] Subasta de Transportes " + req.params.id_subasta + " anulada con éxito");
    res.redirect('/ventas');
	} else {
		console.log("[!] Ocurrió un error al intentar anular la subasta de Transporte " + req.params.id_subasta);
    res.redirect('/ventas');
	}
})

module.exports = router;
