import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  CertificationBody,
  CertificationBodyDocument,
} from './schema/certificationBody.schema';
import { Model } from 'mongoose';

@Injectable()
export class CetificationbodyService {
  constructor(
    @InjectModel(CertificationBody.name)
    private certificationBodyModel: Model<CertificationBodyDocument>,
  ) {}
}
