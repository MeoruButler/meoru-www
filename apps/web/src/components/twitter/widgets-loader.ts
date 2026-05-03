export interface TwitterWidgets {
  widgets: {
    load: (target?: Element | null) => void
  }
}

declare global {
  interface Window {
    twttr?: TwitterWidgets
  }
}

export const TWITTER_WIDGETS_SRC = "https://platform.twitter.com/widgets.js"
export const TWITTER_WIDGETS_SCRIPT_ID = "twitter-widgets"

let pending: Promise<TwitterWidgets> | null = null

export function loadTwitterWidgets(): Promise<TwitterWidgets> {
  /* v8 ignore next 3 */
  if (typeof window === "undefined") {
    return Promise.reject(new Error("widgets.js requires a browser"))
  }
  if (window.twttr) {
    return Promise.resolve(window.twttr)
  }
  if (pending) {
    return pending
  }

  pending = new Promise<TwitterWidgets>((resolve, reject) => {
    const existing = document.getElementById(
      TWITTER_WIDGETS_SCRIPT_ID
    ) as HTMLScriptElement | null
    const script = existing ?? document.createElement("script")

    const handleLoad = () => {
      if (window.twttr) {
        resolve(window.twttr)
      } else {
        pending = null
        reject(new Error("twttr is not available after script load"))
      }
    }
    const handleError = () => {
      pending = null
      reject(new Error("Failed to load Twitter widgets script"))
    }

    script.addEventListener("load", handleLoad)
    script.addEventListener("error", handleError)

    if (!existing) {
      script.id = TWITTER_WIDGETS_SCRIPT_ID
      script.async = true
      script.src = TWITTER_WIDGETS_SRC
      document.head.appendChild(script)
    }
  })

  return pending
}

export function resetTwitterWidgetsForTesting(): void {
  pending = null
  document.getElementById(TWITTER_WIDGETS_SCRIPT_ID)?.remove()
  delete window.twttr
}
