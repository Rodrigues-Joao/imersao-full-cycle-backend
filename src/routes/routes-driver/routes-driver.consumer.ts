import { Controller, Logger } from "@nestjs/common";
import { MessagePattern } from "@nestjs/microservices";
import { KafkaContext } from "src/kafka/kafka-context";
import { RoutesService } from "../routes.service";

@Controller()
export class RoutesDriverConsumer
{
    private readonly logger = new Logger( RoutesDriverConsumer.name );
    constructor() { }
    @MessagePattern( 'simulation' )
    async driverMoved( payload: KafkaContext )
    {
        this.logger.log( `Receivingn from topic ${ payload.topic }`, payload.messageValue );
        const { amount, routeId } = payload.messageValue;

    }

}