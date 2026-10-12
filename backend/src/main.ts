import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { configureApplication, port } from './config.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  configureApplication(app);
  await app.listen(port);
}
await bootstrap();
