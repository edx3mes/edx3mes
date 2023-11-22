document.addEventListener("DOMContentLoaded", function(event) {
    var cursor = document.querySelector(".custom-cursor");
    var links = document.querySelectorAll("a");
    var initCursor = false;
  
    for (var i = 0; i < links.length; i++) {
      var selfLink = links[i];
      selfLink.addEventListener("mouseover", function() {
        cursor.classList.add("custom-cursor--link");
      });
      selfLink.addEventListener("mouseout", function() {
        cursor.classList.remove("custom-cursor--link");
      });
    }
  
    window.onmousemove = function(e) {
      var mouseX = e.clientX;
      var mouseY = e.clientY;
  
      if (!initCursor) {
        // cursor.style.opacity = 1;
        TweenLite.to(cursor, 0.3, {
          opacity: 1
        });
        initCursor = true;
      }
  
      TweenLite.to(cursor, 0, {
        top: mouseY + "px",
        left: mouseX + "px"
      });
    };
  
    window.onmouseout = function(e) {
      TweenLite.to(cursor, 0.3, {
        opacity: 0
      });
      initCursor = false;
    };
  });
  

$(document).ready(function () {

    // FILL CURSOR SIZES 
    let count = 0;
    for (let index = 0; index < 50; index++) {
        if ((index % 2) !== 0) {
            count++;
            JSON_CURSOR_SIZE.push({ id: count, value: index })
        }
    }

    fillSelectDibujos();
    fillCursorSizes();
    updateLayers();
    selectTool('pencil');
    // fillLayers();

    $('#execute_action').click(function () {
        updateLayers();
    })

    $('#stack_canvas').on({

        mousemove: function (e) {

            div  = document.getElementById(LAYER_SELECTED);
            posx = getMousePos(e).x;
            posy = getMousePos(e).y;
            ctx  = cargaContextoCanvas(LAYER_SELECTED);

            if (LAYER_SELECTED != '') {
                $(`#${LAYER_SELECTED}`).on({

                    mouseover: function () {
                        $(`#${LAYER_SELECTED}`).addClass(TOOL_NAME);
                    },

                    mouseout: function () {
                        // console.log('stack_canvas','blur');
                        clearInterval(setint);
                        colorToDraw = '';
                        clearCursor();
                    },

                    mousedown: function (e) {
                        // console.log(LAYER_SELECTED,'mousedown');
                        clearInterval(setint);
                        $(`#${LAYER_SELECTED}`).addClass(TOOL_NAME);

                        colorToDraw = $('#color').val();
                        if (colorToDraw != '') {
                            setint = setInterval(function () {
                                switch (TOOL_NAME) {
                                    case 'pencil':
                                        draw(colorToDraw, posx, posy, CURSOR_SIZE, CURSOR_SIZE);
                                        saveData(LAYER_SELECTED, colorToDraw, posx, posy, CURSOR_SIZE, CURSOR_SIZE);
                                        break;
                                    case 'brush':
                                        draw(colorToDraw, posx, posy, CURSOR_SIZE, CURSOR_SIZE);
                                        saveData(LAYER_SELECTED, colorToDraw, posx, posy, CURSOR_SIZE, CURSOR_SIZE);
                                        break;
                                    case 'filter':
                                        draw(colorToDraw, 0, 0, div.width, div.height);
                                        saveData(LAYER_SELECTED, colorToDraw, posx, posy, CURSOR_SIZE, CURSOR_SIZE);
                                        break;
                                    case 'eraser':
                                        erase(posx, posy, CURSOR_SIZE, CURSOR_SIZE);
                                        break;
                                }
                            }, 10);
                        }
                    },

                    mouseup: function (e) {
                        // console.log(LAYER_SELECTED,'mouseup');
                        // $(`#${LAYER_SELECTED}`).css('color', 'white');
                        clearInterval(setint);
                        colorToDraw = '';
                    },

                    click: function (e) {
                        switch (TOOL_NAME) {
                            case 'filter':
                                draw(colorToDraw, 0, 0, div.width, div.height);
                                saveData(LAYER_SELECTED, colorToDraw, posx, posy, CURSOR_SIZE, CURSOR_SIZE);
                                break;
                        }
                    }

                });
            }
        },

    })

    $('#upload_paint').change(function () {
        var fileInput = $(this);
        if (fileInput.length && fileInput[0].files && fileInput[0].files.length) {
          var url = window.URL || window.webkitURL;
          var img = new Image();
          img.onload = function() {
            alert('Valid Image');
          };
          img.onerror = function() {
            alert('Invalid image');
          };
          img.src = url.createObjectURL(fileInput[0].files[0]);
          drawDibujo(LAYER_SELECTED, img, 0, 0, div.width, div.height);
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

        $('#stack_canvas').find('canvas').each(function () {
            // console.log($(this).attr('id'));
            $(`#${$(this).attr('id')}`).addClass('children');
            $(`#${$(this).attr('id')}`).css('z-index', 0);
            if ($(this).attr('id') == LAYER_SELECTED) {
                $(`#${$(this).attr('id')}`).css('z-index', 1);
            }
        })

        // console.log('layer_option', $(this).val());
        canvas = $('#' + $(this).val());
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

    $('#reestablish').click(function () {
        LAYERS_ADD = [];
        selectTool('pencil');
        $('#layer_option_action').val('addLayer');
        $('#size_cursor').val(1);
        $('#stack_canvas').html('');
        $('#dibujos').val('');
        updateLayers();
        fillLayers();
    });

});

function drawCursorInvisible(x, y, w, h) {
    // ctx.clearRect(x,y,w,h);
    // let color = 'lightgray';
    // draw(color, x, y, w, h);

    ctx.shadowInset = true;
    ctx.shadowBlur = CURSOR_SIZE;
    ctx.shadowColor = 'CURSOR_SIZE';
    ctx.shadowOffsetX = 5;
    ctx.shadowOffsetY = 5;
    // ctx.fillStyle = 'red';

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (x != -1 && y != -1) {
        ctx.beginPath();
        ctx.arc(x, y, (CURSOR_SIZE / 2), 0, 2 * Math.PI);
        ctx.fill();
    }
}

/* declare canvas var*/
var div = null;
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
var CURSOR_SIZE = 2;
var LAYER_SELECTED = '';
var LAYERS_ADD = [];

var JSON_PAINTS = [
    {
        id: 1, name: 'Dibujo1', url: 'https://www.dibujandoconvani.com.ar/wp-content/uploads/colorear-dibujos/colorear-animales/colorear-unicornios/pegaso-para-colorear-300x300.png',
    },
    {
        id: 2, name: 'Dibujo2', url: 'https://c0.klipartz.com/pngpicture/238/988/gratis-png-dibujos-de-peces-abiertos-payasos-para-colorear.png'
    }
];

var JSON_CURSOR_SIZE = [];
var TOOL_NAME = "pencil";
function selectTool(name) {
    TOOL_NAME = name;
}

function clearCursor() {
    $(`#${LAYER_SELECTED}`).removeClass('brush');
    $(`#${LAYER_SELECTED}`).removeClass('filter');
    $(`#${LAYER_SELECTED}`).removeClass('pencil');
    $(`#${LAYER_SELECTED}`).removeClass('eraser');
}

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
            // content = $('#stack_canvas').html();
            const layerNumber = LAYERS_ADD.length + 1;
            LAYERS_ADD.push({ id: layerNumber, layer: `canvas${layerNumber}` });
            LAYER_SELECTED = LAYERS_ADD[layerNumber - 1]['layer'];
            // content += `<canvas id="${LAYER_SELECTED}" class="canvas" style="z-index:${layerNumber};">The browser doesn't support the canvas element</canvas>`;
            // $('#stack_canvas').html(content);
            content = `<canvas id="${LAYER_SELECTED}" class="canvas" style="z-index:${layerNumber};">The browser doesn't support the canvas element</canvas>`;
            $('#stack_canvas').append(content);
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
    // console.log('fillLayers', LAYERS_ADD );
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
    // content += `<option value="">Por favor seleccione</option>`;
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
    // console.log('drawDibujo', layer, img, x, y, w, h);
    var ctx = cargaContextoCanvas(layer);
    if (ctx) {
        img.onload = function () {
            ctx.drawImage(img, 0, 0, w, h);
        }
    }
}

function getMousePos(evt) {
    // console.log('getMousePos',LAYER_SELECTED);
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
    switch (TOOL_NAME) {
        case 'pencil':
            ctx.beginPath();
            ctx.arc(posx, posy, 0.5, 0, 2 * Math.PI);
            // ctx.stroke();
            ctx.fill();
            // ctx.lineWidth = 0;
            // ctx.strokeStyle = '';
            // ctx.stroke();
            break;
        case 'brush':
            ctx.fillRect(posx, posy, w, h);
            break;
        case 'filter':
            ctx.fillRect(posx, posy, w, h);
            break;
        case 'eraser':
            ctx.fillRect(posx, posy, w, h);
            break;
    }
}

function limpiar() {

    ctx = cargaContextoCanvas(LAYER_SELECTED);
    ctx.clearRect(0, 0, div.width, div.height); //limpia
    div = document.getElementById(LAYER_SELECTED);// get contexto actual
    cargaContextoCanvas(LAYER_SELECTED); //vuelve a cargar el contexto limpia

    img = new Image();
    img.src = '';
    drawDibujo(LAYER_SELECTED, img, 0, 0, div.width, div.height);
    clearInterval(setint);

}

var JSON_SAVE_CHANGES = [];
function saveData(layer, color, positionx, positiony, width, height) {
    // console.log('saveData',color, positionx, positiony);
    JSON_SAVE_CHANGES.push({ layer: layer, color: color, x: positionx, y: positiony, cursor_w: width, cursor_h: height });
}

function restoreChangesSavedInJSON() {
    // console.log('restore', JSON_SAVE_CHANGES);
    JSON_SAVE_CHANGES.forEach(el => {
        draw(el.layer, el.color, el.x, el.y, el.cursor_w, el.cursor_h);
    })
}

function erase(posx, posy, w, h) {
    console.log('erase', posx, posy, w, h);
    ctx = cargaContextoCanvas(LAYER_SELECTED);
    ctx.clearRect(posx, posy, w, h); //limpia
}
