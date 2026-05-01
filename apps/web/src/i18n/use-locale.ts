import { useContext } from "react"
import {
  LocaleContext,
  type LocaleContextValue,
} from "./locale-provider"
import type { Messages } from "./messages"

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext)
  if (!ctx) {
    throw new Error("useLocale must be used within a LocaleProvider")
  }
  return ctx
}

export function useT(): Messages {
  return useLocale().messages
}
