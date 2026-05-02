// SentinelMount.tsx
// This file is the only TypeScript bridge between Elyaitra and SentinelML.
// It simply renders SentinelML's App component as-is inside a full-screen container.
// DO NOT pass any props or modify App's behavior.

import React from "react";
// @ts-ignore — App.jsx is JavaScript, no type declarations needed
import SentinelApp from "./App";

export default function SentinelMount() {
  return (
    <div style={{ width: "100vw", minHeight: "100vh", margin: 0, padding: 0 }}>
      <SentinelApp />
    </div>
  );
}
