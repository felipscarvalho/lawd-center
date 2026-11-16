import sharp from 'sharp'
import BusinessRuleException from '#exceptions/administration/business_rule_exception'

export interface CompressedImage {
  buffer: Buffer
  extension: 'webp'
  contentType: 'image/webp'
}

/**
 * Compressão de imagens enviadas pelos usuários, reutilizável por qualquer módulo.
 * Sempre gera WebP e remove os metadados (EXIF pode ter localização e dados do aparelho).
 */
export default class ImageCompressionService {
  /** Foto de perfil: recorte quadrado centralizado, 512×512, WebP qualidade 80 */
  async compressAvatar(sourcePath: string): Promise<CompressedImage> {
    try {
      const buffer = await sharp(sourcePath)
        // Aplica a rotação do EXIF antes de descartá-lo, para a foto não ficar deitada
        .rotate()
        .resize(512, 512, { fit: 'cover' })
        .webp({ quality: 80 })
        .toBuffer()

      return { buffer, extension: 'webp', contentType: 'image/webp' }
    } catch {
      throw new BusinessRuleException(
        'Não foi possível processar a imagem enviada',
        'E_INVALID_IMAGE'
      )
    }
  }
}
