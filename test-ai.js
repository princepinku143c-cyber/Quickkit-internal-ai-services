import * as dotenv from 'dotenv';
dotenv.config({path: '.env.local'});
import { askAI } from './api/services/aiService.js';

askAI([{role: 'user', content: 'Hi Kelly, are you using DeepSeek?'}])
  .then(console.log)
  .catch(console.error);
