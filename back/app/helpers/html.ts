const htmlEntities: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

/** Escapa texto para entrar em HTML montado à mão (ex.: corpo de e-mails) */
export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => htmlEntities[char])
}
