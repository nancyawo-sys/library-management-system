import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { BooksModule } from './books/books.module';
import { GenresModule } from './genres/genres.module';

@Module({
  imports: [PrismaModule, AuthModule, BooksModule, GenresModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}