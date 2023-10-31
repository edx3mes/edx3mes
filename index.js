$(document).ready(function () {
    fillSelectDibujos();
});
/* declare canvas vars*/
let canvas = $("#canvas");

//indico la URL de la imagen
var img = new Image();
img.src = '';

//defino el contexto del canvas
var ctx = document.querySelector("canvas").getContext("2d");
var x = 5;
var y = 5;
var w = 10;
var h = 10;

canvas.css("width", "800px");
canvas.css("height", "500px");
/* canvas.css("background-color","lightgray"); */
canvas.css("border", "1px solid");

var JSON_PAINTS = [
    {
        id: 1, name: 'Dibujo1', url: 'https://www.dibujandoconvani.com.ar/wp-content/uploads/colorear-dibujos/colorear-animales/colorear-unicornios/pegaso-para-colorear-300x300.png',
    },
    {
        id: 2, name: 'Dibujo2', url: 'https://c0.klipartz.com/pngpicture/238/988/gratis-png-dibujos-de-peces-abiertos-payasos-para-colorear.png'
    }
];

function fillSelectDibujos() {
    let content = ``;
    content += `<option value="">Por favor seleccione</option>`;
    JSON_PAINTS.forEach(el => {
        content += `<option value="${el.id}">${el.name}</option>`;
    })
    $('#dibujos').append(content);
}

$('#dibujos').change(function () {
    console.log('cambio', $(this).val());
    limpiar();
    if ($(this).val() !== '') {
        let paint = JSON_PAINTS.find(el => el.id == $(this).val());
        img = new Image();
        img.src = paint.url;
        drawDibujo(img, 0, 0, div.width, div.height);
    }
})

function cargaContextoCanvas(idCanvas) {
    var elemento = document.getElementById(idCanvas);
    if (elemento && elemento.getContext) {
        var contexto = elemento.getContext('2d');
        if (contexto) {
            return contexto;
        }
    }
    return false;
}

function drawDibujo(img, x, y, w, h) {
    console.log('drawDibujo', img, x, y, w, h);
    var ctx = cargaContextoCanvas('canvas');
    if (ctx) {
        img.onload = function () {
            ctx.drawImage(img, 0, 0, w, h);
        }
    }
}

/*******************************************/
cargaContextoCanvas('canvas');
var div = document.getElementById("canvas");
/*******************************************/

function getMousePos(evt) {
    var div = document.getElementById("canvas");
    var rect = div.getBoundingClientRect();
    let x = evt.clientX - rect.left;
    let y = evt.clientY - rect.top;
    return {
        x: (evt.clientX - rect.left) / (rect.right - rect.left) * div.width,
        y: (evt.clientY - rect.top) / (rect.bottom - rect.top) * div.height
    }
}

var iconToDraw = $('#color').val();
$('#color').on('change', function () {
    console.log('change color', $(this).val());
    colorToDraw = $(this).val();
})

var posx = 0;
var posy = 0;
var ctx = cargaContextoCanvas('canvas');
var setint = '';
var colorToDraw = 'no';
$("canvas").on({

    mousemove: function (e) {
        posx = getMousePos(e).x;
        posy = getMousePos(e).y;
        ctx = cargaContextoCanvas('canvas');
        /* if(colorToDraw != 'no'){
            console.log('mousemove',posx,posy);
        } */
    },

    mousedown: function (e) {
        clearInterval(setint);
        if (colorToDraw != '') {
            setint = setInterval(function () {
                draw(colorToDraw, posx, posy, 2, 2);
                saveData(colorToDraw, posx, posy);
            }, 10)
        }
    },

    mouseup: function (e) {
        colorToDraw = '';
        clearInterval(setint);
        draw(colorToDraw, posx, posy, 2, 2);
    }

});

function draw(color, posx, posy, w, h) {
    ctx.fillStyle = color;
    ctx.fillRect(posx, posy, w, h);
    //ctx.drawRect(iconToDraw, posx, posy , w, h);
    //ctx.stroke();
}

function limpiar() {
    var div = document.getElementById("canvas");// get contexto actual
    ctx.clearRect(0, 0, div.width, div.height); //limpia
    cargaContextoCanvas('canvas'); //vuelve a cargar el contexto limpia
    let paint = JSON_PAINTS.find(el => el.id == $('#dibujos option:selected').val());
    if (typeof paint !== 'undefined') {
        img = new Image();
        img.src = paint.url;
        drawDibujo(img, 0, 0, div.width, div.height);
        clearInterval(setint);
    }
}

$('#caries').on('click', function () {
    console.log("clicked caries")
    iconToDraw = 'https://cdn-icons-png.flaticon.com/512/594/594598.png'
});

$('#corona').on('click', function () {
    console.log("clicked corona")
    iconToDraw = 'https://cdn-icons-png.flaticon.com/512/594/594739.png'
});

$('#sacada').on('click', function () {
    console.log("clicked sacada")
    iconToDraw = 'https://cdn-icons-png.flaticon.com/512/594/594742.png'
});

$('#borrar').on('click', function () {
    console.log("clicked limpiar");
    limpiar();
});

$('#imprimir').on('click', function () {
    console.log("clicked limpiar")
    window.print();
});

$('#restore').on('click', function () {
    restoreChangesSavedInJSON();
});

JSON_SAVE_CHANGES = [];
function saveData(color, positionx, positiony) {
    JSON_SAVE_CHANGES.push({ color: color, x: positionx, y: positiony });
}

function restoreChangesSavedInJSON() {
    console.log('restore', JSON_SAVE_CHANGES);
    JSON_SAVE_CHANGES.forEach(el => {
        draw(el.color, el.positionx, el.positiony, 2, 2);
    })
}

