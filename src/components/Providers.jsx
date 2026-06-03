"use client";

import React from "react";
import { SessionProvider } from "next-auth/react";

/**
 * Root Client Providers Component
 * Supplies standard React context wrappers such as SessionProvider.
 * 
 * @param {Object} params React properties containing children nodes
 * @returns {React.ReactElement} Children node wrapped with contexts
 * @author Arnav Garg
 * @version 1.0.0
 */
export function Providers({ children }) {
  return <SessionProvider>{children}</SessionProvider>;
}
