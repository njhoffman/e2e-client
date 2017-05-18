$(document).ready(function() {

  function loadImage(img, i) {
    console.info('loading image ' + i + ': ' + img);
    var desc = img.split('/').pop().replace('.png', '');
    var imageItem =
      '<div class="item active">' +
        '<img src="' + img + '" alt=' + desc + '">' +
        '<h3 class="carousel-caption">' + desc + '</h3>' +
      '</div>';
    var indicatorItem = '<li data-target="#omCarousel" data-slide-to="' + i + '"></li>';

    if (i === 0) {
      $('#omCarousel').show();
    }

    $('.item').removeClass('active');
    $('.carousel-inner').append(imageItem);
    $('.carousel-indicators').append(indicatorItem);
  }

  function listImages()  {
    $.post('/listImages', function(images) {
      images.path1.forEach(loadImage);
    });
  }
  // listImages();

  var host = window.document.location.host.replace(/:.*/, '');
  var wsHost = 'ws://' + host + ':3000';

  console.info('Connecting to websocket: ' + wsHost);
	var ws = new WebSocket(wsHost);

	ws.onmessage = function (event) {
    console.info('ws message:', event.data);
    if (event.data.indexOf('screenshot:') === 0) {
      var imagePath = event.data.slice(event.data.indexOf(':') + 1).trim();
      window.setTimeout(function() {
        var i = $('.item').length;
        loadImage(imagePath, i);
        $('.screenshot-status').html('Loaded ' + (i + 1) + ' screenshots');
      }, 5000);
    }

    if (event.data === 'done') {
      $('.test-status')
        .addClass('completed')
        .removeClass('error')
        .html('Test Completed');
      $('.test-bar')
        .removeClass('running error')
        .addClass('completed')
        .html('Finished Successfully');
    }

    if (event.data.trim().indexOf('error:') === 0) {
      console.warn('websocket error: ', event.data);
      $('.test-status')
        .addClass('error')
        .removeClass('completed')
        .html('<b>Test Failed</b><br />' + event.data.replace('error: Error:', ''));
      $('.test-bar')
        .removeClass('running completed')
        .addClass('error')
        .html('Error');
    }

    $('.test-output').append(event.data);
    $('.test-output').scrollTop($('.test-output')[0].scrollHeight);
	};

  $('button.start').on('click', function() {
    var name = $('select[name="test-name"]').find(':selected').val();
    console.info('running create fundraiser test: ' + name);
    $('.test-bar').removeClass('completed error').addClass('running').html('Running Test');
    $('.screenshot-status').text('');
    $('.test-status').removeClass('completed error').text('');
    $('#omCarousel .item').remove();
    $('#omCarousel li').remove();


    $.post('/tests/' + name, function(data) { });
  });

});
