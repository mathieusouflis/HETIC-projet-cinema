import { useParams } from "@tanstack/react-router";
import { getApi } from "@/lib/api/services";

export function ContentPage() {
  const { contentId } = useParams({
    from: "/_main/contents/$contentId/",
  });
  const { contents } = getApi();

  const { data } = contents.get(contentId);
  return <div>{JSON.stringify(data)}</div>;
}
