import {
  Injectable, NotFoundException, ConflictException, BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateBookDto } from "./dto/create-book.dto";
import { UpdateBookDto } from "./dto/update-book.dto";

@Injectable()
export class BooksService {
  constructor(private prisma: PrismaService) {}

  async findAll(genreId?: string, search?: string, page = 1, limit = 10) {
    const where = {
      ...(genreId && { genreId: Number(genreId) }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" as const } },
          { author: { contains: search, mode: "insensitive" as const } },
        ],
      }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.book.findMany({
        where,
        include: { genre: true },
        orderBy: { id: "asc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.book.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: number) {
    const book = await this.prisma.book.findUnique({
      where: { id },
      include: { genre: true },
    });
    if (!book) throw new NotFoundException(`Book ${id} not found`);
    return book;
  }

  async create(dto: CreateBookDto) {
    try {
      // A brand-new book has every copy available.
      return await this.prisma.book.create({
        data: { ...dto, availableCopies: dto.totalCopies },
      });
    } catch (e) {
      this.handlePrismaError(e);
    }
  }

  async update(id: number, dto: UpdateBookDto) {
    const book = await this.findOne(id);
    const data: UpdateBookDto & { availableCopies?: number } = { ...dto };
    if (dto.totalCopies !== undefined) {
      // Keep availableCopies in step with the change in total copies (never below 0).
      data.availableCopies = Math.max(
        0,
        book.availableCopies + dto.totalCopies - book.totalCopies,
      );
    }
    try {
      return await this.prisma.book.update({ where: { id }, data });
    } catch (e) {
      this.handlePrismaError(e);
    }
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.book.delete({ where: { id } });
  }

  private handlePrismaError(e: any): never {
    if (e?.code === "P2002") throw new ConflictException("A book with that ISBN already exists");
    if (e?.code === "P2003") throw new BadRequestException("genreId does not match an existing genre");
    throw e;
  }
}
