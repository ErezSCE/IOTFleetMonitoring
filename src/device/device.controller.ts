import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { DeviceService } from './device.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { Device } from './device.entity';

@Controller('devices')
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}

  @Post()
  async create(@Body() createDto: CreateDeviceDto): Promise<Device> {
    return this.deviceService.create(createDto);
  }

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: keyof Device,
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
    @Query('name') nameFilter?: string,
    @Query('isActive') isActive?: string,
  ): Promise<any> {
    const parsedPage = page ? parseInt(page, 10) : undefined;
    const parsedLimit = limit ? parseInt(limit, 10) : undefined;
    const parsedIsActive = isActive !== undefined ? isActive === 'true' : undefined;
    const result = await this.deviceService.findAllPaginated({
      page: parsedPage,
      limit: parsedLimit,
      sortBy,
      sortOrder,
      nameFilter,
      isActive: parsedIsActive,
    });
    return result;
  }
}
