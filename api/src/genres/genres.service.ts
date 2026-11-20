import { Injectable, NotFoundException, ConflictException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateGenreDto } from "./dto/create-genre.dto";
import { UpdateGenreDto } from "./dto/update-genre.dto";

const slugify = (text: string) =>
  text.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

@Injectable()
export class GenresService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateGenreDto) {
    const slug = dto.slug ?? slugify(dto.name);
    const exists = await this.prisma.genre.findFirst({
      where: { OR: [{ name: dto.name }, { slug }] },
    });
    if (exists) throw new ConflictException("A genre with that name or slug already exists");
    return this.prisma.genre.create({ data: { name: dto.name, slug } });
  }

  findAll() {
    return this.prisma.genre.findMany({ orderBy: { name: "asc" } });
  }

  async findOne(id: number) {
    const genre = await this.prisma.genre.findUnique({ where: { id } });
    if (!genre) throw new NotFoundException(`Genre ${id} not found`);
    return genre;
  }

  async update(id: number, dto: UpdateGenreDto) {
    await this.findOne(id);
    const clashes = [
      ...(dto.name ? [{ name: dto.name }] : []),
      ...(dto.slug ? [{ slug: dto.slug }] : []),
    ];
    if (clashes.length) {
      const exists = await this.prisma.genre.findFirst({
        where: { OR: clashes, NOT: { id } },
      });
      if (exists) throw new ConflictException("A genre with that name or slug already exists");
    }
    return this.prisma.genre.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    const bookCount = await this.prisma.book.count({ where: { genreId: id } });
    if (bookCount > 0) {
      throw new ConflictException(`Genre ${id} still has ${bookCount} book(s)`);
    }
    return this.prisma.genre.delete({ where: { id } });
  }
}
