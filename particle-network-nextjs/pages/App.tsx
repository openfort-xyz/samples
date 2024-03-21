import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { CollectButton } from "../components/CollectButton";
import { RegisterButton } from "../components/RegisterSessionButton";
import { ParticleNetwork, UserInfo } from "@particle-network/auth";
import { ParticleProvider } from "@particle-network/provider";

import "react-toastify/dist/ReactToastify.css";

// You might need to adjust these types based on the actual API and structures you're working with
interface PlayerInfo {
  id: string;
}

function App() {
  const [particle, setParticle] = useState<ParticleNetwork | null>(null);
  const [provider, setProvider] = useState<ParticleProvider | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState<string | false>(false);

  useEffect(() => {
    const init = async () => {
      const p = new ParticleNetwork({
        projectId: process.env.NEXT_PUBLIC_PROJECT_ID!,
        clientKey: process.env.NEXT_PUBLIC_CLIENT_KEY!,
        appId: process.env.NEXT_PUBLIC_APP_ID!,
      });
      setParticle(p);
    };
    init();
  }, []);

  const login = async () => {
    if (!particle) return toast.error("Not initialized");
    await particle.auth.login({ preferredAuthType: "google" });
    setProvider(new ParticleProvider(particle.auth));
    validateToken();
  };

  const validateToken = async () => {
    if (!particle) return;
    const userInfo: UserInfo | null = particle.auth.getUserInfo();
    if (!userInfo) return toast.error("User info not found");
    const toastId = toast.loading("Validating...");

    const res = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userInfo.token}`,
      },
      body: JSON.stringify({ user_uuid: userInfo.uuid }),
    });

    toast.dismiss(toastId);

    if (res.status === 200) {
      const data: { player: PlayerInfo } = await res.json();
      setPlayerId(data.player.id);
      toast.success("JWT Verified");
    } else {
      setProvider(null);
      toast.error("JWT Validation Failed");
    }
  };

  const uiConsole = (...args: any[]): void => {
    const content = JSON.stringify(args.length > 1 ? args : args[0], null, 2);
    setShowPopup(content);
  };

  const logout = async () => {
    if (!particle) return;
    setProvider(null);
  };
  return (
    <div className="App">
      <div className="logos-section">
        <a target="_blank" href="https://particle.network" rel="noreferrer">
          <img
            src="https://i.imgur.com/2btL79J.png"
            alt="Particle Network"
            className="particle-logo"
          />
        </a>
        <a target="_blank" href="https://openfort.xyz" rel="noreferrer">
          <img
            src="https://i.imgur.com/b9dAZXs.png"
            alt="Openfort"
            className="openfort-logo"
          />
        </a>
      </div>

      {!provider ? (
        <div className="login-section">
          <button className="sign-button" onClick={login}>
            Sign in with Google
          </button>
        </div>
      ) : (
        <div className="profile-card">
          <h2>{particle?.auth?.getUserInfo()?.name ?? "Default Name"}</h2>
          <div className="action-buttons">
            {playerId && particle && (
              <RegisterButton
                playerId={playerId}
                particle={particle}
                provider={provider}
                logout={logout}
                uiConsole={uiConsole}
              />
            )}
            <button onClick={() => uiConsole(particle?.auth.getUserInfo())}>
              Get User Info
            </button>
            {playerId && particle && (
              <CollectButton
                playerId={playerId}
                particle={particle}
                provider={provider}
                logout={logout}
                uiConsole={uiConsole}
              />
            )}
          </div>
        </div>
      )}
      <div id="console">
        <p></p>
      </div>

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <pre>{showPopup}</pre>
            <button
              className="popup-close-btn"
              onClick={() => setShowPopup(false)}
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
