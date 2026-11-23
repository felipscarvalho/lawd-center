/** Quantidade com a palavra no singular ou no plural (ex.: 1 pessoa, 3 pessoas) */
export const pluralize = (count: number, singular: string, plural: string) =>
  `${count} ${count === 1 ? singular : plural}`;
