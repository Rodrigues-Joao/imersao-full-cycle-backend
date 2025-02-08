import { Controller, Logger } from "@nestjs/common";
import { MessagePattern } from "@nestjs/microservices";
import { KafkaContext } from "src/kafka/kafka-context";
import { HttpService } from "@nestjs/axios";
import { RoutesDriverService } from "./routes-driver.service";

@Controller()
export class RoutesDriverConsumer
{

    private readonly logger = new Logger( RoutesDriverConsumer.name );
    constructor( private httpService: HttpService, private routesDriverService: RoutesDriverService ) { }
    @MessagePattern( 'simulation' )
    async driverMoved( payload: KafkaContext )
    {
        this.logger.log( `Receivingn from topic ${ payload.topic }`, payload.messageValue );
        // this.routesDriverService.processRoute( { routeId: payload.messageValue.routeId, lat: payload.messageValue.lat, lng: payload.messageValue.lng } )
        await this.httpService.axiosRef.post( `http://localhost:3000/routes/${ payload.messageValue.routeId }/process-route`, {
            lat: payload.messageValue.lat,
            lng: payload.messageValue.lng
        } )
    }

}