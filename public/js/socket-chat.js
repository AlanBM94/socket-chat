var socket = io();

let params = new URLSearchParams(window.location.search);

if (!params.has("usuario") || !params.has("sala")) {
  window.location = "index.html";
  throw new Error("El nombre y la sala son necesarios");
}

const usuario = {
  nombre: params.get("usuario"),
  sala: params.get("sala")
};

socket.on("connect", function() {
  console.log("Conectado al servidor");
  socket.emit("entrarChat", { usuario }, function(resp) {
    console.log("Usuarios conectados", resp);
    return resp;
  });
});

// escuchar
socket.on("disconnect", function() {
  console.log("Perdimos conexión con el servidor");
});

socket.on("crearMensaje", mensaje => {
  console.log("Servidor:", mensaje);
});

// Cuando un usuario entra o sale del chat
socket.on("listaPersonas", personas => {
  console.log(personas);
});

// Mensajes privados

socket.on("mensajePrivado", mensaje => {
  console.log(`Mensaje privado: `, mensaje);
});
