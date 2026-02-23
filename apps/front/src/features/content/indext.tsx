import { useParams } from "@tanstack/react-router";

export function ContentPage() {
  const { contentId } = useParams({
    from: "/_main/contents/$contentId/",
  });
  console.log(contentId);
  return <div>{contentId}</div>;
}
