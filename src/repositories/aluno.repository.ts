import { PrismaClient, UserRole, StatusUsuario } from '@prisma/client';
import { CriarAlunoDTO, AtualizarAlunoDTO, QueryParams } from '../types';

const prisma = new PrismaClient();

export class AlunoRepository {
  private gerarMatricula(): string {
    const ano = new Date().getFullYear();
    const numero = Math.floor(Math.random() * 9999)
      .toString()
      .padStart(4, '0');

    return `ALU${ano}${numero}`;
  }

  async listarTodos(params?: QueryParams) {
    return prisma.aluno.findMany({
      where: {
        ...(params?.status && { status: params.status }),

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
    return prisma.aluno.findUnique({
      where: { id },
    });
  }

  async buscarPorEmail(email: string) {
    return prisma.aluno.findUnique({
      where: { email },
    });
  }

  async buscarPorCpf(cpf: string) {
    return prisma.aluno.findUnique({
      where: { cpf },
    });
  }

  async criar(dto: CriarAlunoDTO) {
    return prisma.aluno.create({
      data: {
        ...dto,
        matricula: this.gerarMatricula(),
        role: UserRole.ALUNO,
        status: StatusUsuario.ATIVO,
        turmas: dto.turmas ?? [],
      },
    });
  }

  async atualizar(id: string, dto: AtualizarAlunoDTO) {
    try {
      return await prisma.aluno.update({
        where: { id },
        data: dto,
      });
    } catch {
      return null;
    }
  }

  async deletar(id: string): Promise<boolean> {
    try {
      await prisma.aluno.delete({
        where: { id },
      });

      return true;
    } catch {
      return false;
    }
  }

  async contar(): Promise<number> {
    return prisma.aluno.count();
  }
}



