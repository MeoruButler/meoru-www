import type { Locale } from "../config"
import { en, type Messages } from "./en"
import { ko } from "./ko"

export const messages: Record<Locale, Messages> = { en, ko }
export type { Messages }
