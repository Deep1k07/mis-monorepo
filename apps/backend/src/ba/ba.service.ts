import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schema/ba.schema';
import { Model } from 'mongoose';
import { AuthRequest } from 'src/common/interfaces/auth-request.interface';

@Injectable()
export class BaService {
    constructor(@InjectModel(User.name) private userModel: Model<User>) { }

    async getAll(req: AuthRequest, searchTerm: string) {
        let result = await this.userModel.find({
            $and: [
                { user: req.user.userId },
                {
                    $or: [
                        { username: new RegExp(searchTerm, 'i') },
                        { userId: new RegExp(searchTerm, 'i') },
                    ],
                },
            ],
        }).sort({ username: 1 })

        return result;
    }
}
