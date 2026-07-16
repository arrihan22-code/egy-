import { Controller, Get, Query, Param } from '@nestjs/common';
import { MapsService } from './maps.service';

@Controller('maps')
export class MapsController {
  constructor(private readonly mapsService: MapsService) {}

  @Get('nearby')
  async findNearby(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('radius') radius?: string,
    @Query('type') type?: string,
    @Query('limit') limit?: string,
  ) {
    return this.mapsService.findNearby({
      latitude: parseFloat(lat),
      longitude: parseFloat(lng),
      radiusKm: radius ? parseFloat(radius) : 5,
      type,
      limit: limit ? parseInt(limit) : 50,
    });
  }

  @Get('distance')
  async getDistance(
    @Query('lat1') lat1: string,
    @Query('lng1') lng1: string,
    @Query('lat2') lat2: string,
    @Query('lng2') lng2: string,
  ) {
    return this.mapsService.getDistance({
      lat1: parseFloat(lat1),
      lng1: parseFloat(lng1),
      lat2: parseFloat(lat2),
      lng2: parseFloat(lng2),
    });
  }

  @Get('bounds')
  async getBounds(
    @Query('swLat') swLat: string,
    @Query('swLng') swLng: string,
    @Query('neLat') neLat: string,
    @Query('neLng') neLng: string,
    @Query('type') type?: string,
  ) {
    return this.mapsService.getBounds({
      southWest: { lat: parseFloat(swLat), lng: parseFloat(swLng) },
      northEast: { lat: parseFloat(neLat), lng: parseFloat(neLng) },
      type,
    });
  }

  @Get('reverse-geocode')
  async reverseGeocode(@Query('lat') lat: string, @Query('lng') lng: string) {
    return this.mapsService.reverseGeocode(parseFloat(lat), parseFloat(lng));
  }

  @Get('clusters')
  async getClusters(
    @Query('swLat') swLat: string,
    @Query('swLng') swLng: string,
    @Query('neLat') neLat: string,
    @Query('neLng') neLng: string,
    @Query('zoom') zoom?: string,
    @Query('type') type?: string,
  ) {
    return this.mapsService.getClusters({
      southWest: { lat: parseFloat(swLat), lng: parseFloat(swLng) },
      northEast: { lat: parseFloat(neLat), lng: parseFloat(neLng) },
      zoom: zoom ? parseInt(zoom) : 10,
      type,
    });
  }

  @Get('route')
  async estimateRoute(
    @Query('fromLat') fromLat: string,
    @Query('fromLng') fromLng: string,
    @Query('toLat') toLat: string,
    @Query('toLng') toLng: string,
  ) {
    return this.mapsService.estimateRoute({
      fromLat: parseFloat(fromLat),
      fromLng: parseFloat(fromLng),
      toLat: parseFloat(toLat),
      toLng: parseFloat(toLng),
    });
  }

  @Get('entity/:type/:id')
  async getEntityLocation(
    @Param('type') type: string,
    @Param('id') id: string,
  ) {
    return this.mapsService.getEntityLocation(type, id);
  }
}
