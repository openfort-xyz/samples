import {  useState } from "react";

export default function CollectButton() {
    const [collectLoading, setCollectLoading] = useState(false);

    const handleCollectButtonClick = async () => {
        try {
            setCollectLoading(true);
            const collectResponse = await fetch(process.env.NEXT_PUBLIC_ECOSYSTEM_BACKEND_URL + "auth/mint", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
            },
            });
            const collectResponseJSON = await collectResponse.json();
            console.log("success:", collectResponseJSON.data);
            alert("Action performed successfully");
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setCollectLoading(false);
        }
    };

  return (
    <button
        className="underline text-blue-500"
        disabled={collectLoading}
        onClick={handleCollectButtonClick}
    >
    {collectLoading ? "Collecting..." : "Collect item"}
    </button>
  );
}
