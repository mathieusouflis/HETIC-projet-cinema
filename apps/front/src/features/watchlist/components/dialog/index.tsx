import type { GETContents200DataItemsItem } from "@packages/api-sdk";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useApi } from "@/lib/api/services";
import { cn } from "@/lib/utils";
import FormWatchlist, { WATCHLIST_FORM_ID } from "./form";

interface AddContentToWatchlistDialogProps {
  content: GETContents200DataItemsItem;
  variant: "new" | "edit";
  children: React.ReactNode;
}

export default function AddContentToWatchlistDialog({
  content,
  variant,
  children,
}: AddContentToWatchlistDialogProps) {
  const [open, setOpen] = useState(false);
  const { mutate: deleteContentId } = useApi().watchlist.deleteContentId();

  function handleDelete() {
    deleteContentId(
      { contentId: content.id },
      { onSuccess: () => setOpen(false) }
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>{children}</DialogTrigger>
      <DialogContent title={content.title} className="md:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{content.title}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col">
          <FormWatchlist
            content={content}
            onSubmit={() => setOpen((old) => !old)}
          />
        </div>
        <DialogFooter
          className={cn("w-full", {
            "justify-between sm:justify-between": variant === "edit",
          })}
        >
          {variant === "edit" && (
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          )}
          <div className="flex flex-row gap-2">
            <DialogClose>
              <Button variant={"secondary"}>Cancel</Button>
            </DialogClose>
            <Button type="submit" form={WATCHLIST_FORM_ID} color="blue">
              Submit
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
