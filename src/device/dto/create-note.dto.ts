import { IsString, IsNotEmpty } from 'class-validator';

export class CreateNoteDto {
  @IsString()
  @IsNotEmpty()
  authorId!: string;

  @IsString()
  @IsNotEmpty()
  content!: string;
}
