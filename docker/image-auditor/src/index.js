const protocol = require('./protocol');
const dgram = require('dgram');
const net = require('net');

// Max interval for musicians to stay active
const ACTIVE_INTERVAL = 5000;
const TCP_PORT = 2205;

const socket = dgram.createSocket('udp4');
const server = net.createServer();

const instruments = protocol.INSTRUMENTS;
const musicians = new Map();

function onMessage(msg, source) {

  // Parse message
  const data = {
    ...JSON.parse(msg),
    lastActive: Date.now(),
  };
  // Get instrument name from sound
  data.instrument = Object.keys(instruments).find((instrument) => instruments[instrument] === data.sound);

  // Set activeSince to lastActive if the musician is new
  data.activeSince = musicians.has(data.uuid) ? musicians.get(data.uuid).activeSince : data.lastActive;

  // Delete sound from data
  delete data.sound;

  musicians.set(data.uuid, data);

  console.log('Data has arrived: ' + data + '. Source port: ' + source.port);
}

// Send the list of active musicians to the tcp client
function onConnect(socket) {
  const now = Date.now();
  const content = Array.from(musicians.entries())
    .filter(([uuid, musician]) => {
      const toRemove = now - musician.lastActive > ACTIVE_INTERVAL;
      if (toRemove) musicians.delete(uuid);
      return !toRemove;
    })
    .map(([uuid, musician]) => ({
      uuid,
      instrument: musician.instrument,
      activeSince: new Date(musician.activeSince),
    }));

  socket.write(`${JSON.stringify(content)}\n`);
  socket.end();
}

socket.bind(protocol.PORT, () => {
  console.log('Joining multicast group');
  socket.addMembership(protocol.HOST);
});

socket.on('message', onMessage);

server.listen(TCP_PORT);

server.on('connection', onConnect);