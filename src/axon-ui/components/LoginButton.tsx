import { HttpAgent, Identity } from "@dfinity/agent";
import { AuthClient } from "@dfinity/auth-client";
import React, { useEffect, useState } from "react";

export default function Dropdown({ agent, setAgent }) {
  const [authClient, setAuthClient] = useState<AuthClient>(null);

  const handleAuthenticated = async (authClient: AuthClient) => {
    const identity: Identity = authClient.getIdentity();
    setAgent(new HttpAgent({ identity, host: "https://ic0.app" }));
  };

  const handleLogin = () =>
    authClient.login({
      maxTimeToLive: BigInt(7 * 24 * 60 * 60 * 1e9), // one week
      onSuccess: () => handleAuthenticated(authClient),
    });

  const handleLogout = async () => {
    await authClient.logout();
    setAgent(null);
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
      onClick={agent ? handleLogout : handleLogin}
    >
      <img src="/img/dfinity.png" className="w-4 mr-2" />
      {agent ? "Logout" : "Login"}
    </button>
  );
}
