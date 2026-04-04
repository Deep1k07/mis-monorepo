import { Injectable } from '@nestjs/common';
import { escapeRegex } from 'src/utils/escapeRegex';
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
    let user = req.user;
    if (user.permissions.includes('ba:read:all')) {
      let result = await this.userModel
        .find({
          $and: [
            // { user: user.userId },
            {
              $or: [
                { username: new RegExp(escapeRegex(searchTerm), 'i') },
                { userId: new RegExp(escapeRegex(searchTerm), 'i') },
              ],
            },
          ],
        })
        .sort({ username: 1 });

      return result;
    }
    let result = await this.userModel
      .find({
        $and: [
          { user: user.userId },
          {
            $or: [
              { username: new RegExp(escapeRegex(searchTerm), 'i') },
              { userId: new RegExp(escapeRegex(searchTerm), 'i') },
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
