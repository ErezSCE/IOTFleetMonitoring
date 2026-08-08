import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Device } from './device.entity';
import { CreateDeviceDto } from './dto/create-device.dto';

@Injectable()
export class DeviceService {
  constructor(
    @InjectRepository(Device)
    private readonly deviceRepository: Repository<Device>,
  ) {}

  async create(createDto: CreateDeviceDto): Promise<Device> {
    const device = this.deviceRepository.create(createDto);
    return this.deviceRepository.save(device);
  }

  async findAll(): Promise<Device[]> {
    return this.deviceRepository.find();
  }

  async update(id: string, updateDto: any): Promise<Device> {
    const result = await this.deviceRepository.update(id, updateDto);
    if (result.affected === 0) {
      throw new NotFoundException(`Device with id ${id} not found`);
    }
    return this.deviceRepository.findOne({ where: { id } });
  }
}

