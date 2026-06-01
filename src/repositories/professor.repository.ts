import { prisma } from '../lib/prisma';
import { UserRole, StatusUsuario } from '@prisma/client';
import {
  CriarProfessorDTO,
  AtualizarProfessorDTO,
  QueryParams,
} from '../types';

export class ProfessorRepository {
  private gerarRegistro(): string {
    const ano = new Date().getFullYear();
    const numero = Math.floor(Math.random() * 9999)
      .toString()
      .padStart(4, '0');

    return `PROF${ano}${numero}`;
  }

  async listarTodos(params?: QueryParams) {
    return prisma.professor.findMany({
      where: {
        ...(params?.status && {
          status: params.status,
        }),

        ...(params?.busca && {
          OR: [
            {
              nome: {
                contains: params.busca,
                mode: 'insensitive',
              },
            },
            {
              email: {
                contains: params.busca,
                mode: 'insensitive',
              },
            },
          ],
        }),
      },
    });
  }

  async buscarPorId(id: string) {
    return prisma.professor.findUnique({
      where: { id },
    });
  }

  async buscarPorEmail(email: string) {
    return prisma.professor.findUnique({
      where: { email },
    });
  }

  async buscarPorCpf(cpf: string) {
    return prisma.professor.findUnique({
      where: { cpf },
    });
  }

  async criar(dto: CriarProfessorDTO) {
    return prisma.professor.create({
      data: {
        ...dto,
        registro: this.gerarRegistro(),
        role: UserRole.PROFESSOR,
        status: StatusUsuario.ATIVO,
        disciplinas: dto.disciplinas ?? [],
      },
    });
  }

  async atualizar(id: string, dto: AtualizarProfessorDTO) {
    try {
      return await prisma.professor.update({
        where: { id },
        data: dto,
      });
    } catch {
      return null;
    }
  }

  async deletar(id: string): Promise<boolean> {
    try {
      await prisma.professor.delete({
        where: { id },
      });

      return true;
    } catch {
      return false;
    }
  }

  async contar(): Promise<number> {
    return prisma.professor.count();
  }
}

async criar(dto: CriarProfessorDTO) {
  const { disciplinas, ...dados } = dto;

  return prisma.professor.create({
    data: {
      ...dados,
      registro: this.gerarRegistro(),
      role: UserRole.PROFESSOR,
      status: StatusUsuario.ATIVO,

      disciplinas: {
        connect: disciplinas?.map((id) => ({ id })) ?? [],
      },
    },

    include: {
      disciplinas: true,
    },
  });
}

