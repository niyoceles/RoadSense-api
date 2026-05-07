import { JwtService } from '@nestjs/jwt';
export declare class AuthService {
    private jwtService;
    constructor(jwtService: JwtService);
    validateGoogleUser(googleUser: any): Promise<{
        access_token: string;
        user: any;
    }>;
}
