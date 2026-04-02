import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schema/ba.schema';
import { Model } from 'mongoose';
import { AuthRequest } from 'src/common/interfaces/auth-request.interface';
import { CabBA } from './schema/cabBa.schema';

@Injectable()
export class BaService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(CabBA.name) private cabBaModel: Model<CabBA>
  ) { }

  async getAll(req: AuthRequest, searchTerm: string) {
    let result = await this.userModel
      .find({
        $and: [
          { user: req.user.userId },
          {
            $or: [
              { username: new RegExp(searchTerm, 'i') },
              { userId: new RegExp(searchTerm, 'i') },
            ],
          },
        ],
      })
      .sort({ username: 1 });

    return result;
  }

  async getAllCabBa() {
    return this.cabBaModel.find().exec();
  }
}
