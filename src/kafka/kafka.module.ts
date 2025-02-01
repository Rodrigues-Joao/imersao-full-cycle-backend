import { Inject, Module, OnModuleInit } from '@nestjs/common';
import * as Kafkalib from '@confluentinc/kafka-javascript';
import { ConfigService } from '@nestjs/config';

@Module( {
    providers: [
        {
            provide: 'KAFKA_PRODUCER',
            useFactory( configService: ConfigService )
            {
                return new Kafkalib.KafkaJS.Kafka( {
                    'bootstrap.servers': configService.get( 'KAFKA_BROKER' )
                } ).producer();
            },
            inject: [ConfigService]
        }
    ],
    exports: ['KAFKA_PRODUCER']
} )
export class KafkaModule implements OnModuleInit
{
    constructor( @Inject( 'KAFKA_PRODUCER' ) private kafkaProducer: Kafkalib.KafkaJS.Producer ) { }
    async onModuleInit()
    {
        await this.kafkaProducer.connect();
    }
}
