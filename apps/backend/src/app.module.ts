import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PermissionModule } from './permission/permission.module';
import { EntityModule } from './entity/entity.module';
import { CountryModule } from './country/country.module';
import { RoleModule } from './role/role.module';
import { ApplicationModule } from './application/application.module';
import { BaModule } from './ba/ba.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),

        // 👇 ADD THIS
        onConnectionCreate: (connection) => {
          console.log('⏳ Connecting to MongoDB...');

          connection.on('connected', () => {
            console.log('✅ MongoDB connected successfully');
          });

          connection.on('error', (err) => {
            console.log('❌ MongoDB connection error:', err);
          });

          connection.on('disconnected', () => {
            console.log('⚠️ MongoDB disconnected');
          });

          return connection;
        },
      }),
    }),
    PermissionModule,
    EntityModule,
    CountryModule,
    RoleModule,
    ApplicationModule,
    BaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
