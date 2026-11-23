/** Resultado de um seeder rodado pelo registro (db:seed:pending) */
export interface SeederRunResult {
  /** Caminho do seeder sem extensão (ex.: database/seeders/administration/1_directorate_seeder) */
  name: string
  /** ignored: o seeder não vale para o ambiente atual (fica sem registro) */
  status: 'completed' | 'ignored' | 'failed'
  error?: unknown
}
