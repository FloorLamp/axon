import Head from "next/head";
import "react";
import React from "react";
import { FaGithub } from "react-icons/fa";
import { QueryClient, QueryClientProvider } from "react-query";
import Nav from "../components/Layout/Nav";
import Store from "../components/Store/Store";
import { ONE_HOUR_MS } from "../lib/constants";
import "../styles/globals.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      cacheTime: ONE_HOUR_MS,
      retry: false,
    },
  },
});

export default function App({ Component, pageProps }) {
  return (
    <QueryClientProvider client={queryClient}>
      <Store>
        <Head>
          <title>Axon</title>
        </Head>
        <div className="flex flex-col items-center bg-gradient-to-b from-yellow-300 to-pink-500">
          <div className="flex flex-col justify-between min-h-screen w-full sm:max-w-screen-lg px-4">
            <main className="flex flex-col gap-8 justify-start">
              <Nav />

              <Component {...pageProps} />
            </main>

            <footer className="py-8 flex justify-center">
              <a
                href="https://github.com/FloorLamp/axon"
                className="underline inline-flex items-center gap-1 text-sm"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaGithub /> Github
              </a>
            </footer>
          </div>
        </div>
      </Store>

      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
    </QueryClientProvider>
  );
}
