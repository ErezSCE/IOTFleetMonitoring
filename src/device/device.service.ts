import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateNoteDto } from './dto/create-note.dto';
import { Note } from './note.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Device } from './device.entity';
import { CreateDeviceDto } from './dto/create-device.dto';

@Injectable()
export class DeviceService {
  constructor(
    @InjectRepository(Device)
    private readonly deviceRepository: Repository<Device>,
    @InjectRepository(Note)
    private readonly noteRepository: Repository<Note>,
  ) {}

  async addNote(deviceId: string, createNoteDto: CreateNoteDto): Promise<Note> {
    // Ensure device exists
    const device = await this.deviceRepository.findOne({ where: { id: deviceId } });
    if (!device) {
      throw new NotFoundException(`Device with id ${deviceId} not found`);
    }
    const note = this.noteRepository.create({
      device,
      deviceId,
      authorId: createNoteDto.authorId,
      content: createNoteDto.content,
    });
    return this.noteRepository.save(note);
  }

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
    const device = await this.deviceRepository.findOne({ where: { id } });
    if (!device) {
      throw new NotFoundException(`Device with id ${id} not found`);
    }
    return device as Device;
  }
}

