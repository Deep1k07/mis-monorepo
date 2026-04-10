import { BadRequestException, Injectable } from '@nestjs/common';
import { escapeRegex } from 'src/utils/escapeRegex';
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
  ) { }

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

  async getAllCabs(page: number = 1, limit: number = 10, search?: string) {
    const skip = (page - 1) * limit;
    const filter: any = {};

    if (search) {
      const regex = new RegExp(escapeRegex(search), 'i');
      filter.$or = [
        { cabCode: regex },
        { cbCode: regex },
        { cbName: regex },
        { abCode: regex },
        { abName: regex },
      ];
    }

    const [data, total] = await Promise.all([
      this.certificationBodyModel
        .find(filter)
        .select('-cabJurisdictions')
        .populate('user', 'email firstName lastName')
        .populate('standards', 'mssCode schemeName standardCode version status')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      this.certificationBodyModel.countDocuments(filter),
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
      .populate('standards', 'mssCode schemeName standardCode version status')
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

    // Sync certificationBodies ref on standards when standards array changes
    if (body.standards) {
      const oldStandardIds = cab.standards?.map((s) => s.toString()) || [];
      const newStandardIds = body.standards;

      // Standards removed from this CAB — pull this CAB from their certificationBodies
      const removed = oldStandardIds.filter((s) => !newStandardIds.includes(s));
      if (removed.length) {
        await this.certificationStandardModel.updateMany(
          { _id: { $in: removed } },
          { $pull: { certificationBodies: id } },
        );
      }

      // Standards added to this CAB — push this CAB into their certificationBodies
      const added = newStandardIds.filter((s) => !oldStandardIds.includes(s));
      if (added.length) {
        await this.certificationStandardModel.updateMany(
          { _id: { $in: added } },
          { $addToSet: { certificationBodies: id } },
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
    // Validate all CABs exist
    const cabs = await this.certificationBodyModel.find({
      _id: { $in: body.certificationBodies },
    });
    if (cabs.length !== body.certificationBodies.length) {
      throw new BadRequestException(
        'One or more Certification Bodies not found',
      );
    }

    const standard = await this.certificationStandardModel.create({
      ...body,
      user: req.user.userId,
    });

    // If this standard has a predecessor, set the predecessor's successor and mark it expired
    if (body.predecessor) {
      await this.certificationStandardModel.findByIdAndUpdate(
        body.predecessor,
        { $set: { successor: standard._id, status: 'expired' } },
      );
    }

    // Add this standard to all selected CABs
    await this.certificationBodyModel.updateMany(
      { _id: { $in: body.certificationBodies } },
      { $addToSet: { standards: standard._id } },
    );

    return standard;
  }

  async getAllStandards(
    page: number = 1,
    limit: number = 10,
    certificationBody?: string,
    search?: string,
  ) {
    const skip = (page - 1) * limit;
    const filter: any = {};
    if (certificationBody) {
      filter.certificationBodies = certificationBody;
    }

    if (search) {
      const regex = new RegExp(escapeRegex(search), 'i');
      filter.$and = [
        ...(filter.$and || []),
        {
          $or: [
            { mssCode: regex },
            { schemeName: regex },
            { standardCode: regex },
          ],
        },
      ];
    }

    const [data, total] = await Promise.all([
      this.certificationStandardModel
        .find(filter)
        .populate('user', 'firstName lastName email')
        .populate('certificationBodies', 'cabCode cbCode cbName')
        .populate('predecessor', 'standardCode version')
        .populate('successor', 'standardCode version')
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
      .populate('certificationBodies', 'cabCode cbCode cbName')
      .populate('predecessor', 'standardCode version')
      .populate('successor', 'standardCode version');
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

    if (body.certificationBodies) {
      const oldCabIds =
        standard.certificationBodies?.map((c) => c.toString()) || [];
      const newCabIds = body.certificationBodies;

      // CABs removed — pull this standard from their standards array
      const removed = oldCabIds.filter((c) => !newCabIds.includes(c));
      if (removed.length) {
        await this.certificationBodyModel.updateMany(
          { _id: { $in: removed } },
          { $pull: { standards: standard._id } },
        );
      }

      // CABs added — push this standard into their standards array
      const added = newCabIds.filter((c) => !oldCabIds.includes(c));
      if (added.length) {
        await this.certificationBodyModel.updateMany(
          { _id: { $in: added } },
          { $addToSet: { standards: id } },
        );
      }
    }

    return this.certificationStandardModel.findByIdAndUpdate(
      id,
      { $set: body },
      { returnDocument: 'after' },
    );
  }


  async getCode() {
    const codes = await this.certificationStandardModel.find({ status: 'active' }).select('standardCode code')
    return codes;
  }
}
