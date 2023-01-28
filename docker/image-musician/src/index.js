const protocol = require('./protocol');
const dgram = require('dgram');
const { randomUUID } = require('crypto');

const socket = dgram.createSocket('udp4');
const uuid = randomUUID();
const INTERVAL = 1000;

let message;
let instrumentName = process.argv[2];

if (!instrumentName || !protocol.INSTRUMENTS.hasOwnProperty(instrumentName)) {
  /*console.log(`Invalid instrument "${instrumentName}"`);
  return;*/
    instrumentName = "piano";
}

const payload = JSON.stringify({
  uuid,
  sound: protocol.INSTRUMENTS[instrumentName],
});
message = Buffer.from(payload);

function update() {
  socket.send(message, 0, message.length, protocol.PORT, protocol.HOST, () => {
    console.log('Sending payload: ' + payload + ' via port ' + socket.address().port);
  });
}

setInterval(update, INTERVAL);


