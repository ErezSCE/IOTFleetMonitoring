import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, IsUUID } from 'class-validator';
import { ConditionOperator } from '../alert-rule.entity';

export class CreateAlertRuleDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @IsNotEmpty()
  metric!: string; // corresponds to condition.field

  @IsEnum(ConditionOperator)
  operator!: ConditionOperator; // corresponds to condition.operator

  @IsNumber()
  threshold!: number; // corresponds to condition.value

  @IsOptional()
  @IsString()
  severity?: string;

  @IsOptional()
  @IsUUID()
  deviceId?: string;
}
