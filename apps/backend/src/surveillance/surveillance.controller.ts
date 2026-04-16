import {
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import type { AuthRequest } from 'src/common/interfaces/auth-request.interface';
import { SurveillanceService } from './surveillance.service';
import {
  SurveillanceQueryDto,
  SurveillanceType,
} from './dto/surveillance.dto';

@ApiTags('Surveillance')
@ApiCookieAuth()
@Controller('surveillance')
export class SurveillanceController {
  constructor(private readonly surveillanceService: SurveillanceService) {}

  @Get(':type')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List surveillance (first/second) with pagination' })
  @ApiResponse({ status: 200, description: 'Paginated list of surveillance' })
  async findAll(
    @Req() req: AuthRequest,
    @Param('type') type: SurveillanceType,
    @Query() query: SurveillanceQueryDto,
  ) {
    return this.surveillanceService.findAll(
      req,
      type,
      query.page,
      query.limit,
      query.search,
      query.status,
      query.cabCode,
      query.ba,
    );
  }

  @Get(':type/:id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get surveillance by ID' })
  @ApiResponse({ status: 200, description: 'Surveillance found' })
  async findById(
    @Param('type') type: SurveillanceType,
    @Param('id') id: string,
  ) {
    return this.surveillanceService.findById(type, id);
  }

  @Patch(':type/:id/apply')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Apply for surveillance' })
  @ApiResponse({ status: 200, description: 'Surveillance applied' })
  async applySurveillance(
    @Req() req: AuthRequest,
    @Param('type') type: SurveillanceType,
    @Param('id') id: string,
  ) {
    return this.surveillanceService.applySurveillance(req, type, id);
  }
}
