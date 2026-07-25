import { IsString, IsInt, IsOptional, IsArray, IsBoolean, IsNumber } from 'class-validator';

export class AttrField {
  @IsString()
  name: string;

  @IsString()
  type: 'text' | 'number' | 'select' | 'multiselect';

  @IsBoolean()
  required: boolean;

  @IsOptional()
  @IsArray()
  options?: string[];
}

export class CreateCategoryDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsNumber()
  parentId?: number;

  @IsOptional()
  @IsInt()
  level?: number;

  @IsOptional()
  @IsInt()
  sort?: number;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsArray()
  attrTemplate?: AttrField[];
}
