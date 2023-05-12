$(document).ready(function () {

  const canvas = document.getElementById('myCanvas');
  // Get container dimensions
  var containerWidth = $('#container').width();
  var containerHeight = $('#container').height();

  // Get canvas dimensions
  var canvasWidth = $('#myCanvas').width();
  var canvasHeight = $('#myCanvas').height();

  // Track previous mouse position
  var prevMouseX = canvasWidth / 2;
  var prevMouseY = canvasHeight/ 2;

  // Calculate center of container
  var centerX = $('#myCanvas').width() / 2;
  var centerY = $('#myCanvas').height() / 2;
  $('#myCanvas').css({
    'transform': 'translate(' + centerX + 'px, ' + centerY + 'px)'
  });

  // initialize Paper.js
  paper.install(window);
  paper.setup('myCanvas');
  // Create a white background rectangle covering the canvas
  var background = new paper.Path.Rectangle(paper.view.bounds);
  background.fillColor = 'white'; // Set the background color to white
  // variables for drawing
  var viewCenter = paper.view.center;
  var path;


  function updatePosition(event) {
    // Calculate the mouse position relative to the container
    var mouseX = prevMouseX + event.movementX;
    var mouseY = prevMouseY + event.movementY;

    var shiftX = (mouseX);
    var shiftY = (mouseY);

    $('#myCanvas').css({
      'transform': 'translate(' + (shiftX - centerX) + 'px, ' + (shiftY - centerY) + 'px)'
    });
    $('#grid').css({
      'transform': 'translate(' + (shiftX - centerX) + 'px, ' + (shiftY - centerY) + 'px)'
    });

    if (!path) {
      path = new paper.Path();
      path.strokeColor = 'black'; // Adjust the color as desired
      path.strokeWidth = 10; // Adjust the stroke width as desired
      path.strokeCap = 'round'; // Adjust the stroke cap as desired
    }
    var point = new paper.Point(canvasWidth - mouseX, canvasHeight - mouseY);
    path.add(point);
    path.smooth();
    paper.view.draw();

    // Update previous mouse position
    prevMouseX = mouseX;
    prevMouseY = mouseY;
  }

  $('#downloadBtn').click(function () {
    // Convert the canvas to a data URL
    var canvas = document.getElementById('myCanvas');
    var dataURL = canvas.toDataURL('image/png');

    // Create a temporary link element
    var link = document.createElement('a');
    link.href = dataURL;
    link.download = 'canvas_image.png'; // Adjust the filename as desired

    // Simulate a click on the link to trigger the download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });

  const imageContainer = $('#grid');
  var gridCellSize = 100; // Adjust to your desired cell size
  var gridSpacing = 50; // Adjust to your desired spacing
  // Fetch the subfolders in the "images" folder
  console.log('Fetching subfolders...');
  $.getJSON('img/img.json', function (imageNames) {
    // Loop through the image names
    imageNames.forEach(function (imageName) {
      var parts = imageName.split('_');
      var row_num = parseInt(parts[0]);
      var col_num = parseInt(parts[1]);

      // Check if the row exists
      var row = imageContainer.find('.row#row-' + row_num);
      if (row.length === 0) {
        // Create the row if it doesn't exist
        row = $('<div>').addClass('row').attr('id', 'row-' + row_num);
        imageContainer.append(row);
      }

      // Create the image element and position it
      var img = $('<img>').attr('src', 'img/' + imageName)
        .addClass('img-thumbnail').css("min-width", "400px");
      var col = $('<div>').addClass('col m-5')
        .append(img);
      row.append(col);
    });
  });

  // Lock the pointer when the user clicks on the canvas
  $('#spyhole').click(() => {
    $('#myCanvas').get(0).requestPointerLock();
  });

  document.addEventListener("pointerlockchange", lockChangeAlert, false);

  function lockChangeAlert() {
    if (document.pointerLockElement === canvas) {
      console.log("The pointer lock status is now locked");
      document.addEventListener("mousemove", updatePosition, false);
    } else {
      console.log("The pointer lock status is now unlocked");
      document.removeEventListener("mousemove", updatePosition, false);
    }
  }

});
