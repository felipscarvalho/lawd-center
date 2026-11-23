import { apiPost } from "@/lib/api";
import type { SelectionSubscriber, SubscribeToSelectionPayload } from "@/types/recruitment";

/** Inscreve o e-mail no aviso do processo seletivo; repetir a inscrição não é erro */
export async function subscribeToSelection(payload: SubscribeToSelectionPayload): Promise<SelectionSubscriber> {
  return apiPost<SelectionSubscriber>("/recruitment/selection-subscribers", payload);
}
