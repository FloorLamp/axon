import { HttpAgent, Identity } from "@dfinity/agent";
import { AuthClient } from "@dfinity/auth-client";
import React, { useEffect, useState } from "react";
import { ONE_WEEK_NS } from "../../lib/constants";
import { useGlobalContext, useSetAgent } from "../Store/Store";

export default function Dropdown() {
  const {
    state: { isAuthed },
  } = useGlobalContext();
  const setAgent = useSetAgent();
  const [authClient, setAuthClient] = useState<AuthClient>(null);

  const handleAuthenticated = async (authClient: AuthClient) => {
    const identity: Identity = authClient.getIdentity();
    setAgent({
      agent: new HttpAgent({
        identity,
        host:
          process.env.NEXT_PUBLIC_DFX_NETWORK === "local"
            ? "http://localhost:8000"
            : "https://ic0.app",
      }),
      isAuthed: true,
    });
  };

  const handleLogin = () =>
    authClient.login({
      identityProvider: "http://ryjl3-tyaaa-aaaaa-aaaba-cai.localhost:8000",
      maxTimeToLive: ONE_WEEK_NS,
      onSuccess: () => handleAuthenticated(authClient),
    });

  const handleLogout = async () => {
    await authClient.logout();
    setAgent({ agent: null });
  };

  useEffect(() => {
    (async () => {
      const authClient = await AuthClient.create();
      setAuthClient(authClient);
      if (await authClient.isAuthenticated()) {
        handleAuthenticated(authClient);
      }
    })();
  }, []);

  return (
    <button
      className="flex items-center px-2 py-1 rounded-md bg-white hover:shadow-lg transition-shadow transition-300"
      onClick={isAuthed ? handleLogout : handleLogin}
    >
      <img src="/img/dfinity.png" className="w-4 mr-2" />
      {isAuthed ? "Logout" : "Login"}
    </button>
  );
}
