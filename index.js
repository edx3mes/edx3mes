$(document).ready(function () {
    fillSelectDibujos();
    fillCursorSizes();
    fillLayers();
    cargaContextoCanvas('canvas');
    div = document.getElementById("canvas");
});
/* declare canvas var*/
var div = "";
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
var CURSOR_SIZE = 2;

canvas.css("width", "100%");
canvas.css("height", "100%");
canvas.css("border", "1px solid");

var JSON_PAINTS = [
    {
        id: 1, name: 'Dibujo1', url: 'https://www.dibujandoconvani.com.ar/wp-content/uploads/colorear-dibujos/colorear-animales/colorear-unicornios/pegaso-para-colorear-300x300.png',
    },
    {
        id: 2, name: 'Dibujo2', url: 'https://c0.klipartz.com/pngpicture/238/988/gratis-png-dibujos-de-peces-abiertos-payasos-para-colorear.png'
    }
];

var JSON_CURSOR_SIZE = [
    {
        id: 1, value: 2
    },
    {
        id: 2, value: 4
    },
    {
        id: 3, value: 8
    }
];

var LAYERS_ADD = [
    { 
        layer: 1 
    }
];

function debounce(func, timeout = 300){
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => { func.apply(this, args); }, timeout);
    };
}

$('#execute_action').on('click', function () {
    let option_selected = $('#layer_option_action option:selected').val();
    console.log('option_selected', option_selected);
    switch (option_selected) {
        case 'addLayer':
            let layerNumber = LAYERS_ADD.length ++;
            setInterval(() => {
                LAYERS_ADD.push({ layer: layerNumber });
                let content = `<canvas id="canvas${el.layerNumber}" class="canvas" style="z-index:${el.layerNumber};">The browser doesn't support the canvas element</canvas>`;
                $('#stack_canvas').html(content);
            }, 250);
        break;
        case 'deleteLayer':
            let index = LAYERS_ADD.findIndex(el => el.layer == $('#layer_option option:selected').val());
            if (index !== -1) {
                LAYERS_ADD.splice(index, 1);
            }
        break;
        case 'deleteAllLayer':
            LAYERS_ADD = [];
            LAYERS_ADD.push({ layer: 1 });
            $('#stack_canvas').html(`<canvas id="canvas${1}" class="canvas">The browser doesn't support the canvas element</canvas>`);
        break;
    }
    setTimeout(function() {
        fillLayers();
    },250)
})

function fillLayers() {
    let content = ``;
    LAYERS_ADD.forEach(el => {
        content += `<option value="${el.layer}">Capa ${el.layer}</option>`;
    })
    $('#layer_option').append(content);
}

function fillSelectDibujos() {
    let content = ``;
    content += `<option value="">Por favor seleccione</option>`;
    JSON_PAINTS.forEach(el => {
        content += `<option value="${el.id}">${el.name}</option>`;
    })
    $('#dibujos').append(content);
}

function fillCursorSizes() {
    let content = ``;
    content += `<option value="">Por favor seleccione</option>`;
    JSON_CURSOR_SIZE.forEach(el => {
        content += `<option value="${el.value}">${el.value}</option>`;
    })
    $('#size_cursor').append(content);
}

$('#dibujos').change(function () {
    console.log('cambio', $(this).val());
    JSON_SAVE_CHANGES = []; //clear changes
    limpiar();
    if ($(this).val() !== '') {
        let paint = JSON_PAINTS.find(el => el.id == $(this).val());
        img = new Image();
        img.src = paint.url;
        drawDibujo(LAYER_SELECTED,img, 0, 0, div.width, div.height);
    }
})

$('#size_cursor').change(function () {
    CURSOR_SIZE = $(this).val();
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
var colorToDraw = '';
$("canvas").on({

    mousemove: function (e) {
        posx = getMousePos(e).x;
        posy = getMousePos(e).y;
        ctx = cargaContextoCanvas('canvas');
    },

    mousedown: function (e) {
        $('canvas').addClass('brush');
        $('canvas').css('color', 'green');
        clearInterval(setint);
        colorToDraw = $('#color').val();
        if (colorToDraw != '') {
            setint = setInterval(function () {
                draw(colorToDraw, posx, posy, CURSOR_SIZE, CURSOR_SIZE);
                saveData(colorToDraw, posx, posy, CURSOR_SIZE, CURSOR_SIZE);
            }, 10)
        }
    },

    mouseup: function (e) {
        $('canvas').removeClass('flying');
        $('canvas').css('color', 'white');
        clearInterval(setint);
        colorToDraw = '';
    }

});

function draw(color, posx, posy, w, h) {
    console.log('draw', color, posx, posy, w, h)
    ctx.fillStyle = color;
    ctx.fillRect(posx, posy, w, h);
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

var JSON_SAVE_CHANGES = [];
function saveData(color, positionx, positiony, width, height) {
    // console.log('saveData',color, positionx, positiony);
    JSON_SAVE_CHANGES.push({ color: color, x: positionx, y: positiony, w: width, h: height });
}

function restoreChangesSavedInJSON() {
    console.log('restore', JSON_SAVE_CHANGES);
    ctx = cargaContextoCanvas('canvas');
    JSON_SAVE_CHANGES.forEach(el => {
        draw(el.color, el.x, el.y, el.w, el.h);
    })
}

