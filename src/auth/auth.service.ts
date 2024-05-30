import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PrismaClient } from '@prisma/client';
import { connect } from 'http2';
import { RegisterUserDto } from './dto';

@Injectable()
export class AuthService extends PrismaClient implements OnModuleInit {

  private readonly logger = new Logger('Authservice')

  onModuleInit() {
    this.$connect();
    this.logger.log('Authservice connected to database')
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
          password
        }
      })

      return {
        user: newUser
      };

    } catch (error) {
      throw new RpcException({
        status: 400,
        message: error.message
      })
    }
  }

}
