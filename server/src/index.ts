import { createApp } from './app';
import { config } from './config';

const app = createApp();

app.listen(config.port, () => {
  console.log(`Qingzhuo API listening on http://localhost:${config.port}`);
});
