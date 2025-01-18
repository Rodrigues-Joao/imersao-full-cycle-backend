import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { RoutesService } from '../routes.service';
import { resolve } from 'path';

@WebSocketGateway( {
  cors: {
    origin: "*"
  }
} )
export class RoutesDriverGateway
{
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
}
const sleep = ( ms: number ) => new Promise( resolve => setTimeout( resolve, ms ) )
