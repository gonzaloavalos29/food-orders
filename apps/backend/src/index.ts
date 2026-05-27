import { buildContainer } from './container';
import { buildServer } from './server';
import { config } from './config';

const container = buildContainer();
const app = buildServer(container);

app.listen(config.port, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend listening on port ${config.port}`);
});
