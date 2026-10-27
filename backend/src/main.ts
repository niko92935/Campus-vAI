import { Module, Controller, Get, Post, Body } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

@Controller('api/ota')
class OtaController {
  @Get('check')
  checkVersion() {
    // Simulated OTA response for mobile clients (Android & iOS)
    return {
      updateAvailable: false,
      currentVersion: '1.0.0',
      bundleUrl: '',
      message: 'App is up to date.'
    };
  }

  @Post('publish')
  publishUpdate(@Body() body: { version: string; bundleUrl: string }) {
    // In production, this saves the latest version manifest to PostgreSQL/Redis
    return {
      success: true,
      message: `OTA update version ${body.version} published successfully!`,
      publishedAt: new Date().toISOString()
    };
  }
}

@Module({
  controllers: [OtaController],
})
class OtaModule {}

async function bootstrap() {
  const app = await NestFactory.create(OtaModule);
  app.enableCors();
  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`MindLink OTA & Backend Service running on port ${port}`);
}
bootstrap();
