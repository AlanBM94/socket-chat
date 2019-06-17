const { io } = require("../server");

const { Usuario } = require("../classes/usuario");

const usuario = new Usuario();

const { crearMensaje } = require("../utils/utilidades");

io.on("connection", client => {
  client.on("entrarChat", (data, callback) => {
    console.log(data);
    console.log(data);
    if (!data.nombre || !data.sala) {
      return callback({
        error: true,
        mensaje: "El nombre/sala es necesario"
      });
    }
    client.join(data.sala);
    let personas = usuario.agregarPersona(client.id, data.nombre, data.sala);
    client.broadcast
      .to(data.sala)
      .emit("listaPersonas", usuario.getPersonasPorSala(data.sala));
    client.broadcast
      .to(data.sala)
      .emit(
        "crearMensaje",
        crearMensaje("Administrador", `${data.nombre} se unió`)
      );
    callback(usuario.getPersonasPorSala(data.sala));
  });

  client.on("crearMensaje", (data, callback) => {
    let persona = usuario.getPersona(client.id);
    let mensaje = crearMensaje(persona.nombre, data.mensaje);
    client.broadcast.to(persona.sala).emit("crearMensaje", mensaje);
    callback(mensaje);
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
