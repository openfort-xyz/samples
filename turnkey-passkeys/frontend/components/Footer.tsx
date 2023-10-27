"use client";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="m-8 grid-cols-3 text-center text-zinc-400 text-xs">
      <p>
        <Link
          className="underline"
          target="_blank"
          href="https://https://github.com/openfort-xyz/samples/turnkey-passkeys#legal-disclaimer"
        >
          Legal disclaimer
        </Link>
        .
      </p>
    </footer>
  );
}
