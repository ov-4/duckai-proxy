import { handleRequest } from './app.js';
import { config } from './config.js';

export default {
  async fetch(request) {
    return handleRequest(request, config);
  }
};
