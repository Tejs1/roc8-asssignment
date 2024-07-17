import Link from "next/link";

export function Header() {
  return (
    <header>
      <nav>
        <Link href="/">Home</Link>
        <Link href="/signup">Sign Up</Link>
        <Link href="/login">Login</Link>
        <Link href="/categories">Categories</Link>
      </nav>
    </header>
  );
}
