import { Controller, Post, Body, Get } from '@nestjs/common';
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
  async findAll(): Promise<Device[]> {
    return this.deviceService.findAll();
  }
}
