import { handleRequest } from './app.js';
import { config } from './config.deno.js';

Deno.serve(request => handleRequest(request, config));
