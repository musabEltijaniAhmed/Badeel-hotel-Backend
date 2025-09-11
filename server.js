require('dotenv').config();
const http = require('http');
const app = require('./app');
const logger = require('./utils/logger');
const { Server } = require('socket.io');

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

const io = new Server(server, { cors: { origin: '*' } });
app.set('io', io);

server.listen(PORT, () => {
  logger.info(`Server started on port ${PORT} (${process.env.NODE_ENV})`);
});

module.exports = { server, io }; 