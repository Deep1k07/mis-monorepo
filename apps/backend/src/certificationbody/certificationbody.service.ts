import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  CertificationBody,
  CertificationBodyDocument,
} from './schema/certificationBody.schema';
import { Model } from 'mongoose';
import { CertificationStandard, CertificationStandardDocument } from './schema/certificationStandards.schema';

@Injectable()
export class CetificationbodyService {
  constructor(
    @InjectModel(CertificationBody.name)
    private certificationBodyModel: Model<CertificationBodyDocument>,
    @InjectModel(CertificationStandard.name)
    private certificationStandardModel: Model<CertificationStandardDocument>,
  ) { }

  async getAllCertificationBodies() {
    return this.certificationBodyModel.find().select('-cabJurisdictions').populate('user', 'email firstName lastName').exec();
  }

  async getAllStandards() {
    return this.certificationStandardModel.find().populate('user', 'firstName lastName email').populate('certificationBody', 'cabCode cbCode').exec();
  }
}
