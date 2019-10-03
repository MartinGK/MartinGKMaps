/************************************************************************************************************/
/***********************Verificacion de existencia del ultimo id en localStorage*****************************/
/************************************************************************************************************/
if (localStorage.getItem('lastId')) {
    var lastId = localStorage.getItem('lastId');
    // lastId = 0;
} else {
    var lastId = 0;
}
var idElim = lastId;
var CirculosEnMapa = [];

/**************************************************************/
/***********************Creacion del mapa**********************/
/**************************************************************/
var mymap = L.map('map').setView([-34.5966417, -58.374097], 16);

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
    maxZoom: 18,
    attribution: 'Martin Gainza | Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
        '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    id: 'mapbox.streets'
}).addTo(mymap);

/***************************************************************************************************/
/***********************Verificacion de existencia de circulos en localStorage**********************/
/***************************************************************************************************/
if (localStorage.getItem('circulos')) {
    var circulos = JSON.parse(localStorage.getItem('circulos'));
    // var circulos = []    
    if (circulos.length) {
        circulos.forEach(circulo => {

            var circle = L.circle([parseFloat(circulo.X), parseFloat(circulo.Y)], {
                color: 'red',
                fillColor: '#8400D3',
                fillOpacity: 0.5,
                radius: 10,
            });

            circle.bindPopup("<div><b>Descripción: </b>" + circulo.desc + "<br><b>Dirección: </b>" + circulo.dir + "<br><b>Telefónico: </b>" + circulo.tel + "<br><b>(X, Y): </b>" + circulo.X + "," + circulo.Y + "<br><b>Categoria: </b>" + circulo.cat + "<br><button class='btn-danger btn-eliminar' onclick='eliminarCirculo(" + circulo.id + ")'><b>Eliminar</b></button></div>");

            circle.hiddenId = circulo.id;

            CirculosEnMapa.push(circle);

            circle.addTo(mymap);
        });
    } else {
        lastId = 0;
    }
} else {
    var circulos = [];
}

/*************************************************************/
/***********************Verificaciones 1**********************/
/*************************************************************/
document.getElementById("telefono").onchange = function() {
    if ((document.getElementById("telefono").value).match(/[^0-9\s-]/g) != null) {
        document.getElementById("telefono").setCustomValidity("El telefono permite solo numeros");
    } else {
        document.getElementById("telefono").setCustomValidity("");
    }
}

/*************************************************************/
/***********************Verificaciones 2**********************/
/*************************************************************/
document.getElementById("coord").onchange = function() {
    let analizar = document.getElementById("coord").value;
    if (analizar.split(",").length != 2) {
        document.getElementById("coord").setCustomValidity("Porfavor siga el ejemplo: 'X,Y'");
    } else {
        let XY = analizar.split(",");
        let X = parseFloat(XY[0]);
        let Y = parseFloat(XY[1]);
        if (isNaN(X) || X > 180 || X < -180 || isNaN(Y) || Y > 90 || Y < -90) {
            document.getElementById("coord").setCustomValidity("Porfavor ingrese dos numeros entre X: -180 y 180 y Y: -90 y 90");
        } else {
            document.getElementById("coord").setCustomValidity("");
        }
    }

};

/******************************************************************/
/***********************Verificacion de Datos**********************/
/******************************************************************/
function verificar(X, Y, nombre, direccion, telefono, categoria) {
    if (parseFloat(X) > 180 || parseFloat(X) < -180 || isNaN(parseFloat(X)) || parseFloat(Y) > 90 || parseFloat(Y) < -90 || isNaN(parseFloat(Y))) {
        // alert("Error, revisar float/s.\n (" + X + " , " + Y + ")");
        return false;
    } else if (telefono.match(/[^0-9\s-]/g) != null) {
        // alert("Error, revisar telefono/s.\n" + telefono);
        return false;
    } else if (!(["Residencial", "Comercial", "Mixta"].includes(categoria))) {
        // alert("Error, revisar categoria:\n " + categoria);
        return false;
    } else if (nombre.length == 0) {
        // alert("Error, revisar categoria:\n " + categoria);
        return false;
    } else if (direccion.length == 0) {
        // alert("Error, revisar categoria:\n " + categoria);
        return false;
    } else {
        return true;
    }
}

/**********************************************************/
/***********************Toma de datos**********************/
/**********************************************************/
document.getElementById("agregar").onclick = function() {

    let nombre = document.getElementById("nombre").value;
    let direccion = document.getElementById("direccion").value;
    let telefono = document.getElementById("telefono").value;
    let categoria = document.getElementById("categoria").value;
    let coord = (document.getElementById("coord").value).split(",");

    agregarCirculo(coord[0], coord[1], nombre, direccion, telefono, categoria);
};

/****************************************************************************************/
/***********************Funcion para agregar circulos con el submit**********************/
/****************************************************************************************/
function agregarCirculo(X, Y, nombre, direccion, telefono, categoria) {
    //Verificacion de Datos
    if (verificar(X, Y, nombre, direccion, telefono, categoria)) {

        var circle = L.circle([parseFloat(X), parseFloat(Y)], {
            color: 'red',
            fillColor: '#8400D3',
            fillOpacity: 0.5,
            radius: 10,

        });

        circle.hiddenId = lastId;
        lastId++;
        idElim = circle.hiddenId;

        if (telefono.length == 0) {
            telefono = "-"
        }
        //Le agrego el Popup
        circle.bindPopup("<div><b>Descripción: </b>" + nombre + "<br><b>Dirección: </b>" + direccion + "<br><b>Telefónico: </b>" + telefono + "<br><b>(X, Y): </b>" + X + "," + Y + "<br><b>Categoria: </b>" + categoria + "<br><button class='btn-danger btn-eliminar' onclick='eliminarCirculo(idElim)'><b>Eliminar</b></button></div>");


        //Setea el id a eliminar
        circle.on('click', function() {
            idElim = circle.hiddenId;
        })

        //Los guarda para otra para el localStorage
        circulos.push({
            "X": X,
            "Y": Y,
            "desc": nombre,
            "dir": direccion,
            "tel": telefono,
            "cat": categoria,
            "id": circle.hiddenId
        });
        //Los guarda para poder eliminarlos despues
        CirculosEnMapa.push(circle);

        //Guardo los datos en el localStorage
        localStorage.setItem("circulos", JSON.stringify(circulos));
        localStorage.setItem("lastId", lastId);

        circle.addTo(mymap);
        circle.openPopup();
    } else {
        alert("No se agrego el punto.");
    }
}

/***************************************************************************/
/***********************Funcion para eliminar circulos**********************/
/***************************************************************************/
function eliminarCirculo(idElim) {
    //Elimina el circulo            
    CirculosEnMapa.forEach(circulo => {
        if (circulo.hiddenId == idElim) {
            circulo.removeFrom(mymap);
        }
    });
    circulos.forEach(circulo => {
        if (circulo.id == idElim) {
            circulos.splice(circulos.indexOf(circulo), 1);
        }
    });
    // circulos = []
    localStorage.setItem("circulos", JSON.stringify(circulos));
}


/**************************************************************************************************/
/***********************Funcion establece la posición al clickear en el mapa.**********************/
/**************************************************************************************************/
mymap.on('click', function onMapClick(e) {
    let coord = e.latlng.toString().substr(7);
    coord = coord.substr(0, coord.length - 1);
    coord = coord.split(",");
    document.getElementById("coord").value = coord[0] + "," + coord[1];
    document.getElementById("coord").setCustomValidity("");
});

/**********************************************************************************************************************************/
/***********************Manejo de eventos para que el puntero cambie de forma a "grabbing" cuando se arrastra**********************/
/**********************************************************************************************************************************/
document.getElementById("map").onmousedown = function() {
    document.getElementById("map").style.cursor = "grabbing";
}

document.getElementById("map").onmouseup = function() {
    document.getElementById("map").style.cursor = "pointer";
}

/*************************************************************************/
/***********************Carga de marcadores por JSon**********************/
/*************************************************************************/
document.getElementById("jsonFile").addEventListener("change", function() {
    var file = document.getElementById("jsonFile").files[0];
    if (file) {
        document.getElementById("jsonFileLabel").innerHTML = file.name;
    }
});

document.getElementById("uploadJson").addEventListener("click", handleFiles, false);

function handleFiles() {
    var file = document.getElementById("jsonFile").files[0];

    if (file) {
        var reader = new FileReader();
        reader.readAsText(file, "UTF-8");
        reader.onload = function(evt) {
            try {
                var circulosNuevos = JSON.parse(evt.target.result);
            } catch (err) {
                alert("Error en el JSON\n" + err.message);
            }
            if (circulosNuevos) {
                circulosNuevos.forEach(circulo => {
                    agregarCirculo(circulo.X, circulo.Y, circulo.desc, circulo.dir, circulo.tel, circulo.cat);
                });
            }
        }
        reader.onerror = function(evt) {
            alert("Error al leer el archivo");
        }
    } else {
        alert("Primero seleccione el archivo");
    }
};

/***********************************************************/
/***********************Descargar Json**********************/
/***********************************************************/
document.getElementById("descargarJson").addEventListener("click", function() {
    if (circulos.length) {
        circulosAux = circulos;
        circulosAux.forEach(circulo => {
            delete circulo["id"];
        });
        var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(circulosAux));
        var dlAnchorElem = document.getElementById('descargarJson');
        dlAnchorElem.setAttribute("href", dataStr);
        dlAnchorElem.setAttribute("download", "points.json");
        dlAnchorElem.click();
    } else {
        alert("No hay puntos en el mapa para descargar.");
    }

});