import { createFileRoute } from "@tanstack/react-router"
import { TweetEmbed } from "@/components/twitter/tweet-embed"
import { useT } from "@/i18n/use-locale"

export const Route = createFileRoute("/$locale/")({
  component: LocaleHome,
})

const HERO_TWEETS: ReadonlyArray<{ tweetId: string; username: string }> = [
  { tweetId: "1801894734043062273", username: "Meoru_butler" },
  { tweetId: "1738491823654617173", username: "Meoru_butler" },
]

export function LocaleHome() {
  const t = useT()
  return (
    <main className="container mx-auto px-4 py-10">
      <section className="mb-12 max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight">
          {t.hero.title}
        </h1>
        <p className="text-muted-foreground mt-3 text-base">
          {t.hero.subtitle}
        </p>
      </section>
      <section className="grid gap-6 md:grid-cols-2">
        {HERO_TWEETS.map((tweet) => (
          <TweetEmbed
            key={tweet.tweetId}
            tweetId={tweet.tweetId}
            username={tweet.username}
          />
        ))}
      </section>
    </main>
  )
}
