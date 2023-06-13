import { CheckCircleIcon } from "@heroicons/react/20/solid";
import { useRouter } from "next/router";

function Success() {
  const router = useRouter();
  return (
    <div className="rounded-md flex bg-green-50 p-4">
      <div className="flex-1 flex">
        <div className="flex-shrink-0">
          <CheckCircleIcon
            className="h-5 w-5 text-green-400"
            aria-hidden="true"
          />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-green-800">
            You have been successfully authorized. You will return to your game
            soon
          </h3>
        </div>
      </div>
      <button
        className="underline text-sm text-gray-500"
        onClick={() => {
          localStorage.removeItem("jwtToken");
          router.push('/auth');
          router.reload();
        }}
      >
        Log out
      </button>
    </div>
  );
}

export default Success;
