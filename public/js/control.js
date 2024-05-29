$(document).ready(() => {
  const pacientesList = {};
  $("#btn-registrar").on("click", function (event) {
    event.preventDefault();
    getDatos();
  });
  $("#btn-lista-generos").on("click", function (event) {
    postDatos();
  });

  function getDatos() {
    axios
      .get("/api/randomuser")
      .then(function (response) {
        const datosRecibidos = $("#datosRecibidos");
        datosRecibidos.empty();
        
        const nombrePaciente = response.data.results[0].name;
        datosRecibidos.append(
          `<p>Nombre del paciente: ${nombrePaciente.first} ${nombrePaciente.last}<br> ${response.data.results[0].gender}</p>`
        );
        $("#datosRecibidos").html("<b>Paciente registrado: </b>")
        $("#datosRecibidos-nombre").html(`<b>Nombre: </b>${nombrePaciente.first}`);
        $("#datosRecibidos-apellido").html(`<b>Apellido: </b>${nombrePaciente.last}`);
        $("#datosRecibidos-genero").html(`<b>Género: </b>${response.data.results[0].gender}`);
        const uuidSlice = response.data.uuid.slice(0, 6);
        pacientesList[uuidSlice] = {
          uuid: uuidSlice,
          nombre: nombrePaciente.first,
          apellido: nombrePaciente.last,
          timeStamp: response.data.fechaF,
          genero: response.data.results[0].gender,
        };
        //console.log(pacientesList);
        mostrarListadoGeneral();
      })
      .catch(function (error) {
        console.error("Error al obtener los datos:", error);
        $("#datosRecibidos").text("Error al obtener los datos");
      });
  }
  function mostrarListadoGeneral() {
    $('#toast-alert').toast('hide');
    const tbody = $("#table-body");
    tbody.empty();
    let contador = 1;
    for (item in pacientesList) {
      const paciente = pacientesList[item];

      tbody.append(`<tr>
        <td>${contador}</td>
        <td>${paciente.uuid}</td>
        <td>${paciente.nombre}</td>
        <td>${paciente.apellido}</td>
        <td>${paciente.timeStamp}</td></tr>`);
      contador++;
    }
  }

  function postDatos() {
    if (Object.keys(pacientesList).length === 0) {
      $('#toast-alert').toast('show');
    } else {
      
      axios
        .post("/api/randomuser/postdatos", pacientesList)
        .then(function (response) {
          const datosXgenero = response.data.pacientesPorGenero;
          //actualizarLista(datosXgenero);
          window.location.href = "/vista-generos";
        })
        .catch(function (err) {
          console.error("Error al enviar datos:", err);
        });
    }
  }
  /*RENDER DE DATOS RECIBIENDO LA RESPUESTA DEL SERVER
  function actualizarLista(datosXgenero) {
    const tbody = $("#table-body");
    tbody.empty();
    let contador = 1;

    for (var j = 0; j < datosXgenero.length; j++) {
      //CADA GENERO
      const pacientes = datosXgenero[j];
      const genero = j === 0 ? "Mujeres" : "Hombres"; //0=FEMALE,1=MALE

      tbody.append(`
            <tr>
                <td ><b>${genero}<b></td>
            </tr>
        `);

      for (var i = 0; i < pacientes.length; i++) {
        //CADA PACIENTE DEL GENERO
        const paciente = pacientes[i];

        tbody.append(`
                <tr>
                    
                    <td>${paciente.uuid}</td>
                    <td>${paciente.nombre}</td>
                    <td>${paciente.apellido}</td>
                    <td>${paciente.timeStamp}</td>
                    <td>${paciente.genero}</td>
                </tr>
            `);
        contador++;
      }
    }
  }*/
});
