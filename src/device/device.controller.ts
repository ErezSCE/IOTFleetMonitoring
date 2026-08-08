import { Controller, Post, Body, Get, Patch, Param } from '@nestjs/common';
import { UpdateDeviceDto } from './dto/update-device.dto';
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

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateDto: UpdateDeviceDto): Promise<Device> {
    return this.deviceService.update(id, updateDto);
  }
}
