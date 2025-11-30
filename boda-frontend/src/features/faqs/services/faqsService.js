// src/features/faqs/services/faqsService.js
import { USE_FAKE_API } from "../../../shared/config/apiMode";
import { getFaqsFake } from "./faqsFakeService";
import { getFaqsApi } from "./faqsApiService";

export function obtenerFaqs() {
  if (USE_FAKE_API) {
    return getFaqsFake();
  }
  return getFaqsApi();
}
