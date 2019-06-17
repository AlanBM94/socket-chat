const { io } = require("../server");

const { Usuario } = require("../classes/usuario");

const usuario = new Usuario();

const { crearMensaje } = require("../utils/utilidades");

io.on("connection", client => {
  client.on("entrarChat", (data, callback) => {
    console.log(data);
    console.log(data);
    if (!data.usuario.nombre || !data.usuario.sala) {
      return callback({
        error: true,
        mensaje: "El nombre/sala es necesario"
      });
    }
    client.join(data.usuario.sala);
    let personas = usuario.agregarPersona(
      client.id,
      data.usuario.nombre,
      data.usuario.sala
    );
    client.broadcast
      .to(data.usuario.sala)
      .emit("listaPersonas", usuario.getPersonasPorSala(data.usuario.sala));
    callback(usuario.getPersonasPorSala(data.usuario.sala));
  });

  client.on("crearMensaje", data => {
    let persona = usuario.getPersona(client.id);
    let mensaje = crearMensaje(persona.nombre, data.mensaje);
    client.broadcast.to(persona.sala).emit("crearMensaje", mensaje);
  });

  client.on("disconnect", () => {
    let personaBorrada = usuario.borrarPersona(client.id);
    console.log(personaBorrada);
    client.broadcast
      .to(personaBorrada.sala)
      .emit(
        "crearMensaje",
        crearMensaje("Administrador", `${personaBorrada.nombre} salió`)
      );
    client.broadcast
      .to(personaBorrada.sala)
      .emit("listaPersonas", usuario.getPersonasPorSala(personaBorrada.sala));
  });

  // Mensajes privados
  client.on("mensajePrivado", data => {
    let persona = usuario.getPersona(client.id);
    client.broadcast
      .to(data.para)
      .emit("mensajePrivado", crearMensaje(persona, data.mensaje));
  });
});
