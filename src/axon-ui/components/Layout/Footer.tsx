import React from "react";
import { FaGithub, FaTwitter } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="py-8 flex justify-center gap-4 transition-opacity">
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
