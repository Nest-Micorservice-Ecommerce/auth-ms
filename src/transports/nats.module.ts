import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { NATS_SERVICE, envs } from 'src/config';

@Module({
  imports: [
    ClientsModule.register([
      //* configuracion con protocolo NATS
      {
        name: NATS_SERVICE,
        transport: Transport.NATS,
        options: {
          servers: envs.natsServers,
        }

      },
    ]),
  ],
  exports: [
    ClientsModule.register([
      //* configuracion con protocolo NATS
      {
        name: NATS_SERVICE,
        transport: Transport.NATS,
        options: {
          servers: envs.natsServers,
        }

      },
    ]),
  ]
})
export class NatsModule { }
