import { Injectable, ConflictException, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../prisma/prisma.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException("Email already registered");

    const hashed = await bcrypt.hash(dto.password, 10);
    // Role is never taken from the request: public sign-ups are always patrons.
    const user = await this.prisma.user.create({
      data: { email: dto.email, name: dto.name, password: hashed, role: "PATRON" },
    });
    return { id: user.id, email: user.email, role: user.role };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    const ok = user && (await bcrypt.compare(dto.password, user.password));
    if (!user || !ok) throw new UnauthorizedException("Invalid email or password");

    const access_token = this.jwt.sign({ sub: user.id, role: user.role });
    return { access_token };
  }
}
