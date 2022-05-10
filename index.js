const http = require("http");
//Requerimiento 1) Módulo FileSystem
const fs = require("fs");
const { v4: uuidv4} = require("uuid");
const url = require("url");
const {nuevoRoommate, saveUser,reset} = require("./roomate.js");
const {enviarCorreo} = require("./correo");
const {agregaGasto,modificaGasto,} = require("./calculos");

http
  .createServer((req, res) => {
    if (req.url == "/" && req.method == "GET") {
      res.setHeader("content-type", "text/html");
      res.end(fs.readFileSync("index.html", "utf8"));
    }

// Requerimiento 3) Genera petición POST 
    if (req.url.startsWith("/roommate") && req.method == "POST") {
      nuevoRoommate()
        .then(async (usuario) => {
          saveUser(usuario);
          res.end(JSON.stringify(usuario, null, 1));
        })
//Requerimiento 2) Captura de errores
        .catch((e) => {
          res.statusCode = 500;
          res.end();
          console.log("Error en el registro usuario", e);
        });
    }

//Requerimiento 5) Creación de API REST
    if (req.url.startsWith("/deleteUser") && req.method == "DELETE") {
      nuevoRoommate()
        .then(async (usuario) => {
          reset(usuario);
          res.end(JSON.stringify(usuario, null, 1));
        })
        .catch((e) => {
          res.statusCode = 500;
          res.end();
          console.log("Error al eliminar usuario", e);
        });
    }



    if (req.url.startsWith("/roommates") && req.method == "GET") {
      res.setHeader("content-type", "application/json");
      res.end(fs.readFileSync("roommates.json", "utf8"));
    }


    let gastosJSON = JSON.parse(fs.readFileSync("gastos.json", "utf8"));
    let gastos = gastosJSON.gastos;



    if (req.url.startsWith("/gastos") && req.method == "GET") {
      res.end(JSON.stringify(gastosJSON, null, 1));
    }



    if (req.url.startsWith("/gasto") && req.method == "POST") {
      let body;

      req.on("data", (payload) => {
        body = JSON.parse(payload);
      });

      req.on("end", () => {
        gasto = {
          id: uuidv4().slice(30),
          roommate: body.roommate,
          descripcion: body.descripcion,
          monto: body.monto,
        };
        gastos.push(gasto);

        agregaGasto(body);



        let verRm = JSON.parse(fs.readFileSync("roommates.json", "utf8"));
        let datosRm = verRm.roommates;
        let nombre = gastos.map((e) => e.roommate);
        let descripcion = gastos.map((e) => e.descripcion);
        let monto = gastos.map((e) => e.monto);
        let correos = datosRm.map((e) => e.correo);

        enviarCorreo(nombre, descripcion, monto, correos)
          .then(() => {
            res.end();
          })
          .catch((e) => {
            res.statusCode = 500;
            res.end();
            console.log("Error en el envío de correo", e);
          });

        fs.writeFileSync("gastos.json", JSON.stringify(gastosJSON, null, 1));
        res.end();
      });
    }



    if (req.url.startsWith("/gasto") && req.method == "PUT") {
      let body;


      const {
        id
      } = url.parse(req.url, true).query;

      req.on("data", (payload) => {
        body = JSON.parse(payload);
        body.id = id;
      });

      req.on("end", () => {
        modificaGasto(body);

        gastosJSON.gastos = gastos.map((g) => {
          if (g.id == body.id) {
            return body;
          }
          return g;
        });
        fs.writeFileSync("gastos.json", JSON.stringify(gastosJSON, null, 1));
        res.end();
      });
    }


    if (req.url.startsWith("/gasto") && req.method == "DELETE") {
      const {
        id
      } = url.parse(req.url, true).query;
      gastosJSON.gastos = gastos.filter((g) => g.id !== id);
      fs.writeFileSync("gastos.json", JSON.stringify(gastosJSON, null, 1));
      res.end();
    }
  })
  .listen(3000, console.log("Servidor disponible en http://localhost:3000"));