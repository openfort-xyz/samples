import { useAccount, useDisconnect } from "wagmi";
import { useAuth, signOut } from "../../lib/authContext";
import Link from "next/link";

export default function Header(props: any) {
  const { user, loading } = useAuth();
  const { disconnect } = useDisconnect();
  const { isConnected } = useAccount();
  return (
    <div className="flex h-full flex-row">
      <div className="flex-1 my-auto">
        <Link href="/">
          <button>Home</button>
        </Link>
      </div>

      <div className="m-auto space-x-2">
        {!user && !loading ? (
          <>
            <Link passHref href="/signup">
              <button className="m-auto underline"> Signup</button>
            </Link>

            <Link passHref href="/signin">
              <button className="m-auto underline"> Signin</button>
            </Link>
          </>
        ) : null}
        {user ? (
          <>
            <Link href="/privatessr">
              <button className="underline"> PrivateSSR</button>
            </Link>

            <Link href="/private">
              <button className="underline"> Private</button>
            </Link>

            <button
              className="underline"
              onClick={() => {
                if (isConnected) disconnect();
                signOut();
              }}
            >
              Signout
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}
