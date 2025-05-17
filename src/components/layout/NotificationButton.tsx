
"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Bell } from "lucide-react";

export default function NotificationButton() {
  const { toast } = useToast();

  const handleNotificationsClick = () => {
    toast({
      title: "Notifications (Mock)",
      description: "You have no new notifications.",
    });
  };

  return (
    <Button variant="ghost" size="icon" aria-label="Notifications" onClick={handleNotificationsClick}>
      <Bell size={20} />
      <span className="sr-only">Notifications</span>
    </Button>
  );
}
