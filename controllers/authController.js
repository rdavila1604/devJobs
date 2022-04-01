// const { Router } = require('express');
const passport = require('passport');
const Usuarios = require('../models/Usuarios');
const Vacante = require('../models/Vacantes');
const crypto = require('crypto');
const { enviar } = require('../handlers/email');



exports.autenticarUsuario = passport.authenticate('local',{
    successRedirect: '/administracion',
    failureRedirect: '/iniciar-sesion',
    failureFlash: true,
    badRequestMessage: 'Ambos campos son obligatorios'
    
});
//Revisar si el usuario esta autenticado o no
exports.verificarUsuario = (req, res, next) => {

    //revisar el usuario
    if(req.isAuthenticated()) {
        return next(); // estan autenticados
    }

    //redireccionar
    res.redirect('/iniciar-sesion');
}

exports.mostrarPanel = async (req, res) => {
    //Consultar el usuario autenticado
    const vacantes = await Vacante.find({autor: req.user._id}).lean();

    res.render('administracion', {
        nombrePagina: 'Panel de Administracion',
        tagline: 'Crea y Administra tus vacantes desde aquí',
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen,
        vacantes: vacantes
    });
};

exports.cerrarSesion = (req, res) => {
    req.logout();
    req.flash('correcto', 'Cerraste Sesión Correctamente');
    return res.redirect('/iniciar-sesion');
}

// Formulario para reiniciar el password
exports.formReestablecerPassword = (req,res) => {
    res.render('restablecer-password', {
        nombrePagina: 'Reestablece tu Password',
        tagline: 'Si ya tienes una cuenta pero olvidaste tu password, coloca tu email'
    })

}
//Genera el Token en la tabla del usuario
exports.enviarToken = async (req, res) => {

    const usuario = await Usuarios.findOne({ email: req.body.email });
    // console.log(usuario);
    // return;

    if(!usuario) {
        req.flash('error', 'No existe esa cuenta');
        return res.redirect('/iniciar-sesion');
    }
    //el usuario existe, generar token
    usuario.token = crypto.randomBytes(20).toString('hex');
    usuario.expira = Date.now() + 3600000;

    //Guardar el usuario
    await usuario.save();
    const resetUrl = `http://${req.headers.host}/restablecer-password/${usuario.token}`;

    // console.log(resetUrl);

    //TODO : Enviar notificacion por email
    await enviar({
        usuario,
        subject: 'Password Reset',
        resetUrl,
        archivo: 'reset'
    });

    //Todo Correcto
    req.flash('correcto', 'Revisa tu email para las indicaciones');
    res.redirect('/iniciar-sesion');
}

//Valida si el token es valido y el usuario existe, muestra la vista.
exports.restablecerPassword = async (req, res) => {
    const usuario = await Usuarios.findOne({
        token: req.params.token,
        expira: {
            $gt : Date.now()
        }
    });

    if(!usuario) {
        req.flash('error', 'El formulario ya no es valido, intenta de nuevo');
        return res.redirect('/restablecer-password');
    }
    //Todo bien, mostrar el formulario
    res.render('nuevo-password', {
        nombrePagina : 'Nuevo Password'
    })
}
//alamacena el nuevo password en la BD
exports.guardarPassword = async (req, res) => {
    const usuario = await Usuarios.findOne({
        token: req.params.token,
        expira: {
            $gt : Date.now()
        }
    });
    //no existe el usuario o el token es inválido
    if(!usuario) {
        req.flash('error', 'El formulario ya no es valido, intenta de nuevo');
        return res.redirect('/restablecer-password');
    }

    //guardar en la bd
    usuario.password = req.body.password;
    usuario.token = undefined;
    usuario.expira = undefined;

    //agrega y eliminar valores del objeto
    await usuario.save();

    //redirigir
    req.flash('correcto', 'Password Modificado Correctamente');
    res.redirect('/iniciar-sesion');

}

