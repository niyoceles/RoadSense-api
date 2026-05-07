import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async validateGoogleUser(googleUser: any) {
    // In a real app, find or create user in DB
    const payload = { email: googleUser.email, sub: googleUser.googleId };
    return {
      access_token: this.jwtService.sign(payload),
      user: googleUser,
    };
  }
}
