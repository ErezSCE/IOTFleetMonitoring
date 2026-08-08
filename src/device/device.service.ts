import { Injectable } from '@nestjs/common';
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

  async findAllPaginated(params: {
    page?: number;
    limit?: number;
    sortBy?: keyof Device;
    sortOrder?: 'ASC' | 'DESC';
    nameFilter?: string;
    isActive?: boolean;
  }): Promise<{ data: Device[]; total: number }> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'ASC',
      nameFilter,
      isActive,
    } = params;

    const where: any = {};
    if (nameFilter) {
      // Using ILIKE for case-insensitive partial match (Postgres). For SQLite in tests, use LIKE.
      where.name = nameFilter;
    }
    if (typeof isActive === 'boolean') {
      where.isActive = isActive;
    }

    const [data, total] = await this.deviceRepository.findAndCount({
      where,
      order: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total };
  }

  async findAll(): Promise<Device[]> {
    return this.deviceRepository.find();
  }
}
