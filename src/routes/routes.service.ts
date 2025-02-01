import { Inject, Injectable } from '@nestjs/common';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { DirectionsService } from 'src/maps/directions/directions.service';
import * as Kafkalib from '@confluentinc/kafka-javascript';
@Injectable()
export class RoutesService
{
  constructor(
    private prismaService: PrismaService,
    private directionsService: DirectionsService,
    @Inject( 'KAFKA_PRODUCER' ) private kafkaProducer: Kafkalib.KafkaJS.Producer ) { }
  async create( createRouteDto: CreateRouteDto )
  {
    const { available_travel_modes, geocoded_waypoints, routes, request } = await this.directionsService.getDirections( createRouteDto.sourceId, createRouteDto.destinationId )
    const legs = routes[0].legs[0]
    const route = await this.prismaService.route.create( {
      data: {
        name: createRouteDto.name,
        source: {
          name: legs.start_address,
          location: {
            lat: legs.start_location.lat,
            lng: legs.start_location.lng,

          }
        },
        destination: {
          name: legs.end_address,
          location: {
            lat: legs.end_location.lat,
            lng: legs.end_location.lng,
          }
        },
        directions: JSON.parse( JSON.stringify( {
          available_travel_modes,
          geocoded_waypoints,
          routes,
          request
        } ) ),
        distance: legs.distance.value,
        duration: legs.duration.value

      }
    } )
    await this.kafkaProducer.send( {
      topic: 'route',
      messages: [{
        value: JSON.stringify( {
          eventName: "RouteCreated",
          id: route.id,
          distance: legs.distance.value,
          directions: legs.steps.reduce( ( acc, step ) =>
          {
            acc.push( {
              lat: step.start_location.lat,
              lng: step.start_location.lng,

            } )
            acc.push( {
              lat: step.end_location.lat,
              lng: step.end_location.lng,
            } )
            return acc
          }, [] )
        } )
      }]
    } )

    return route
  }

  async findAll()
  {
    return await this.prismaService.route.findMany();
  }

  async findOne( id: string )
  {
    return await this.prismaService.route.findUniqueOrThrow( {
      where: { id }
    } )
  }

  update( id: string, updateRouteDto: UpdateRouteDto )
  {
    console.log( "updateRouteDto", updateRouteDto )
    console.log( "id", id )
    return this.prismaService.route.update( { where: { id }, data: updateRouteDto } );
  }

  remove( id: number )
  {
    return `This action removes a #${ id } route`;
  }
}
