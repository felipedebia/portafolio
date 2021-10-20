var express = require('express');
var router = express.Router();
const BD = require('../bin/configbd');

var request = require('request');

// Función que devuelve una promesa
function requestApiListadoUsuarios() {
	return new Promise(function(resolve, reject) {
		request('http://localhost:3000/api/listarUsuarios', function (error, response, body) {
			if (error) return reject(error);
				importedJSON = JSON.parse(body);
				return resolve(importedJSON);
		});
	});
};

var listadoUsuariosPromesa = requestApiListadoUsuarios();

// Rutas de usuarios

router.get('/', function(req, res, next) {
	if (req.session.isLoggedIn) {
		res.redirect('panel');
	} else {
		res.render('login', { title: 'Ingresar - Maipo Grande',funca:false});
	}
});


// POST: Login de usuario
router.post('/auth', async (req, res) => {
	if (req.body.correo && req.body.password) {
		binds = { "correo_bind": req.body.correo, "password_bind": req.body.password };
		sql = 'SELECT correo, nombre, apellido, tipo_usuario, num_documento FROM usuario WHERE correo = :correo_bind AND password = :password_bind';

        result = await BD.Open(sql, binds, false);

		  	// Si los datos estan correctos
			if (result.rows.length > 0) {

				var tiposUsuarios = {
					1 : "Administrador",
					2 : "Transportista",
					3 : "Cliente Externo",
					4 : "Cliente Interno",
					5 : "Productor",
					6 : "Consultor"
				};

				var tipoUsuarioTexto = tiposUsuarios[result.rows[0][3]];

				req.session.isLoggedIn = true;
				// Guardamos datos del usuario en session
				req.session.correo = result.rows[0][0];
				req.session.nombre = result.rows[0][1];
				req.session.apellido = result.rows[0][2];
				req.session.tipo_usuario = result.rows[0][3];
				req.session.tipo_usuario_texto = tipoUsuarioTexto;
				req.session.num_documento = result.rows[0][4];
				res.redirect('/panel');
				console.log("[!] Usuario " + req.body.correo + " conectado con éxito");
			} else {
				console.log("[!] Intento de conexión fallido usando " + req.body.correo);
				res.render('login', {title: 'Ingresar - Maipo Grande',funca:true});
			}
	}
});

router.get('/panel', function(req, res) {
	if (req.session.isLoggedIn) {
		res.render('panel', { title: 'Panel de Administración - Maipo Grande' });
	} else {
		res.redirect('/');
	}
	res.end();
});

router.get('/logout', function(req, res, next) {
	req.session.isLoggedIn = false;
	res.redirect('/');
});


// CRUD USUARIOS

// Modificar
router.get('/modificarUsuario', async function(req, res, next) {
	res.send('Debes ingresar un ID para modificar un usuario');
})

router.get('/modificarUsuario/:id_usuario', async function(req, res, next) {
	if (req.session.isLoggedIn) {

		const { id_usuario } = req.params;

		// Hacemos una consulta trayendo todos los datos del usuario
		binds = {"id_usuario": id_usuario};
		sql = "SELECT num_documento, tipo_usuario, nombre, apellido, fecha_nacimiento, genero, correo, estado_cuenta, telefono, password FROM usuario WHERE id_usuario = :id_usuario";
		result = await BD.Open(sql, binds, false);
		
		// Si los datos estan correctos
		if (result.rows.length > 0) {
			// Asignamos los valores de la consulta a las variables
			var usuarioData = [
				{
					num_documento: result.rows[0][0],
					tipo_usuario: result.rows[0][1],
					nombre: result.rows[0][2],
					apellido: result.rows[0][3],
					fecha_nacimiento: result.rows[0][4],
					genero: result.rows[0][5],
					correo: result.rows[0][6],
					estado_cuenta: result.rows[0][7],
					telefono: result.rows[0][8],
					password: result.rows[0][9]
				  }
			];

			// Mostramos la vista
			res.render('modificarUsuario', { title: 'Modificar Usuario - Maipo Grande', data:usuarioData });
		} else {
			res.send('Error al obtener datos de la base de datos');
		}
	} else {
		res.redirect('/usuarios');
	}
	res.end();
})

// Ver
router.get('/perfil', async function(req, res, next) {
	
})

router.get('/perfil/:id_usuario', async function(req, res, next) {

})

router.get('/usuarios', function(req, res) {
    if (req.session.isLoggedIn) {
        res.render('usuarios', { title: 'Usuarios - Maipo Grande' });
    } else {
        res.redirect('/');
    }
    res.end();
});

router.get('/plantilla', function(req, res) {
    if (req.session.isLoggedIn) {
        res.render('plantilla', { title: 'Plantilla - Maipo Grande' });
    } else {
        res.redirect('/');
    }
    res.end();
});

router.get('/plantilla_con_tabla', function(req, res) {
    if (req.session.isLoggedIn) {
        res.render('plantilla_con_tabla', { title: 'Plantilla - Maipo Grande' });
    } else {
        res.redirect('/');
    }
    res.end();
});

// CRUD VENTAS

module.exports = router;
