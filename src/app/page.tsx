
import { redirect } from 'next/navigation';

export default function HomePage() {
  redirect('/dashboard');
  // This return is technically unreachable due to the redirect,
  // but Next.js App Router components should return JSX or null.
  return null;
}
