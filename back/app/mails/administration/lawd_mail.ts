import app from '@adonisjs/core/services/app'
import { BaseMail } from '@adonisjs/mail'
import { escapeHtml } from '#helpers/html'

/** Conteúdo de um e-mail; todo texto é escapado aqui, então chega em texto puro */
export interface LawdMailContent {
  /** Resumo que os clientes de e-mail mostram ao lado do assunto, na caixa de entrada */
  preheader: string
  /** Rótulo pequeno acima do título (ex.: "Convite") */
  eyebrow: string
  title: string
  paragraphs: string[]
  action: { label: string; url: string }
  /** Avisos em letra menor no fim do card (validade do link, o que fazer se não esperava o e-mail) */
  footnotes?: string[]
  /** Por que a pessoa recebeu o e-mail, no rodapé */
  reason: string
}

/** Identificador da logo embutida no e-mail (anexo inline, aparece mesmo sem o front no ar) */
const logoCid = 'lawd-logo'

// Identidade visual da LAWD (front/styles/lawd-theme.css), em cores fixas: e-mail não lê variáveis CSS
const colors = {
  page: '#0b0912',
  card: '#15111f',
  border: '#3a2a5c',
  title: '#ffffff',
  text: '#cfc8dc',
  muted: '#8c84a0',
  brand: '#9f5fff',
  brandStrong: '#8b45fa',
  brandDark: '#7330d4',
  brandLight: '#b58dff',
  cyan: '#22d3ee',
  magenta: '#d946ef',
}

const displayFont = `'MuseoModerno', 'Trebuchet MS', Arial, sans-serif`
const monoFont = `'JetBrains Mono', ui-monospace, Menlo, Consolas, monospace`

/**
 * Base dos e-mails da LAWD: monta o layout (fundo escuro com os brilhos roxo, ciano e magenta da
 * aplicação, card de vidro escuro, logo e botão em pílula) e a versão em texto puro. O HTML usa
 * tabelas e estilos inline, que é o que Gmail e Outlook renderizam de forma confiável; fontes e
 * degradês aparecem onde o cliente suporta e caem para Arial e cor sólida nos outros.
 */
export default abstract class LawdMail extends BaseMail {
  protected compose(content: LawdMailContent) {
    this.message
      .embed(app.makePath('resources/mails/lawd_logo.png'), logoCid)
      .html(this.renderHtml(content))
      .text(this.renderText(content))
  }

  private renderText(content: LawdMailContent) {
    return [
      content.title,
      '',
      ...content.paragraphs.flatMap((paragraph) => [paragraph, '']),
      `${content.action.label}: ${content.action.url}`,
      '',
      ...(content.footnotes ?? []),
      '',
      '—',
      `Lawd Center · ${content.reason}`,
    ].join('\n')
  }

  private renderHtml(content: LawdMailContent) {
    const url = escapeHtml(content.action.url)

    const paragraphs = content.paragraphs
      .map(
        (paragraph) =>
          `<p style="margin:0 0 16px;font-size:16px;line-height:26px;color:${colors.text}">${escapeHtml(paragraph)}</p>`
      )
      .join('')

    const footnotes = (content.footnotes ?? [])
      .map(
        (note) =>
          `<p style="margin:0 0 8px;font-size:13px;line-height:20px;color:${colors.muted}">${escapeHtml(note)}</p>`
      )
      .join('')

    return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="dark" />
    <meta name="supported-color-schemes" content="dark" />
    <title>${escapeHtml(content.title)}</title>
    <link href="https://fonts.googleapis.com/css2?family=MuseoModerno:wght@400;600;700&family=JetBrains+Mono:wght@400&display=swap" rel="stylesheet" />
  </head>
  <body style="margin:0;padding:0;background:${colors.page};font-family:${displayFont};color:${colors.text}">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${colors.page}">${escapeHtml(content.preheader)}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="${colors.page}" style="background-color:${colors.page};background-image:radial-gradient(circle at 12% 0%, rgba(159,95,255,0.30), transparent 45%),radial-gradient(circle at 92% 18%, rgba(34,211,238,0.14), transparent 40%),radial-gradient(circle at 50% 100%, rgba(217,70,239,0.14), transparent 50%)">
      <tr>
        <td align="center" style="padding:40px 16px">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px">
            <tr>
              <td style="padding:0 8px 24px">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td valign="middle" style="padding-right:12px"><img src="cid:${logoCid}" width="36" height="33" alt="LAWD" style="display:block;border:0" /></td>
                    <td valign="middle" style="font-family:${displayFont};font-size:20px;font-weight:700;letter-spacing:-0.3px;color:${colors.title}">Lawd Center</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td bgcolor="${colors.card}" style="background-color:${colors.card};background-image:linear-gradient(135deg, rgba(159,95,255,0.14), rgba(34,211,238,0.03) 55%, rgba(255,255,255,0.02));border:1px solid ${colors.border};border-radius:20px;overflow:hidden;box-shadow:0 20px 60px rgba(88,28,135,0.45)">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td height="4" bgcolor="${colors.brand}" style="height:4px;line-height:4px;font-size:0;background-color:${colors.brand};background-image:linear-gradient(90deg, ${colors.brand}, ${colors.cyan} 55%, ${colors.magenta})">&nbsp;</td>
                  </tr>
                  <tr>
                    <td style="padding:36px 40px 8px">
                      <p style="margin:0 0 12px;font-family:${monoFont};font-size:12px;letter-spacing:2px;text-transform:uppercase;color:${colors.brandLight}">${escapeHtml(content.eyebrow)}</p>
                      <h1 style="margin:0 0 20px;font-family:${displayFont};font-size:30px;line-height:36px;font-weight:700;letter-spacing:-0.5px;color:${colors.title}">${escapeHtml(content.title)}</h1>
                      ${paragraphs}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:8px 40px 32px">
                      <table role="presentation" cellpadding="0" cellspacing="0">
                        <tr>
                          <td bgcolor="${colors.brandStrong}" style="border-radius:999px;background-color:${colors.brandStrong};background-image:linear-gradient(135deg, ${colors.brand}, ${colors.brandDark});box-shadow:0 8px 28px rgba(139,69,250,0.55)">
                            <a href="${url}" style="display:inline-block;padding:14px 32px;font-family:${displayFont};font-size:16px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:999px">${escapeHtml(content.action.label)} &rarr;</a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:16px 40px 36px">
                      ${footnotes}
                      <p style="margin:16px 0 6px;font-size:13px;line-height:20px;color:${colors.muted}">Se o botão não abrir, copie este endereço no navegador:</p>
                      <p style="margin:0;padding:12px 14px;border:1px dashed ${colors.border};border-radius:12px;background-color:rgba(159,95,255,0.08);font-family:${monoFont};font-size:12px;line-height:18px;word-break:break-all"><a href="${url}" style="color:${colors.brandLight};text-decoration:none">${url}</a></p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:28px 16px 0;font-size:12px;line-height:18px;color:${colors.muted}">
                <p style="margin:0 0 6px;font-family:${displayFont};font-weight:600;color:${colors.brandLight}">LAWD · Lawd Center</p>
                <p style="margin:0">${escapeHtml(content.reason)}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`
  }
}
