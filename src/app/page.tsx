import Link from "next/link";
import { Show, SignInButton } from "@clerk/nextjs";
import { PublicToolList } from "@/features/catalog/PublicToolList";

export default function LandingPage() {
  return (
    <main className="landing">
      <p className="brand">LendLoop</p>
      <h1>Borrow what you need. Lend what you don&apos;t.</h1>
      <p className="lead">
        A lending board for your street. List the drill that sits in a drawer, borrow the tent you
        need twice a year, and let reminders handle the awkward part.
      </p>
      <Show when="signed-out">
        <SignInButton mode="modal">
          <button className="btn primary">Sign in to lend or borrow</button>
        </SignInButton>
      </Show>
      <Show when="signed-in">
        <Link className="btn primary" href="/board">Open the board</Link>
      </Show>
      <section className="section">
        <h2>Available right now</h2>
        <PublicToolList />
      </section>
    </main>
  );
}
