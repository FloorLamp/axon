import React from "react";
import { FaGithub, FaTwitter } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="py-8 flex items-center justify-center gap-4 transition-opacity">
      <a
        href="https://ic.rocks/principal/dslea-eiaaa-aaaae-aaa3a-cai"
        className="opacity-50 hover:opacity-100"
        target="_blank"
        rel="noopener noreferrer"
      >
        <img src="/img/ic.rocks-logo.svg" className="w-4" />
      </a>
      <a
        href="https://github.com/FloorLamp/axon"
        className="opacity-50 hover:opacity-100"
        target="_blank"
        rel="noopener noreferrer"
      >
        <FaGithub />
      </a>
      <a
        href="https://twitter.com/axon_ooo"
        className="opacity-50 hover:opacity-100"
        target="_blank"
        rel="noopener noreferrer"
      >
        <FaTwitter />
      </a>
    </footer>
  );
}
