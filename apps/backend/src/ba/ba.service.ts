import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schema/ba.schema';
import { Model } from 'mongoose';

@Injectable()
export class BaService {
    constructor(@InjectModel(User.name) private userModel: Model<User>) { }
}
