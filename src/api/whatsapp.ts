import { fetchApi } from "./http";
import {
  WhatsappQueryRequest,
  WhatsappQueryResponse,
} from "./types";

export async function queryWhatsappBot(
  payload: WhatsappQueryRequest,
): Promise<WhatsappQueryResponse> {
  return fetchApi<WhatsappQueryResponse>("/api/whatsapp/query", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
