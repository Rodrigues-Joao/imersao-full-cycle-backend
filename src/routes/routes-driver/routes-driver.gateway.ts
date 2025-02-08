import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { RoutesService } from '../routes.service';
import { Server } from 'socket.io'
import { Logger } from '@nestjs/common';
@WebSocketGateway( {
  cors: {
    origin: "*"
  }
} )
export class RoutesDriverGateway
{
  @WebSocketServer()
  server: Server

  private readonly logger = new Logger( RoutesDriverGateway.name );
  constructor( private routesService: RoutesService )
  {

  }
  @SubscribeMessage( 'client:new-points' )
  async handleMessage( client: any, payload: any )
  {
    const { routeId } = payload
    const route = await this.routesService.findOne( routeId )
    // @ts-ignore
    const { steps } = route.directions.routes[0].legs[0]
    for ( const step of steps )
    {
      const { lat, lng } = step.start_location
      client.emit( `server:new-points/${ routeId }:list`, { routeId, lat, lng } )
      client.broadcast.emit( `server:new-points:list`, { routeId, lat, lng } )
      await sleep( 2000 )
      const { lat: endLat, lng: endLng } = step.end_location
      client.emit( `server:new-points/${ routeId }:list`, { routeId, lat: endLat, lng: endLng } )
      client.broadcast.emit( `server:new-points:list`, { routeId, lat: endLat, lng: endLng } )
      await sleep( 2000 )

    }
  }
  emitNewPoints( payload: { routeId: string, lat: number, lng: number } )
  {
    const { routeId, lat, lng } = payload
    this.logger.log( `server:new-points/${ routeId }:list` )
    this.server.emit( `server:new-points/${ routeId }:list`, { routeId, lat, lng } )
    this.server.emit( `server:new-points:list`, { routeId, lat, lng } )
  }

}
const sleep = ( ms: number ) => new Promise( resolve => setTimeout( resolve, ms ) )