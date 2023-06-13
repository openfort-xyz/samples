import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import OAuthButton from "../components/OAuthButton";
import CollectButton from "@/components/CollectButton";
import InventoryComponent from "@/components/InventoryComponent";

const Home: React.FC = () => {
  const router = useRouter();
  const [profile, setProfile] = useState<any | null>(null);

  useEffect(() => {
    async function fetchProfile(token: string | null) {
      if (!token) {
        return;
      }

      const response = await fetch(process.env.NEXT_PUBLIC_ECOSYSTEM_BACKEND_URL + "auth/profile", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setProfile(data);
    }

    let token = router.query.token as string | null;

    if (token) {
      localStorage.setItem("jwtToken", token);
    } else {
      token = localStorage.getItem("jwtToken");
    }

    fetchProfile(token);
  }, [router.query.token]);


  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <div className="flex w-96 flex-row mt-6">
        {profile ? (
          <div className="w-full">
            <div className='flex'>
              <p className='flex-1'>{profile.email}</p>
              <button
                className="underline text-blue-500"
                onClick={() => {
                  localStorage.removeItem("jwtToken");
                  router.reload();
                }}
              >
                Log out
              </button>
            </div>
            <br />
            <CollectButton />
            <br />
            <InventoryComponent />
          </div>
        ) : (
          <OAuthButton popup={true} />
        )}
      </div>
    </div>
  );
};

export default Home;
