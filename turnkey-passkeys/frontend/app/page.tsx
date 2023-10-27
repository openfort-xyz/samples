import { AuthWidget } from "@/components/AuthWidget";
import { Footer } from "@/components/Footer";
import Image from "next/image";

export default async function Home() {
  return (
    <main className="w-full min-h-screen grid grid-cols-5">
      <div className="hidden lg:block lg:visible lg:col-span-2 bg-gray-700 flex-none relative">
        <Image
          className={`inline-block invert my-12 mx-8`}
          src="/turnkey_logo_black.svg"
          alt="->"
          width={110}
          height={30}
          priority
        />
        <Image
          className={`inline-block invert my-12 mx-8`}
          src="/openfort_logo_black.svg"
          alt="->"
          width={110}
          height={30}
          priority
        />
        <div className="absolute bottom-0 left-0 w-full h-full overflow-hidden">
          <div className="gradient-orange"></div>
        </div>
      </div>
      <div className="col-span-5 lg:col-span-3 p-8">
        <div className="flex flex-col min-h-screen">
          <div className="grid grid-cols-3 flex-none mb-2">
            <div className="col-span-2 mt-4 space-x-8">
              <Image
                className={`inline-block lg:invert`}
                src="/turnkey_logo_black.svg"
                alt="Turnkey"
                width={110}
                height={30}
                priority
              />
              <Image
                className={`inline-block lg:invert`}
                src="/openfort_logo_black.svg"
                alt="Openfort"
                width={110}
                height={30}
                priority
              />
            </div>

            <div className="col-span-1">
              <AuthWidget></AuthWidget>
            </div>
          </div>
          <h1 className="favorit text-5xl mt-8 lg:mt-2">
            Passkeys & Smart Wallet
          </h1>
          <p className="mt-8 mb-8 lg:mb-2">
            Using Turnkey&apos;s flexible infrastructure and Openfort&apos;s
            smart wallets, you can programmatically create and manage
            non-custodial smart wallets for your end users. This demo shows how
            users can use passkeys to create a testnet Polygon address and send
            a transaction.
          </p>

          <div className="mb-32 grid text-center lg:mb-0 lg:mt-8 lg:grid-cols-3 lg:text-left grow">
            <a
              href="https://docs.turnkey.com/getting-started/quickstart"
              className="group h-fit rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-zinc-200"
              target="_blank"
              rel="noopener noreferrer"
            >
              <h2 className={`mb-3 text-2xl favorit`}>
                Non-Custodial{" "}
                <Image
                  className={`inline-block align-bottom transition-transform group-hover:translate-x-1 group-hover:-translate-y-1`}
                  src="/arrow.svg"
                  alt="->"
                  width={30}
                  height={30}
                  priority
                />
              </h2>
              <p className={`m-0 mx-auto max-w-[40ch] text-sm opacity-75`}>
                Only you can access your keys. Checkout our API-reference for
                more details.
              </p>
            </a>

            <a
              href="https://fidoalliance.org/passkeys/"
              className="group h-fit rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-zinc-200"
              target="_blank"
              rel="noopener noreferrer"
            >
              <h2 className={`mb-3 text-2xl favorit`}>
                Passwordless{" "}
                <Image
                  className={`inline-block align-bottom transition-transform group-hover:translate-x-1 group-hover:-translate-y-1`}
                  src="/arrow.svg"
                  alt="->"
                  width={30}
                  height={30}
                  priority
                />
              </h2>
              <p className={`m-0 mx-auto max-w-[40ch] text-sm opacity-75`}>
                We use Passkeys to offer the best user experience and security
                in one. Learn more.
              </p>
            </a>

            <a
              href="https://github.com/openfort-xyz/samples/tree/main/turnkey-passkeys"
              className="group h-fit rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-zinc-200"
              target="_blank"
              rel="noopener noreferrer"
            >
              <h2 className={`mb-3 text-2xl favorit`}>
                Open-source{" "}
                <Image
                  className={`inline-block align-bottom transition-transform group-hover:translate-x-1 group-hover:-translate-y-1`}
                  src="/arrow.svg"
                  alt="->"
                  width={30}
                  height={30}
                  priority
                />
              </h2>
              <p className={`m-0 mx-auto max-w-[40ch] text-sm opacity-75`}>
                Curious about how this is built? Check out the code for
                yourself!
              </p>
            </a>
          </div>
          <Footer></Footer>
        </div>
      </div>
    </main>
  );
}
