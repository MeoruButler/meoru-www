import { createFileRoute } from "@tanstack/react-router"
import { TweetEmbed } from "@/components/twitter/tweet-embed"
import { useT } from "@/i18n/use-locale"

export const Route = createFileRoute("/$locale/posts")({
  component: LocalePosts,
})

const POSTS_TWEETS: ReadonlyArray<{ tweetId: string; username: string }> = [
  { tweetId: "2006194214783312187", username: "Meoru_butler" },
  { tweetId: "2049352912539926895", username: "Meoru_butler" },
]

export function LocalePosts() {
  const t = useT()
  return (
    <main className="container mx-auto px-4 py-10">
      <section className="mb-10 max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight">
          {t.postsPage.title}
        </h1>
        <p className="mt-3 text-base text-muted-foreground">
          {t.postsPage.description}
        </p>
      </section>
      <section className="grid gap-6 md:grid-cols-2">
        {POSTS_TWEETS.map((tweet) => (
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
