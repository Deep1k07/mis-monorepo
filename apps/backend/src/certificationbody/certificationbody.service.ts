import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  CertificationBody,
  CertificationBodyDocument,
} from './schema/certificationBody.schema';
import { Model } from 'mongoose';
import {
  CertificationStandard,
  CertificationStandardDocument,
} from './schema/certificationStandards.schema';
import { CreateCabDto } from './dto/create-cab.dto';
import { CreateStandardDto } from './dto/create-standard.dto';
import { AuthRequest } from 'src/common/interfaces/auth-request.interface';

@Injectable()
export class CetificationbodyService {
  constructor(
    @InjectModel(CertificationBody.name)
    private certificationBodyModel: Model<CertificationBodyDocument>,
    @InjectModel(CertificationStandard.name)
    private certificationStandardModel: Model<CertificationStandardDocument>,
  ) {}

  // ─── CAB Methods ───

  async createCab(body: CreateCabDto, req: AuthRequest) {
    const existing = await this.certificationBodyModel.findOne({
      cabCode: body.cabCode.toUpperCase(),
    });
    if (existing) {
      throw new BadRequestException(
        `CAB with code ${body.cabCode} already exists`,
      );
    }

    return this.certificationBodyModel.create({
      ...body,
      user: req.user.userId,
    });
  }

  async getAllCabs(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.certificationBodyModel
        .find()
        .select('-cabJurisdictions')
        .populate('user', 'email firstName lastName')
        .populate('standards', 'mssCode schemeName standardCode status')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      this.certificationBodyModel.countDocuments(),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getCabById(id: string) {
    const cab = await this.certificationBodyModel
      .findById(id)
      .populate('user', 'email firstName lastName')
      .populate('standards', 'mssCode schemeName standardCode status')
      .populate('cabJurisdictions');
    if (!cab) {
      throw new BadRequestException('Certification Body not found');
    }
    return cab;
  }

  async updateCab(id: string, body: CreateCabDto, req: AuthRequest) {
    const cab = await this.certificationBodyModel.findById(id);
    if (!cab) {
      throw new BadRequestException('Certification Body not found');
    }

    if (body.cabCode && body.cabCode.toUpperCase() !== cab.cabCode) {
      const existing = await this.certificationBodyModel.findOne({
        cabCode: body.cabCode.toUpperCase(),
        _id: { $ne: id },
      });
      if (existing) {
        throw new BadRequestException(
          `CAB with code ${body.cabCode} already exists`,
        );
      }
    }

    // Sync certificationBody ref on standards when standards array changes
    if (body.standards) {
      const oldStandardIds = cab.standards?.map((s) => s.toString()) || [];
      const newStandardIds = body.standards;

      // Standards removed from this CAB — unset their certificationBody
      const removed = oldStandardIds.filter(
        (s) => !newStandardIds.includes(s),
      );
      if (removed.length) {
        await this.certificationStandardModel.updateMany(
          { _id: { $in: removed } },
          { $unset: { certificationBody: '' } },
        );
      }

      // Standards added to this CAB — set their certificationBody
      const added = newStandardIds.filter(
        (s) => !oldStandardIds.includes(s),
      );
      if (added.length) {
        await this.certificationStandardModel.updateMany(
          { _id: { $in: added } },
          { $set: { certificationBody: id } },
        );
      }
    }

    return this.certificationBodyModel.findByIdAndUpdate(
      id,
      { $set: body },
      { returnDocument: 'after' },
    );
  }

  // ─── Standard Methods ───

  async createStandard(body: CreateStandardDto, req: AuthRequest) {
    const cab = await this.certificationBodyModel.findById(
      body.certificationBody,
    );
    if (!cab) {
      throw new BadRequestException('Certification Body not found');
    }

    const standard = await this.certificationStandardModel.create({
      ...body,
      user: req.user.userId,
    });

    await this.certificationBodyModel.findByIdAndUpdate(
      body.certificationBody,
      { $addToSet: { standards: standard._id } },
    );

    return standard;
  }

  async getAllStandards(
    page: number = 1,
    limit: number = 10,
    certificationBody?: string,
  ) {
    const skip = (page - 1) * limit;
    const filter: any = {};
    if (certificationBody) {
      filter.certificationBody = certificationBody;
    }

    const [data, total] = await Promise.all([
      this.certificationStandardModel
        .find(filter)
        .populate('user', 'firstName lastName email')
        .populate('certificationBody', 'cabCode cbCode cbName')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      this.certificationStandardModel.countDocuments(filter),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getStandardById(id: string) {
    const standard = await this.certificationStandardModel
      .findById(id)
      .populate('user', 'firstName lastName email')
      .populate('certificationBody', 'cabCode cbCode cbName');
    if (!standard) {
      throw new BadRequestException('Standard not found');
    }
    return standard;
  }

  async updateStandard(id: string, body: CreateStandardDto, req: AuthRequest) {
    const standard = await this.certificationStandardModel.findById(id);
    if (!standard) {
      throw new BadRequestException('Standard not found');
    }

    if (
      body.certificationBody &&
      body.certificationBody !== standard.certificationBody?.toString()
    ) {
      // Remove from old CAB's standards array
      await this.certificationBodyModel.findByIdAndUpdate(
        standard.certificationBody,
        { $pull: { standards: standard._id } },
      );
      // Add to new CAB's standards array
      await this.certificationBodyModel.findByIdAndUpdate(
        body.certificationBody,
        { $addToSet: { standards: id } },
      );
    }

    return this.certificationStandardModel.findByIdAndUpdate(
      id,
      { $set: body },
      { returnDocument: 'after' },
    );
  }
}
