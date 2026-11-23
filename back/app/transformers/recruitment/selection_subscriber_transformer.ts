import { BaseTransformer } from '@adonisjs/core/transformers'
import type SelectionSubscriber from '#models/recruitment/selection_subscriber'

export default class SelectionSubscriberTransformer extends BaseTransformer<SelectionSubscriber> {
  toObject() {
    return {
      email: this.resource.email,
    }
  }
}
