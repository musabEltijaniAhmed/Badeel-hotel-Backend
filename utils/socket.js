let io;
function init(serverIO) {
  io = serverIO;
}
function getIO() {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
}
function emit(event, data) {
  if (io) io.emit(event, data);
}
module.exports = { init, getIO, emit }; 