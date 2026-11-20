import { IsString, IsNotEmpty, IsOptional, Matches } from "class-validator";

export class UpdateGenreDto {
  @IsOptional() @IsString() @IsNotEmpty() name?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: "slug must be lowercase letters, numbers and hyphens only",
  })
  slug?: string;
}
