'use client';
import { Button } from "@/components/ui/button";

interface User {
  name: string;
  picture: string;
  email: string;
}

interface UserProfileProps {
  user: User;
  onSignOut: () => void;
}

export default function UserProfile({ user, onSignOut }: UserProfileProps) {
  return (
    <div className="flex items-center gap-3 bg-muted/50 px-3 py-2 rounded-lg border">
      <img 
        src={user.picture} 
        alt="User Image" 
        className="w-8 h-8 rounded-full border-2 border-primary"
      />
      <span className="text-sm font-medium text-foreground max-w-24 truncate">
        {user.name}
      </span>
      <Button 
        onClick={onSignOut} 
        variant="ghost" 
        size="sm"
        className="text-muted-foreground hover:text-destructive h-8 px-2"
      >
        Sign Out
      </Button>
    </div>
  );
}