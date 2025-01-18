import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProcessRouteDto } from './dto/process-route.dto';

@Injectable()
export class RoutesDriverService
{
    constructor( private prismaService: PrismaService ) { }
    async processRoute( processRouteDto: ProcessRouteDto )
    {

        const routeDriver = await this.prismaService.routeDriver.upsert( {
            include: { route: true },
            where: { route_id: processRouteDto.routeId },
            create: {
                route_id: processRouteDto.routeId,
                points: {
                    set: {
                        location: {
                            lat: processRouteDto.lat,
                            lng: processRouteDto.lng
                        }
                    }
                }
            },
            update: {
                points: {
                    push: {
                        location: {
                            lat: processRouteDto.lat,
                            lng: processRouteDto.lng
                        }
                    }
                }
            }
        } )
        return routeDriver
    }
}
