const express = require('express');

const bcrypt = require('bcrypt');
const _ = require('underscore');

const Usuario = require('../models/usuario');

const app = express();

app.get('/usuario',  (req, res) => {

    let desde = req.query.desde || 0;
    let limite = req.query.limite || 5;
    // Filtrar únicamente los registros que tienen estado 'true'
    Usuario.find({estado: true}, 'nombre email role estado google img') // Muestra los registros que tenemos almacenados en nuestra base de datos, pero con los parametros 'nombre email' únicamente estos se veran reflejados en nuestra response
            .skip(+desde) // Nos permite crear una paginación de nuestros registros
            .limit(+limite) // Establece el límite de 5 registros para permitir la paginación de los registros
            .exec((err, usuarios) => {
                if(err) {
                    return res.status(400).json({
                        ok: false,
                        err
                    })
                }

                Usuario.count({estado: true}, (err, conteo) => {
                    res.json({
                        ok: true,
                        usuarios,
                        totalRegistros: conteo
                    })
                })
            })
    // res.json('get Usuario LOCAL');
});

app.post('/usuario',  (req, res) => {

    let body = req.body;

    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10), // Encripta nuestra contraseña
        img: body.img,
        role: body.role
    })

    usuario.save( (err, usuarioDB) => {

        if(err) {
            return res.status(400).json({
                ok: false,
                err
            })
        }

        // usuarioDB.password = null;

        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });

    // if(body.nombre === undefined) {
    //     res.status(400).json({
    //         ok: false,
    //         mensaje: 'El nombre es necesario.'
    //     });
    // } else {
    //     res.json({
    //         persona: body
    //     });
    // }
});

app.put('/usuario/:id',  (req, res) => {

    let id = req.params.id;
    let body = _.pick(req.body, ['nombre', 'email', 'img', 'role', 'estado']) ;

    Usuario.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, usuarioDB) => {
        // {new: true, runValidators: true} new es para que el registro se actualice mientras hacemos pruebas en POSTMAN, runValidators, es por ejemplo, cumplir las reglas dentro de nuestro registro, en este caso el rol solo tiene dos opciones, ADMIN_ROLE ó USER_ROLE, si se introduce otro valor, el mismo será rechazado
        if(err) {
            return res.status(400).json({
                ok: false,
                err
            })
        }

        res.json({
            ok: true,
            usuario: usuarioDB
        });
    })

});

app.delete('/usuario/:id',  (req, res) => {

    let id = req.params.id;

    let cambiarEstado = {
        estado: false
    }

    // Usuario.findByIdAndDelete(id, (err, usuarioBorrado) => {
    Usuario.findByIdAndUpdate(id, cambiarEstado, {new: true}, (err, usuarioDesactivado) => {
        if(err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            usuario: usuarioDesactivado
        });
    })

    // res.json('delete Usuario');
});

module.exports = app;