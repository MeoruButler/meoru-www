import { notFound } from 'next/navigation';

/** Any path below a locale that is not a real route renders the localized not-found page. */
export default function CatchAllPage() {
  notFound();
}
