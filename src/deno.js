import { handleRequest } from './app.js';
import { config } from './config.js';

Deno.serve(request => handleRequest(request, config));
