const express = require("express");
const axios = require("axios");
const moment = require("moment");
const _ = require("lodash");
const { v4: uuidv4 } = require("uuid");
const chalk = require('chalk');//SE DEBIO INSTALAR VERSION 4.1.2 YA QUE DABA ERROR AL SER ESM
const app = express();
const port = 3001;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});


const exphbs = require("express-handlebars");
app.engine(
  "handlebars",
  exphbs.engine({
    //defaultLayout: "main",
    layoutsDir: __dirname + "/views/layouts/",
    partialsDir: __dirname + "/views/partials/",
  })
);
app.set("view engine", "handlebars");

//ESTATICOS
app.use(express.static("public"));
app.use("/jquery", express.static(__dirname + "/node_modules/jquery/dist"));
app.use("/axios", express.static(__dirname + "/node_modules/axios/dist"));
app.use("/uuid", express.static(__dirname + "/node_modules/uuid/dist"));
app.use(
  "/bootstrap_css",
  express.static(__dirname + "/node_modules/bootstrap/dist/css")
);
app.use("/bootstrap_js", express.static("./node_modules/bootstrap/dist/js"));
app.use(
  "/fontawesome",
  express.static(__dirname + "/node_modules/@fortawesome/fontawesome-free")
);

// Middleware CONVIERTE EN OBJETOS JS ACCECIBLES POR req.body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware PARA VER SOLICITUDES ENTRANTES
app.use((req, res, next) => {
  console.log(chalk.blue.bgRed.bold(`Solicitud recibida: ${req.method} ${req.url}`))
  next();
});

app.get("/", (req, res) => {
  res.render("home", { layout: "main" });
});

app.get("/api/randomuser", (req, res) => {
  axios
    .get("https://randomuser.me/api/")
    .then((response) => {
      const datos = response.data;
      const uuid = uuidv4();
      const fechaF = fecha();
      console.log(chalk.blue.bgWhite.bold(`Datos enviados: ${JSON.stringify(datos)} `));
      res.json({ ...datos, uuid, fechaF });
    })
    .catch((error) => {
      console.log(error);
    });

  function fecha() {
    const fecha = moment();
    const fechaFormat = `${fecha.format("MMMM")} ${fecha.format(
      "Do"
    )} ${fecha.format("YYYY")}, ${fecha.format("hh")}:${fecha.format(
      "mm"
    )}:${fecha.format("ss")} ${fecha.format("A")}`;
    return fechaFormat;
  }
});

app.post("/api/randomuser/postdatos", (req, res) => {
  const pacientesListF = req.body;
  const pacientesPorGenero = _.partition(
    pacientesListF,
    (paciente) => paciente.genero === "female"
  );
  console.log(chalk.blue.bgWhite.bold("Server: Recibido lista pacientes: ", JSON.stringify(pacientesListF)));//SE FORMATEA YA QUE CHALK NO MANEJA BIEN EL FORMATO
  console.log(chalk.blue.bgWhite.bold("Server: Lista particionada: ", JSON.stringify(pacientesPorGenero)));
  req.app.locals.pacientesPorGenero = pacientesPorGenero; //SE GUARDA EN VARIABLE LOCAL
  res.json({ success: true }); //NECESITA RESPUESTA YA QUE SOLIICITUD QUEDA EN ESPERA
});
app.get("/vista-generos", (req, res) => {
  const pacientesPorGenero = req.app.locals.pacientesPorGenero || [[], []]; //OR SE ASEGURA DE QUE SIEMPRE SEA SUBARREGLO EN CASO DE NO HABER DATOS EN ALGUNO
  //console.log(pacientesPorGenero);
  res.render("vistaGeneros", { layout: "main", pacientesPorGenero });
});
