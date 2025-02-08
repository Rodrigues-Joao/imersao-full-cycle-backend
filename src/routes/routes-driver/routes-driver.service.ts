import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProcessRouteDto } from './dto/process-route.dto';
import { RoutesDriverGateway } from './routes-driver.gateway';

@Injectable()
export class RoutesDriverService
{
    constructor( private prismaService: PrismaService, private routesGateway: RoutesDriverGateway ) { }
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
        this.routesGateway.emitNewPoints( { routeId: processRouteDto.routeId, lat: processRouteDto.lat, lng: processRouteDto.lng } )
        return routeDriver
    }
}
