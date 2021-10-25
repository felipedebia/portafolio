// Importaciones
const express = require('express');
const router = express.Router();
const BD = require('../bin/configbd');

// Contraseña
var SimpleCrypto = require("simple-crypto-js").default
const secretKey = "1X42JJKLjkuid"
const simpleCryp = new SimpleCrypto(secretKey)

// CRUD USUARIOS

// Leer - Todos los usuarios
router.get('/listarUsuarios', async (req, res) => {
  
  binds = {};
  sql = "SELECT id_usuario, num_documento, nombre, apellido, fecha_nacimiento, genero, correo, telefono, password, fk_id_estado, fk_id_tipo FROM usuario";
  result = await BD.Open(sql, binds, true);

  Usuarios = [];

  result.rows.map(user => {
      let userSchema = {
        "id_usuario": user[0],
        "num_documento": user[1],
        "nombre": user[2],
        "apellido": user[3],
        "fecha_nacimiento": user[4],
        "genero": user[5],
        "correo": user[6],
        "telefono": user[7],
        "password": user[8],
        "fk_id_estado": user[9],
        "fk_id_tipo": user[10]
      }

      Usuarios.push(userSchema);
  })
  res.json({title: 'Usuarios', 'mydata': Usuarios});
});


// Leer - Usuario en especifico
router.get('/listarUsuarios/:id_usuario', async (req, res) => {
  
  binds = { "id_usuario_bind": req.params.id_usuario };
  sql = "SELECT id_usuario, num_documento, nombre, apellido, fecha_nacimiento, genero, correo, telefono, password, fk_id_estado, fk_id_tipo FROM usuario WHERE id_usuario = :id_usuario_bind";
  result = await BD.Open(sql, binds, true);

  Usuarios = [];

  result.rows.map(user => {
      let userSchema = {
        "id_usuario": user[0],
        "num_documento": user[1],
        "nombre": user[2],
        "apellido": user[3],
        "fecha_nacimiento": user[4],
        "genero": user[5],
        "correo": user[6],
        "telefono": user[7],
        "password": user[8],
        "fk_id_estado": user[9],
        "fk_id_tipo": user[10]
      }

      Usuarios.push(userSchema);
  })
  res.json({title: 'Usuarios', 'mydata': Usuarios});
});


// Agregar
// Falta hacer filtro de que no se repita el correo
router.post('/crearUsuario', async (req, res) => {
  var { num_documento, fk_id_tipo, nombre, apellido, fecha_nacimiento, genero, correo, telefono, password } = req.body;
  var fk_id_estado = 1;

  // Encriptamos la contraseña del usuario
  var passwordEncrypted = simpleCryp.encrypt(password)

  sql = "INSERT INTO usuario(num_documento, nombre, apellido, fecha_nacimiento, genero, correo, telefono, password, fk_id_estado, fk_id_tipo) VALUES (:num_documento,:nombre,:apellido,to_DATE(:fecha_nacimiento,'YYYY/MM/DD'),:genero,:correo,:telefono,:passwordEncrypted,:fk_id_estado,:fk_id_tipo)";
  await BD.Open(sql, [num_documento, nombre, apellido, fecha_nacimiento, genero, correo, telefono, passwordEncrypted, fk_id_estado, fk_id_tipo], true);

  // Si tuvo conexión a la DB
  if(res.status(200)) {
    console.log("[!] Usuario " + correo + " creado con éxito");
    res.redirect('/usuarios');
    //res.refresh();
	} else {
		console.log("[!] Ocurrió un error al intentar registrar el usuario " + correo);
    res.redirect('/usuarios');
	}
})


// Modificar
router.post("/modificarUsuario/:id_usuario", async (req, res) => {
  var { id_usuario } = req.params;
  var { correo, nombre, apellido, num_documento, fk_id_tipo, fecha_nacimiento, genero, fk_id_estado, telefono} = req.body;
  sql = "UPDATE usuario SET correo= :correo, nombre= :nombre, apellido= :apellido, num_documento= :num_documento, fk_id_tipo= :fk_id_tipo, fecha_nacimiento= to_DATE(:fecha_nacimiento,'YYYY/MM/DD'), genero= :genero, fk_id_estado= :fk_id_estado, telefono= :telefono WHERE id_usuario= :id_usuario";
  await BD.Open(sql, [correo, nombre, apellido, num_documento, fk_id_tipo, fecha_nacimiento, genero, fk_id_estado, telefono, id_usuario], true);

  // Si tuvo conexión a la DB
  if(res.status(200)) {
    console.log("[!] Usuario " + req.body.correo + " modificado con éxito");
    res.redirect('/usuarios');
  } else {
    console.log("[!] 2- Ocurrió un error al intentar modificar el usuario " + req.body.correo);
    res.redirect('/usuarios');
  }

})


// Desactivar
router.get("/desactivarUsuario/:id_usuario", async (req, res) => {
  var { id_usuario } = req.params;
  sql = "DELETE FROM usuario WHERE id_usuario = :id_usuario";
  //sql = "UPDATE usuario SET fk_id_estado=0 WHERE id_usuario = :id_usuario";
  await BD.Open(sql, [id_usuario], true);

  if(res.status(200)) {
    console.log("[!] Usuario " + req.params.id_usuario + " desactivado con éxito");
    res.redirect('/usuarios');
	} else {
		console.log("[!] Ocurrió un error al intentar desactivar el usuario " + req.params.id_usuario);
    res.redirect('/usuarios');
	}
})


module.exports = router;