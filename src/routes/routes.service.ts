import { Injectable } from '@nestjs/common';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { DirectionsService } from 'src/maps/directions/directions.service';

@Injectable()
export class RoutesService
{
  constructor( private prismaService: PrismaService, private directionsService: DirectionsService ) { }
  async create( createRouteDto: CreateRouteDto )
  {
    const { available_travel_modes, geocoded_waypoints, routes, request } = await this.directionsService.getDirections( createRouteDto.sourceId, createRouteDto.destinationId )
    const legs = routes[0].legs[0]
    return await this.prismaService.route.create( {
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

  update( id: number, updateRouteDto: UpdateRouteDto )
  {
    return `This action updates a #${ id } route`;
  }

  remove( id: number )
  {
    return `This action removes a #${ id } route`;
  }
}
