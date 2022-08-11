exports.Handler = class Handler {
  client = {};
  message = {};
  packet = {};

  constructor(packet) {
    this.packet = packet;
    this.client = packet.data.client;
    this.message = packet.data.message;
  }

  async handle() {
   return ['handler', this.packet];
  }
}