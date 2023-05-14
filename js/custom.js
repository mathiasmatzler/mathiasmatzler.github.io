$(document).ready(function () {

  // start overlay infomation text
  new Typed('#startOverlay>p', {
    strings: ["Click to start..."],
    typeSpeed: 50,
  });
  // variables for drawing
  const imageGrid = $('#grid');
  const canvas = document.getElementById('myCanvas');
  var path;


  // Fetch the subfolders in the "images" folder
  $.getJSON('img/img.json', function (imageNames) {
    // Loop through the image names
    imageNames.forEach(function (imageName) {
      var parts = imageName.split('_');
      var row_num = parseInt(parts[0]);
      var col_num = parseInt(parts[1]);

      // Check if the row exists
      var row = imageGrid.find('.row#row-' + row_num);
      if (row.length === 0) {
        // Create the row if it doesn't exist
        row = $('<div>').addClass('row').attr('id', 'row-' + row_num);
        imageGrid.append(row);
      }

      // Create the image element and position it
      var img = $('<img>').attr('src', 'img/' + imageName)
        .addClass('img-thumbnail').css({
          "max-width": "100%",
          "max-height": "100%",
        });
      var col = $('<div>').addClass('col m-5').css({
        "width": "400px",
        "height": "400px",
        "max-width": "400px",
        "max-height": "400px",
      })
        .append(img);
      row.append(col);
    });
    //after loading do...
    // init canvas dimensions
    canvas.width = imageGrid.width();
    canvas.height = imageGrid.height();
    console.log("canvas: " , canvas.width, canvas.height );

    // Calculate center of container
    var winCenterX = window.innerWidth / 2;
    var winCenterY = window.innerHeight / 2;

    // Init previous mouse position
    var prevMouseX = winCenterX;
    var prevMouseY = winCenterY;

    // initialize Paper.js
    // paper.install(window); // Install Paper.js on the global scope
      paper.setup(canvas);

    // readjust canvas dimensions
    canvas.width = imageGrid.width();
    canvas.height = imageGrid.height();
    console.log("canvas: " , canvas.width, canvas.height );

    // Create a white background rectangle covering the canvas
    var background = new paper.Path.Rectangle(paper.view.bounds);
    background.fillColor = 'white'; // Set the background color to white

  function updatePosition(event) {
    // Calculate the mouse position relative to the container
    var mouseX = prevMouseX + event.movementX; // *-1 to invert mouse movement
    var mouseY = prevMouseY + event.movementY; // *-1 to invert mouse movement



    console.log("mouseX: " + mouseX);
    console.log("mouseY: " + mouseY);

    $('#myCanvas').css({
      'transform': 'translate(' + ((mouseX - winCenterX)*-1) + 'px, ' + ((mouseY - winCenterY)*-1) + 'px)' // *-1 to invert movement of container so that it moves in the opposite direction of the mouse
    });
    imageGrid.css({
      'transform': 'translate(' + ((mouseX - winCenterX)*-1) + 'px, ' + ((mouseY - winCenterY)*-1) + 'px)' // *-1 to invert mouse movement so that it moves in the opposite direction of the mouse
    });

    if (!path) {
      path = new paper.Path();
      path.strokeColor = '#DDDDDD'; // Adjust the color as desired
      path.strokeWidth = 5; // Adjust the stroke width as desired
      path.strokeCap = 'round'; // Adjust the stroke cap as desired
    }
    var point = new paper.Point(mouseX, mouseY);
    path.add(point);
    path.smooth();
    paper.view.draw();

    // Update previous mouse position
    prevMouseX = mouseX;
    prevMouseY = mouseY;
  }

  $('#downloadBtn').click(function () {
    var canvas = document.getElementById('myCanvas');
    // add text to canvas
    var ctx = canvas.getContext('2d');
    ctx.font = "30px Arial";
    ctx.fillStyle = "#707070"
    ctx.fillText("mathias@traum.institute", 25, canvas.height - 12);
    ctx.fillText("0039 346 707 4064", canvas.width - 275, canvas.height - 12);

    // Convert the canvas to a data URL
    var dataURL = canvas.toDataURL('image/png');

    // Create a temporary link element
    var link = document.createElement('a');
    link.href = dataURL;
    link.download = 'canvas_image.png'; // Adjust the filename as desired

    // Simulate a click on the link to trigger the download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // last but not least reload the page
    location.reload();
  });



  // Lock the pointer when the user clicks on the canvas
  $('#startOverlay').click(() => {
    $('#myCanvas').get(0).requestPointerLock();
  });
  $('#spyhole').click(() => {
    $('#myCanvas').get(0).requestPointerLock();
  });

  document.addEventListener("pointerlockchange", lockChangeAlert, false);

  function lockChangeAlert() {
    if (document.pointerLockElement === canvas) {
      console.log("The pointer lock status is now locked");
      document.addEventListener("mousemove", updatePosition, false);
      $('#startOverlay').hide();
      $('#escText').show();
      new Typed('#escText', {
        strings: ["Press ESC to exit..."],
        typeSpeed: 50,
      });
    } else {
      console.log("The pointer lock status is now unlocked");
      document.removeEventListener("mousemove", updatePosition, false);
      $('#escText').hide();
    }
  }
  });
});
