import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { LoginUserDto, RegisterUserDto } from './dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { envs } from 'src/config';

@Injectable()
export class AuthService extends PrismaClient implements OnModuleInit {

  private readonly logger = new Logger('Authservice');

  constructor(
    private readonly jwtService: JwtService,
  ) {
    super();
  }

  onModuleInit() {
    this.$connect();
    this.logger.log('Authservice connected to database')
  }

  async signJWT(payload: JwtPayload) {
    return this.jwtService.sign(payload)
  }

  async registerUser(registerUserDto: RegisterUserDto) {
    const { name, email, password } = registerUserDto;

    try {
      const user = await this.user.findUnique({
        where: {
          email
        }
      })

      if (user) {
        throw new RpcException({
          status: 400,
          message: 'User already exists'
        })
      }
      const newUser = await this.user.create({
        data: {
          name,
          email,
          password: bcrypt.hashSync(password, 10)
        }
      })

      const { password: _, ...userWithoutPassword } = newUser;
      return {
        user: userWithoutPassword,
        token: await this.signJWT({ id: newUser.id })
      };

    } catch (error) {
      throw new RpcException({
        status: 400,
        message: error.message
      })
    }
  }


  async loginUser(loginUserDto: LoginUserDto) {

    const { email, password } = loginUserDto;

    try {
      const user = await this.user.findUnique({
        where: {
          email
        }
      })

      if (!user) {
        throw new RpcException({
          status: 400,
          message: 'Invalid Credentials'
        })
      }

      const isPasswordValid = bcrypt.compareSync(password, user.password);

      if (!isPasswordValid) {
        throw new RpcException({
          status: 400,
          message: 'Password no valid'
        })
      }

      const { password: _, ...userWithoutPassword } = user;
      return {
        user: userWithoutPassword,
        token: await this.signJWT({ id: user.id })
      };

    } catch (error) {
      throw new RpcException({
        status: 400,
        message: error.message
      })
    }
  }


  async verifyToken(token: string) {
    try {
      const { sub, iat, exp, ...user } = await this.jwtService.verifyAsync(token, {
        secret: envs.jwtSecret,
      });

      return {
        user: user,
        token: await this.signJWT(user)
      }

    } catch (error) {
      throw new RpcException({
        status: 401,
        message: 'Invalid token'
      })
    }

  }
}
