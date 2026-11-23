import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import SelectionSubscriberService from '#services/recruitment/selection_subscriber_service'
import SelectionSubscriberTransformer from '#transformers/recruitment/selection_subscriber_transformer'
import { subscribeToSelectionValidator } from '#validators/recruitment/selection_subscriber'

@inject()
export default class SelectionSubscribersController {
  constructor(protected selectionSubscriberService: SelectionSubscriberService) {}

  async store({ request, response, serialize }: HttpContext) {
    const payload = await request.validateUsing(subscribeToSelectionValidator)

    const subscriber = await this.selectionSubscriberService.subscribe(payload)

    return response.created(await serialize(SelectionSubscriberTransformer.transform(subscriber)))
  }
}
