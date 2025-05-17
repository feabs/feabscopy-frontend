
"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Copy } from "lucide-react";

interface CopyLinkButtonProps {
  referralLink: string;
}

export default function CopyLinkButton({ referralLink }: CopyLinkButtonProps) {
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      toast({
        title: "Link Copied!",
        description: "Referral link copied to clipboard.",
      });
    } catch (err) {
      console.error("Failed to copy text: ", err);
      toast({
        title: "Copy Failed",
        description: "Could not copy the link. Please try again manually.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button onClick={handleCopy}>
      <Copy size={16} className="mr-2" />
      Copy Link
    </Button>
  );
}
