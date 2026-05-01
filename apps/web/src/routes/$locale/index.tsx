import { createFileRoute } from "@tanstack/react-router"
import { ArrowUpRight } from "lucide-react"
import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { TweetEmbed } from "@/components/twitter/tweet-embed"
import { useT } from "@/i18n/use-locale"

export const Route = createFileRoute("/$locale/")({
  component: LocaleHome,
})

const HERO_TWEETS: ReadonlyArray<{ tweetId: string; username: string }> = [
  { tweetId: "2006194214783312187", username: "Meoru_butler" },
  { tweetId: "2049352912539926895", username: "Meoru_butler" },
]

export function LocaleHome() {
  const t = useT()
  return (
    <main className="container mx-auto px-4 py-10">
      <section className="mb-12 max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight">
          {t.hero.title}
        </h1>
        <p className="mt-3 text-base text-muted-foreground">
          {t.hero.subtitle}
        </p>
        <a
          href="https://x.com/Meoru_butler"
          target="_blank"
          rel="noopener noreferrer"
          className={cn(buttonVariants({ variant: "default" }), "mt-6")}
        >
          {t.hero.cta}
          <ArrowUpRight className="ms-1 h-4 w-4" aria-hidden="true" />
        </a>
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
