import SelectionSubscriber from '#models/recruitment/selection_subscriber'
import type { SubscribeToSelectionInput } from '#dtos/recruitment/selection_subscriber'

export default class SelectionSubscriberService {
  /**
   * Inscreve o e-mail no aviso do processo seletivo. Quem já está inscrito continua com a inscrição
   * original: repetir o pedido não é erro nem revela se o e-mail já estava na lista.
   */
  async subscribe(input: SubscribeToSelectionInput): Promise<SelectionSubscriber> {
    const email = input.email.toLowerCase()

    return SelectionSubscriber.firstOrCreate({ email })
  }
}
