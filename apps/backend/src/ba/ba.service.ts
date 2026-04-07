import { BadRequestException, Injectable } from '@nestjs/common';
import { escapeRegex } from 'src/utils/escapeRegex';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schema/ba.schema';
import { Model } from 'mongoose';
import { AuthRequest } from 'src/common/interfaces/auth-request.interface';
import { CabBA } from './schema/cabBa.schema';
import { CreateBaDto } from './dto/create-ba.dto';
import { UpdateBaDto } from './dto/update-ba.dto';
import { generateAlphanumericCode } from 'src/utils/createEntityId';
import bcrypt from 'bcryptjs';

@Injectable()
export class BaService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(CabBA.name) private cabBaModel: Model<CabBA>,
  ) {}

  private async getUniqueUserId(): Promise<string> {
    while (true) {
      const id = generateAlphanumericCode(4);
      const found = await this.userModel.exists({ userId: id });
      if (!found) return id;
    }
  }

  async create(req: AuthRequest, body: CreateBaDto) {
    // Check duplicate registration number
    const existingReg = await this.cabBaModel.findOne({
      registration_number: body.registration_number,
    });
    if (existingReg) {
      throw new BadRequestException('A BA with this registration number already exists');
    }

    // Create CabBA document
    const cabBa = await this.cabBaModel.create({
      contact_name: body.contact_name,
      registration_authority: body.registration_authority,
      registration_number: body.registration_number,
      registration_date: body.registration_date || '',
      address: body.address || {},
      currency: body.currency,
      gst: body.gst,
      certificateLanguage: body.certificateLanguage,
      otherCertificateLanguage: body.otherCertificateLanguage,
      cab: body.cab || [],
      website: body.website || '',
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(body.password, salt);
    const userId = await this.getUniqueUserId();

    // Create User (BA) document
    const user = await this.userModel.create({
      username: body.username,
      userId,
      email: body.email?.toLowerCase(),
      phone: body.phone,
      password: hashedPassword,
      role: 'Business_Associate',
      cab: cabBa._id,
      status: 'active',
      user: req.user.userId,
    });

    return user.populate('cab');
  }

  async update(id: string, body: UpdateBaDto) {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new BadRequestException('BA not found');
    }

    // Update CabBA fields
    if (user.cab) {
      const cabBaUpdate: any = {};
      const cabBaFields = [
        'contact_name',
        'registration_authority',
        'registration_number',
        'registration_date',
        'address',
        'currency',
        'gst',
        'certificateLanguage',
        'otherCertificateLanguage',
        'cab',
        'website',
      ] as const;

      for (const field of cabBaFields) {
        if (body[field] !== undefined) {
          cabBaUpdate[field] = body[field];
        }
      }

      if (Object.keys(cabBaUpdate).length > 0) {
        // Check duplicate registration number
        if (cabBaUpdate.registration_number) {
          const existing = await this.cabBaModel.findOne({
            registration_number: cabBaUpdate.registration_number,
            _id: { $ne: user.cab },
          });
          if (existing) {
            throw new BadRequestException('A BA with this registration number already exists');
          }
        }
        await this.cabBaModel.findByIdAndUpdate(user.cab, { $set: cabBaUpdate });
      }
    }

    // Update User fields
    const userUpdate: any = {};
    if (body.username !== undefined) {
      userUpdate.username = body.username;
    }
    if (body.email !== undefined) userUpdate.email = body.email.toLowerCase();
    if (body.phone !== undefined) userUpdate.phone = body.phone;
    if (body.status !== undefined) userUpdate.status = body.status;

    if (body.password) {
      const salt = await bcrypt.genSalt(10);
      userUpdate.password = await bcrypt.hash(body.password, salt);
    }

    return this.userModel
      .findByIdAndUpdate(id, { $set: userUpdate }, { returnDocument: 'after' })
      .populate('cab');
  }

  async getAll(req: AuthRequest, searchTerm: string) {
    let user = req.user;
    if (user.permissions.includes('ba:read:all')) {
      let result = await this.userModel
        .find({
          $and: [
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

  async getAllPaginated(
    req: AuthRequest,
    page: number = 1,
    limit: number = 10,
    search?: string,
  ) {
    const skip = (page - 1) * limit;
    const filter: any = {};

    if (search) {
      const regex = new RegExp(escapeRegex(search), 'i');
      filter.$or = [
        { username: regex },
        { userId: regex },
        { email: regex },
      ];
    }

    // If user doesn't have ba:read:all, restrict to their own BAs
    if (!req.user.permissions.includes('ba:read:all')) {
      filter.user = req.user.userId;
    }

    const [data, total] = await Promise.all([
      this.userModel
        .find(filter)
        .populate('cab')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      this.userModel.countDocuments(filter),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getAllCabBa() {
    return this.cabBaModel.find().exec();
  }
}
