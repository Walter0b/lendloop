"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";

export const useMe = () => useQuery(api.identity.users.me);
