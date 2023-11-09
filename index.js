$(document).ready(function () {

    fillSelectDibujos();
    fillCursorSizes();
    updateLayers();
    // fillLayers();

    $('#execute_action').click( function() {
        // console.log('klk');
        updateLayers();
    })

    $('#stack_canvas').on({
        mousemove: function (e) {

            posx = getMousePos(e).x;
            posy = getMousePos(e).y;
            ctx  = cargaContextoCanvas(LAYER_SELECTED);

            if( LAYER_SELECTED != '' ) {
                $(`#${LAYER_SELECTED}`).on({
        
                    // mousemove: function (e) {
                    //     // console.log(LAYER_SELECTED,'mousemove');
                    //     posx = getMousePos(e).x;
                    //     posy = getMousePos(e).y;
                    //     ctx  = cargaContextoCanvas(LAYER_SELECTED);
                    // },
                
                    mousedown: function (e) {
                        // console.log(LAYER_SELECTED,'mousedown');
                        $(`#${LAYER_SELECTED}`).addClass('brush');
                        $(`#${LAYER_SELECTED}`).css('color', 'green');
                        clearInterval(setint);
                        colorToDraw = $('#color').val();
                        if (colorToDraw != '') {
                            setint = setInterval(function () {
                                draw(colorToDraw, posx, posy, CURSOR_SIZE, CURSOR_SIZE);
                                saveData(LAYER_SELECTED, colorToDraw, posx, posy, CURSOR_SIZE, CURSOR_SIZE);
                            }, 10)
                        }
                    },
                
                    mouseup: function (e) {
                        // console.log(LAYER_SELECTED,'mouseup');
                        $(`#${LAYER_SELECTED}`).removeClass('brush');
                        $(`#${LAYER_SELECTED}`).css('color', 'white');
                        clearInterval(setint);
                        colorToDraw = '';
                    }
                
                });
            }
        }
    })

    $('#dibujos').change(function () {
        div = document.getElementById(LAYER_SELECTED);
        // console.log('cambio', $(this).val());
        JSON_SAVE_CHANGES = []; //clear changes
        limpiar();
        if ($(this).val() !== '') {
            let paint = JSON_PAINTS.find(el => el.id == $(this).val());
            img = new Image();
            img.src = paint.url;
            drawDibujo(LAYER_SELECTED, img, 0, 0, div.width, div.height);
        }
    })

    $('#layer_option').change(function () {

        LAYER_SELECTED = $(this).val();
        div = document.getElementById(LAYER_SELECTED);

        $('#stack_canvas').find('canvas').each(function() {
            // console.log($(this).attr('id'));
            $(`#${$(this).attr('id')}`).addClass('children');
            $(`#${$(this).attr('id')}`).css('z-index',0);
            if( $(this).attr('id') == LAYER_SELECTED ) {
                $(`#${$(this).attr('id')}`).css('z-index',1);
            }
        })

        // console.log('layer_option', $(this).val());
        canvas = $('#'+$(this).val());
        canvas.css("width", "100%");
        canvas.css("height", "100%");
        canvas.css("border", "1px solid");
       
    })

    $('#size_cursor').change(function () {
        CURSOR_SIZE = $(this).val();
    })

    $('#borrar').on('click', function () {
        // console.log("clicked limpiar");
        limpiar();
    });

    $('#imprimir').on('click', function () {
        // console.log("clicked limpiar")
        window.print();
    });

    $('#restore').on('click', function () {
        restoreChangesSavedInJSON();
    });

});

/* declare canvas var*/
var div    = null;
var canvas = $("#canvas1");
canvas.css("width", "100%");
canvas.css("height", "100%");
canvas.css("border", "1px solid");

//indico la URL de la imagen
var img = new Image();
img.src = '';

//defino el contexto del canvas
var ctx = null;
var ctx = cargaContextoCanvas(LAYER_SELECTED);

// orientation
var x = 5;
var y = 5;
var w = 10;
var h = 10;

//positions
var posx = 0;
var posy = 0;
// time interval
var setint = '';

// color draw
var colorToDraw = '';
var iconToDraw = $('#color').val();

// VARIABLES QUE DE LAS ACCIONES
var CURSOR_SIZE    = 2;
var LAYER_SELECTED = '';
var LAYERS_ADD     = [];

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
    },
    {
        id: 4, value: 10
    },
    {
        id: 5, value: 12
    },
    {
        id: 6, value: 16
    },
    {
        id: 7, value: 32
    }
];

function debounce(func, timeout = 300) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => { func.apply(this, args); }, timeout);
    };
}

function updateLayers() {
    let option_selected = $('#layer_option_action option:selected').val();
    // console.log('option_selected', option_selected);
    let content = ``;
    switch (option_selected) {
        case 'addLayer':

            div = document.getElementById(LAYER_SELECTED);
            content = $('#stack_canvas').html();

            const layerNumber = LAYERS_ADD.length + 1;
            LAYERS_ADD.push({ id: layerNumber, layer: `canvas${layerNumber}` });
            LAYER_SELECTED = LAYERS_ADD[ layerNumber - 1 ]['layer'];
            
            content += `<canvas id="${LAYER_SELECTED}" class="canvas" style="z-index:${layerNumber};">The browser doesn't support the canvas element</canvas>`;
            $('#stack_canvas').html(content);
            
            $(`#${LAYER_SELECTED}`).css("width", "100%");
            $(`#${LAYER_SELECTED}`).css("height", "100%");
            $(`#${LAYER_SELECTED}`).css("border", "2px solid");

            setTimeout(() => {
                $('#layer_option').val(LAYER_SELECTED);
                $('#layer_option').change();
            }, 50);

            cargaContextoCanvas(LAYER_SELECTED);

        break;
        case 'deleteLayer':
            let index = LAYERS_ADD.findIndex(el => el.layer == $('#layer_option option:selected').val());
            if (index !== -1) {
                LAYERS_ADD.splice(index, 1);
            }
        break;
        case 'deleteAllLayer':
            LAYERS_ADD = [];
            LAYERS_ADD.push({ id: 1, layer: "canvas1" });
            LAYER_SELECTED = LAYERS_ADD[0]['layer'];
            content = `<canvas id="canvas${LAYER_SELECTED['id']}" class="canvas">The browser doesn't support the canvas element</canvas>`;
            $('#stack_canvas').html(content);
            $(`#${LAYER_SELECTED}`).css("width", "100%");
            $(`#${LAYER_SELECTED}`).css("height", "100%");
            $(`#${LAYER_SELECTED}`).css("border", "2px solid");
        break;
    }
    fillLayers();
    cargaContextoCanvas(LAYER_SELECTED);
    ctx = document.querySelector('canvas').getContext("2d");
    div = document.getElementById(LAYER_SELECTED);
}

function fillLayers() {
    console.log('fillLayers', LAYERS_ADD );
    $("#layer_option").empty();
    let content = ``;
    LAYERS_ADD.forEach(el => {
        content += `<option value="${el.layer}">Capa ${el.id}</option>`;
    })
    $('#layer_option').append(content);
}

function fillSelectDibujos() {
    let content = ``;
    $("#dibujos").empty();
    content += `<option value="">Por favor seleccione</option>`;
    JSON_PAINTS.forEach(el => {
        content += `<option value="${el.id}">${el.name}</option>`;
    })
    $('#dibujos').append(content);
}

function fillCursorSizes() {
    let content = ``;
    $("#size_cursor").empty();
    content += `<option value="">Por favor seleccione</option>`;
    JSON_CURSOR_SIZE.forEach(el => {
        content += `<option value="${el.value}">${el.value}</option>`;
    })
    $('#size_cursor').append(content);
}

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

function drawDibujo(layer, img, x, y, w, h) {
    console.log('drawDibujo', layer, img, x, y, w, h);
    var ctx = cargaContextoCanvas(layer);
    if (ctx) {
        img.onload = function () {
            ctx.drawImage(img, 0, 0, w, h);
        }
    }
}

function getMousePos(evt) {
    console.log('getMousePos',LAYER_SELECTED);
    div = document.getElementById(LAYER_SELECTED);
    var rect = div.getBoundingClientRect();
    let x = evt.clientX - rect.left;
    let y = evt.clientY - rect.top;
    return {
        x: (evt.clientX - rect.left) / (rect.right - rect.left) * div.width,
        y: (evt.clientY - rect.top) / (rect.bottom - rect.top) * div.height
    }
}

$('#color').on('change', function () {
    // console.log('change color', $(this).val());
    colorToDraw = $(this).val();
})

function draw(color, posx, posy, w, h) {
    // console.log('draw', color, posx, posy, w, h)
    ctx.fillStyle = color;
    ctx.fillRect(posx, posy, w, h);
}

function limpiar() {
    ctx = cargaContextoCanvas(LAYER_SELECTED);
    ctx.clearRect(0, 0, div.width, div.height); //limpia
    div = document.getElementById(LAYER_SELECTED);// get contexto actual
    cargaContextoCanvas(LAYER_SELECTED); //vuelve a cargar el contexto limpia
    let paint = JSON_PAINTS.find(el => el.id == $('#dibujos option:selected').val());
    if (typeof paint !== 'undefined') {
        img = new Image();
        img.src = paint.url;
        drawDibujo(LAYER_SELECTED, img, 0, 0, div.width, div.height);
        clearInterval(setint);
    }
}

var JSON_SAVE_CHANGES = [];
function saveData(layer ,color, positionx, positiony, width, height) {
    console.log('saveData',color, positionx, positiony);
    JSON_SAVE_CHANGES.push({ layer: layer, color: color, x: positionx, y: positiony, w: width, h: height });
}

function restoreChangesSavedInJSON() {
    console.log('restore', JSON_SAVE_CHANGES);
    JSON_SAVE_CHANGES.forEach(el => {
        draw(el.layer, el.color, el.x, el.y, el.w, el.h);
    })
}

