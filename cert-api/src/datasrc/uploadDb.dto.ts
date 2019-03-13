import { IsString, IsOptional, Length } from 'class-validator';

export class UploadDbDTO {
  @Length(1, 200)
  @IsString()
  title: string;
}
