import { useEffect, useRef } from "react"
import { useLocale } from "@/i18n/use-locale"
import { useTheme } from "@/theme/use-theme"
import { loadTwitterWidgets } from "./widgets-loader"

interface TweetEmbedProps {
  tweetId: string
  username: string
}

export function TweetEmbed({ tweetId, username }: TweetEmbedProps) {
  const { resolvedTheme } = useTheme()
  const { locale } = useLocale()
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = containerRef.current as HTMLDivElement

    const url = `https://twitter.com/${username}/status/${tweetId}`
    node.innerHTML = `<blockquote class="twitter-tweet" data-theme="${resolvedTheme}" data-lang="${locale}"><a href="${url}">${url}</a></blockquote>`

    let cancelled = false
    loadTwitterWidgets()
      .then((twttr) => {
        if (cancelled) return
        twttr.widgets.load(node)
      })
      .catch(() => {
        // ignore: a failed widgets.js fetch leaves the blockquote fallback
      })

    return () => {
      cancelled = true
      node.innerHTML = ""
    }
  }, [tweetId, username, resolvedTheme, locale])

  return (
    <div
      ref={containerRef}
      data-testid="tweet-embed"
      data-tweet-id={tweetId}
      className="min-h-[180px]"
    />
  )
}
