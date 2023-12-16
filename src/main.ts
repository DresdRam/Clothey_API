import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './model/app/app.module';

const port: number = 3026;
const successMessage: string = `API Started Listening On Port ${port} ....`;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(port).then(() => {
    console.log(successMessage);
  }).catch((error: any) => {
    console.log(error.message);
  });
}

bootstrap();