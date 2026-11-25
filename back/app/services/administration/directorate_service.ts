import Directorate from '#models/administration/directorate'
import BusinessRuleException from '#exceptions/administration/business_rule_exception'
import type {
  CreateDirectorateInput,
  UpdateDirectorateInput,
} from '#dtos/administration/directorate'

export default class DirectorateService {
  /** Lista as diretorias com o núcleo institucional primeiro e as demais por nome */
  async list(): Promise<Directorate[]> {
    return Directorate.query()
      .orderByRaw("CASE WHEN kind = 'core' THEN 0 ELSE 1 END")
      .orderBy('name', 'asc')
  }

  async find(id: number): Promise<Directorate> {
    return Directorate.findOrFail(id)
  }

  async findByKey(key: string): Promise<Directorate | null> {
    return Directorate.findBy('key', key)
  }

  async create(input: CreateDirectorateInput): Promise<Directorate> {
    // Só pode existir um núcleo institucional (onde ficam presidente, vice, secretário-geral e conselheiros)
    if (input.kind === 'core' && (await Directorate.findBy('kind', 'core'))) {
      throw new BusinessRuleException(
        'Já existe um núcleo institucional cadastrado',
        'E_CORE_DIRECTORATE_EXISTS'
      )
    }

    return Directorate.create(input)
  }

  async update(id: number, input: UpdateDirectorateInput): Promise<Directorate> {
    const directorate = await Directorate.findOrFail(id)

    directorate.merge(input)
    await directorate.save()

    return directorate
  }

  /** Cria ou atualiza diretorias pela chave (usado pelo seeder) */
  async upsertMany(inputs: CreateDirectorateInput[]): Promise<Directorate[]> {
    return Directorate.updateOrCreateMany('key', inputs)
  }

  /** Cria só as diretorias cujas chaves ainda não existem, sem mexer nas que já existem (ex.: renomeadas) */
  async createMissing(inputs: CreateDirectorateInput[]): Promise<Directorate[]> {
    return Directorate.fetchOrCreateMany('key', inputs)
  }
}
