import { useRouter } from "next/router";
import { useEffect } from "react";

export default function OAuthButton({ popup = true }) {
  const router = useRouter();

  useEffect(() => {
    // Grab the current URL
    const url = new URL(window.location.href);

    // Extract the token if it exists
    const token = url.searchParams.get("token");

    if (token) {
      // Save the token
      sessionStorage.setItem("jwtToken", token);

      // Remove 'token' from url
      url.searchParams.delete("token");
      const newUrl = url.pathname;

      // Replace url in browser history
      window.history.replaceState({}, "", newUrl);
      router.reload();
    }
  }, [router]);

  const handleClick = () => {
    router.push(
      `${process.env.NEXT_PUBLIC_ECOSYSTEM_FRONTEND_URL}/auth/?game=1&redirect_uri=${window.location.href}`
    );
  };

  const handlePopUpClick = () => {
    const width = 400;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const url = `${process.env.NEXT_PUBLIC_ECOSYSTEM_FRONTEND_URL}/auth?game=1`;
    window.open(
      url,
      "_blank",
      `toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=${width}, height=${height}, top=${top}, left=${left}`
    );
    window.addEventListener("message", (event) => {
      // IMPORTANT: check the origin of the data!
      if (event.origin === process.env.NEXT_PUBLIC_ECOSYSTEM_FRONTEND_URL) {
        // The data was sent from your site.
        // Data sent with postMessage is stored in event.data:
        localStorage.setItem("jwtToken", event.data.token);
        router.reload();
      } else {
        // The data was NOT sent from your site!
        // Be careful! Do not use it. This else branch is
        // here just for clarity, you usually shouldn't need it.
        return;
      }
    });
  };

  return (
    <button
      onClick={popup ? handlePopUpClick : handleClick}
      className="bg-blue-700 hover:bg-blue-800 w-60 text-gray-100 hover:text-white shadow font-bold text-sm py-3 px-4 rounded flex justify-start items-center cursor-pointer"
    >
      <img
        className="mr-3 w-5 h-5"
        src={
          "https://cdn-icons-png.flaticon.com/512/896/896091.png"
        }
        alt={"Bouncy Logo"}
      />
      <span className="border-l border-blue-500 h-6 w-1 block"></span>
      <span className="pl-3">Continue with Bouncy</span>
    </button>
  );
}
