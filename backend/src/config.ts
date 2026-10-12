import 'dotenv/config';
import type { INestApplication } from '@nestjs/common';

export const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:5173';
export const port = Number(process.env.PORT ?? 3000);

export function configureApplication(app: INestApplication): void {
  app.enableCors({ origin: frontendUrl });
}
