var blessed = require('blessed');
var socket = require('socket.io-client')('http://localhost');
var screen = blessed.screen({
  smartCSR: true
});

var box = blessed.box({
  top: 'center',
  left: 'center',
  width: '50%',
  height: '50%',
  content: "Login to Nunur, or don't or whatever",
  tags: true,
  border: {
    type: 'line'
  },
  style: {
    fg: 'white',
    bg: 'magenta',
    border: {
      fg: '#f0f0f0'
    },
    hover: {
      bg: 'green'
    }
  }
});

screen.render();

socket.on('connect', () => {

});
socket.on('event', function(data){});
socket.on('disconnect', function(){});
