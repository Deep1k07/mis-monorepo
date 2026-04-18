import {
  Body,
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
  UpdateSurveillanceDraftDto,
  UpdateSurveillanceFinalDto,
} from './dto/surveillance.dto';

@ApiTags('Surveillance')
@ApiCookieAuth()
@Controller('surveillance')
export class SurveillanceController {
  constructor(private readonly surveillanceService: SurveillanceService) {}

  @Get('draft/:type')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List draft (requested) surveillance' })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of draft surveillance',
  })
  async findDraft(
    @Req() req: AuthRequest,
    @Param('type') type: SurveillanceType,
    @Query() query: SurveillanceQueryDto,
  ) {
    return this.surveillanceService.findDraft(
      req,
      type,
      query.page,
      query.limit,
      query.search,
    );
  }

  @Patch('draft/:type/:id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Approve or reject a draft surveillance' })
  @ApiResponse({ status: 200, description: 'Draft surveillance updated' })
  async updateDraft(
    @Req() req: AuthRequest,
    @Param('type') type: SurveillanceType,
    @Param('id') id: string,
    @Body() body: UpdateSurveillanceDraftDto,
  ) {
    return this.surveillanceService.updateDraft(req, type, id, body);
  }

  @Get('final/:type')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List final surveillance for quality review' })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of final surveillance',
  })
  async findFinal(
    @Req() req: AuthRequest,
    @Param('type') type: SurveillanceType,
    @Query() query: SurveillanceQueryDto,
  ) {
    return this.surveillanceService.findFinal(
      req,
      type,
      query.page,
      query.limit,
      query.search,
      query.status,
    );
  }

  @Patch('final/:type/:id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Approve or reject a final surveillance' })
  @ApiResponse({ status: 200, description: 'Final surveillance updated' })
  async updateFinal(
    @Req() req: AuthRequest,
    @Param('type') type: SurveillanceType,
    @Param('id') id: string,
    @Body() body: UpdateSurveillanceFinalDto,
  ) {
    return this.surveillanceService.updateFinal(req, type, id, body);
  }

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
