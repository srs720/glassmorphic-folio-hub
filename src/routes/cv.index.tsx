import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/cv/")({
  beforeLoad: () => {
    throw redirect({ to: "/cv/request", replace: true });
  },
});