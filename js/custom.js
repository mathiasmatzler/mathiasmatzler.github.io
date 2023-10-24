import FileSaver from 'file-saver';
import Typed from 'typed.js';
import jQuery from "jquery";

window.$ = window.jQuery = jQuery;
import paper, {Path} from 'paper'

$(document).ready(function () {
  // check if mobile
  var isMobile = $(window).width() < 600;

  // start overlay infomation text
  new Typed('#escText', {
    strings: ["Click to start..."],
    typeSpeed: 50,
  });
  // variables for drawing
  const imageGrid = $('#grid');
  const canvasBottom = document.getElementById('myCanvas');
  const canvasTop = document.getElementById('topCanvas');
  var path;
  var path2;
  var path2_drawn;


  // Fetch the subfolders in the "images" folder
  $.getJSON('img/img.json', function (imageNames) {
    // Loop through the image names
    imageNames.forEach(function (imageName) {
      var parts = imageName.split('_');
      var row_num = parseInt(parts[0]);
      var col_num = parseInt(parts[1]);

      // Check if the row exists
      var row = imageGrid.find('#row-' + row_num);
      if (row.length === 0) {
        // Create the row if it doesn't exist
        row = $('<div>').attr('id', 'row-' + row_num).css({
          "display": "flex",
          "flex-direction": "row",
          "align-items": "center",
        });
        imageGrid.append(row);
      }

      // Create the image element and position it
      var img = $('<img>').attr('src', 'img/' + imageName)
        .addClass().css({
          "max-width": "100%",
          "max-height": "100%",
        });
      var col = $('<div>').css({
        "width": "400px",
        "height": "400px",
        "max-width": "400px",
        "max-height": "400px",
        "margin": "20px",
      })
        .append(img);
      row.append(col);
    });
    //after loading do...
    // init canvas dimensions
    canvasBottom.width = canvasTop.width = imageGrid.width();
    canvasBottom.height = canvasTop.height = imageGrid.height();
    // console.log("canvas: ", canvasBottom.width, canvasBottom.height);

    // Calculate center of container
    var winCenterX = window.innerWidth / 2;
    var winCenterY = window.innerHeight / 2;

    // Init previous mouse position
    var prevMouseX = isMobile ? 160 : 220;
    var prevMouseY = isMobile ? 120 : 220;

    // initialize Paper.js - create different scopes for each canvas
    const scopeBackground = new paper.PaperScope();
    const scopeTop = new paper.PaperScope();
    scopeBackground.settings.insertItems = false; // prevents automatic insertion of items into the DOM
    scopeTop.settings.insertItems = false; // prevents automatic insertion of items into the DOM
    scopeBackground.setup(canvasBottom);
    scopeTop.setup(canvasTop);
    const layerBackgroud = scopeBackground.project.activeLayer;
    const layerTop = scopeTop.project.activeLayer;

    // readjust canvas dimensions
    canvasBottom.width = canvasTop.width = imageGrid.width();
    canvasBottom.height = canvasTop.height = imageGrid.height();
    // console.log("canvas: " , canvas.width, canvas.height );

    // Create a white background rectangle covering the canvas
    var background = new scopeBackground.Path.Rectangle(scopeBackground.view.bounds);
    background.fillColor = 'white'; // Set the background color to white
    layerBackgroud.addChild(background);

    // Create a mask
    let blackBackground = new scopeTop.Path.Rectangle(
      new scopeTop.Point(-50000, -50000),
      new scopeTop.Size(100000, 100000)
    );
    let mask = (isMobile) ?
        new scopeTop.Path.Rectangle(
            new scopeTop.Point(10, -30),
            new scopeTop.Size(300, 300)
        ) :
        new scopeTop.Path.Rectangle(
            new scopeTop.Point(-30, -30),
            new scopeTop.Size(500, 500)
        );
    // let debug = new scopeTop.Path.Rectangle(
    //   new scopeTop.Point(0, 0),
    //   new scopeTop.Size(500, 500)
    // );
    const invertedMask = blackBackground.subtract(mask);
    invertedMask.fillColor = 'black';
    invertedMask.clipMask = true;
    layerTop.addChild(invertedMask);
    // debug.strokeColor = 'red';
    // debug.strokeWidth = 1;
    // layerTop.addChild(debug);

    function updatePosition(event) {
      // Calculate the mouse position relative to the container
      var mouseX = prevMouseX + event.movementX * 4; // *-1 to invert mouse movement
      var mouseY = prevMouseY + event.movementY * 4; // *-1 to invert mouse movement

      // console.log("mouseX: " + mouseX);
      // console.log("mouseY: " + mouseY);

      $('#myCanvas').css({
        'transform': 'translate(' + ((mouseX - winCenterX) * -1) + 'px, ' + ((mouseY - winCenterY) * -1) + 'px)' // *-1 to invert movement of container so that it moves in the opposite direction of the mouse
      });
      $('#topCanvas').css({
        'transform': 'translate(' + ((mouseX - winCenterX) * -1) + 'px, ' + ((mouseY - winCenterY) * -1) + 'px)' // *-1 to invert movement of container so that it moves in the opposite direction of the mouse
      });
      imageGrid.css({
        'transform': 'translate(' + ((mouseX - winCenterX) * -1) + 'px, ' + ((mouseY - winCenterY) * -1) + 'px)' // *-1 to invert mouse movement so that it moves in the opposite direction of the mouse
      });
      invertedMask.translate(new scopeTop.Point(event.movementX * 4, event.movementY * 4));
      // debug.translate(new scopeTop.Point(event.movementX * 2, event.movementY * 2));

      if (!path) {
        path = new scopeBackground.Path();
        path2 = new scopeTop.Path();
        path2_drawn = new scopeTop.Path();
        path2.strokeColor = path.strokeColor = '#DDDDDD'; // Adjust the color as desired
        path2.strokeWidth = path.strokeWidth = 5; // Adjust the stroke width as desired
        path2.strokeCap = path.strokeCap = 'round'; // Adjust the stroke cap as desired
        layerBackgroud.addChild(path);
        layerTop.addChild(path2);
        // layerTop.addChild(path2_drawn);
      }
      var point = new scopeBackground.Point(mouseX, mouseY);
      path.add(point);
      path2.add(point);
      path.smooth();
      path2.smooth();
      invertedMask.bringToFront();
      // scopeTop.project.
      // const substract = path2.subtract(invertedMask);
      // layerTop.removeChildren();
      // layerTop.addChild(substract);

      // let ctx = canvasTop.getContext("2d");
      // ctx.clearRect(50, 50, 300, 300)

      // Update previous mouse position
      prevMouseX = mouseX;
      prevMouseY = mouseY;
    }

    $('#downloadBtn').click(function () {
      // show start overlay to prevent further drawing
      $('#startOverlay').show();
      $('#escText').show();
      new Typed('#escText', {
        strings: ["Click to start..."],
        typeSpeed: 50,
      });
      // prepare canvas for download
      var canvas = document.getElementById('myCanvas');
      // add text to canvas
      var ctx = canvas.getContext('2d');
      ctx.font = "30px PrestigeEliteStd";
      ctx.fillStyle = "#707070"
      ctx.fillText("info@mathiasmatzler.com       0039 346 707 4064", 25, canvas.height - 12);

      // Convert the canvas to a data URL
      var dataURL = canvas.toDataURL('image/png');
      // call FileSaver.js
      FileSaver.saveAs(dataURL, 'Your own line of research.png');
    });

    // implementation of pointer lock for desktop or touch for mobile
    if (!isMobile) {

      // ------------------ Pointer Lock ------------------ //
      // Lock the pointer when the user clicks on the canvas
      $('#escText').click(() => {
        $('#myCanvas').get(0).requestPointerLock();
      });
      $('#topCanvas').click(() => {
        $('#myCanvas').get(0).requestPointerLock();
      });

      document.addEventListener("pointerlockchange", lockChangeAlert, false);
      function lockChangeAlert() {
        if (document.pointerLockElement === canvasBottom) {
          // console.log("The pointer lock status is now locked");
          document.addEventListener("mousemove", updatePosition, false);
          $('#startOverlay').hide();
          $('#downloadBtn').hide();
          $('#escText').show();
          new Typed('#escText', {
            strings: ["press esc..."],
            typeSpeed: 50,
          });
        } else {
          // console.log("The pointer lock status is now unlocked");
          document.removeEventListener("mousemove", updatePosition, false);
          $('#escText').hide();
          $('#downloadBtn').show();
        }
      }
    } else {
      // ------------------ Touch Mobile ------------------ //
      $('#escText').click(() => {
        // update initial position
        updatePosition({movementX: 0, movementY: 0});
        // hide overlay, show spyhole, hide escText, add event listeners
        entryMobile();
      });

      var previousTouch;
      function entryMobile() {
        // console.log("entryMobile");
        addEventListener("touchmove", e => {
          e.preventDefault(); // prevent scrolling when inside DIV (mobile)
          e.stopImmediatePropagation();
          const touch = e.touches[0];

          if (previousTouch) {
            // be aware that these only store the movement of the first touch in the touches array
            e.movementX = (touch.pageX - previousTouch.pageX) * 2;
            e.movementY = (touch.pageY - previousTouch.pageY) * 2;

            // console.log("e.movementX: " + e.movementX);
            // console.log("e.movementY: " + e.movementY);

            updatePosition(e);
          }
          previousTouch = touch;

        }, {passive: false});

        addEventListener("touchend", (e) => {
          previousTouch = null;
        });

        $('#startOverlay').hide();
        $('#escText').hide();
      }
    }
  });
});
