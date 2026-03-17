import { Injectable } from '@nestjs/common';
import { LoginDto } from './dto/user.dto';

@Injectable()
export class AuthService {
    login(body: LoginDto) {
        return body
    }
}
