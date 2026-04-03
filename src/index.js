import { config } from './config.js';
import { handleRequest } from './app.js';

export default {
  async fetch(request) {
    return handleRequest(request, config);
  }
};
