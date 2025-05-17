
"use client";

import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation"; 
import { useToast } from "@/hooks/use-toast";

export default function LogoutButton() {
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    // In a real app, you'd call an API to invalidate the session, clear cookies, etc.
    // For example: await fetch('/api/auth/logout', { method: 'POST' });
    
    console.log("Logout action initiated");
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out. Redirecting to login...",
    });

    // Simulate a short delay for the toast to be visible
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    router.push('/login');
    router.refresh(); // Optional: forces a refresh to clear any client-side user state
  };

  return (
    <Button
      variant="ghost"
      className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      onClick={handleLogout}
    >
      <LogOut size={16} />
      <span className="group-data-[collapsible=icon]:hidden">Logout</span>
    </Button>
  );
}
