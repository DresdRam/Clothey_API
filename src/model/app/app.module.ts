import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entity/user.entity';
import { UserModule } from '../user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env'
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          type: config.get<any>('TYPE'),
          host: config.get<string>('HOST'),
          port: Number(config.get('PORT')),
          username: config.get<string>('DATABASE_USERNAME'),
          password: config.get<string>('DATABASE_PASSWORD'),
          database: config.get<string>('DATABASE_NAME'),
          synchronize: false,
          entities: [User]
        }
      }
    }),
  UserModule]
})
export class AppModule { }
