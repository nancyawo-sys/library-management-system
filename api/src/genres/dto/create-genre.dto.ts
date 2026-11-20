import { IsString, IsNotEmpty, IsOptional, Matches } from "class-validator";

export class CreateGenreDto {
  @IsString() @IsNotEmpty() name: string;

  // Optional: if omitted, the service builds it from the name ("Science Fiction" -> "science-fiction")
  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: "slug must be lowercase letters, numbers and hyphens only",
  })
  slug?: string;
}
