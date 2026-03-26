"use server";

import { submitChangeRequest as submitChangeRequestFn } from "./changes";

export async function submitChange(payload) {
  return submitChangeRequestFn(payload);
}
