import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getPublicContent, type PublicContent } from "./public-content.functions";

export const publicContentQuery = queryOptions({
  queryKey: ["public_content"],
  queryFn: () => getPublicContent(),
  staleTime: 60_000,
});

export function usePublicContent(): PublicContent {
  return useSuspenseQuery(publicContentQuery).data;
}
