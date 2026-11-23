import app from '@adonisjs/core/services/app'
import db from '@adonisjs/lucid/services/db'
import { sourceFiles } from '@adonisjs/lucid/utils'
import { DateTime } from 'luxon'
import type { FileNode } from '@adonisjs/lucid/types/database'
import type { SeederConstructorContract } from '@adonisjs/lucid/types/seeder'
import type { SeederRunResult } from '#dtos/administration/seeder'

/** Tabela com os seeders já executados (criada pela migration create_adonis_seeders_table) */
const registryTable = 'adonis_seeders'

/**
 * Seeders com registro, como as migrations: cada seeder roda uma única vez por banco. Os arquivos
 * e a ordem são os mesmos do `db:seed` (pastas de `seeders.paths` em config/database.ts).
 */
export default class SeederRegistryService {
  /** Roda, em ordem, os seeders ainda não registrados; para no primeiro que falhar */
  async runPending(): Promise<SeederRunResult[]> {
    const [files, ran] = await Promise.all([this.files(), this.ranNames()])
    const results: SeederRunResult[] = []

    for (const file of files.filter((item) => !ran.has(item.name))) {
      const result = await this.run(file)
      results.push(result)

      if (result.status === 'failed') break
    }

    return results
  }

  /** Nomes dos seeders já executados neste banco */
  async ranNames(): Promise<Set<string>> {
    const rows = await db.from(registryTable).select('name')

    return new Set(rows.map((row) => row.name as string))
  }

  /**
   * Executa um seeder e registra. Seeders de outro ambiente (ex.: os de demonstração fora do
   * desenvolvimento) são ignorados sem registro, para poderem rodar se o ambiente mudar.
   */
  private async run(file: FileNode<unknown>): Promise<SeederRunResult> {
    const Seeder = (await file.getSource()) as SeederConstructorContract

    if (Seeder.environment && !Seeder.environment.includes(app.nodeEnvironment)) {
      return { name: file.name, status: 'ignored' }
    }

    try {
      await new Seeder(db.connection()).run()
    } catch (error) {
      return { name: file.name, status: 'failed', error }
    }

    await db.table(registryTable).insert({ name: file.name, ran_at: DateTime.now().toSQL() })

    return { name: file.name, status: 'completed' }
  }

  /** Arquivos de seeder das pastas registradas, na ordem do db:seed */
  private async files(): Promise<FileNode<unknown>[]> {
    const config = db.getRawConnection(db.primaryConnectionName)!.config
    const paths = config.seeders?.paths ?? ['./database/seeders']
    const naturalSort = config.seeders?.naturalSort ?? false

    const directories = await Promise.all(
      paths.map((path) => sourceFiles(app.appRoot, path, naturalSort))
    )

    return directories.flatMap((directory) => directory.files)
  }
}
