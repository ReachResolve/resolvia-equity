
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { User } from "@/types";
import UserPortfolio from "@/components/UserPortfolio";
import { Pencil, Check, X, Wallet } from "lucide-react";

const Profile = () => {
  const { user, isLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<Partial<User> | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Please log in to view your profile</h1>
        <Button onClick={() => window.location.href = "/login"}>Go to Login</Button>
      </div>
    );
  }

  const startEditing = () => {
    setEditedUser({
      name: user.name,
      // We only allow editing the name for now
    });
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditedUser(null);
  };

  const saveChanges = async () => {
    if (!editedUser || !user) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: editedUser.name
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      toast.success("Profile updated successfully");
      
      // Force reload profile data - a full page reload would work too
      window.location.reload();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
      setIsEditing(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  const joinedDate = user.joinedAt ? format(new Date(user.joinedAt), 'MMMM d, yyyy') : 'Unknown';

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card className="shadow-sm">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-2xl">Profile</CardTitle>
                <CardDescription>Manage your account details</CardDescription>
              </div>
              {!isEditing ? (
                <Button variant="outline" size="sm" onClick={startEditing}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <div className="space-x-2 mt-4 sm:mt-0">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={cancelEditing}
                    disabled={isSaving}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                  <Button 
                    variant="default" 
                    size="sm" 
                    onClick={saveChanges}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <div className="flex items-center">
                        <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                        Saving...
                      </div>
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        Save
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                </Avatar>
                <div className="space-y-1 text-center sm:text-left">
                  {isEditing ? (
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input 
                        id="name" 
                        value={editedUser?.name || ''} 
                        onChange={(e) => setEditedUser({...editedUser, name: e.target.value})}
                        className="max-w-sm"
                      />
                    </div>
                  ) : (
                    <>
                      <h3 className="text-xl font-semibold">{user.name}</h3>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <div className="flex items-center justify-center sm:justify-start mt-1">
                        <span className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary font-medium">
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Account Balance</h4>
                  <p className="text-2xl font-semibold">${user.balance.toFixed(2)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Shares Owned</h4>
                  <p className="text-2xl font-semibold">{user.sharesOwned}</p>
                </div>
              </div>
              
              {user.walletId && (
                <div className="bg-muted/30 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Wallet className="h-5 w-5 text-primary" />
                    <h4 className="text-sm font-medium">Wallet Information</h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Wallet ID</p>
                      <p className="text-sm font-mono">{user.walletId}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Created On</p>
                      <p className="text-sm">{joinedDate}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Member Since</h4>
                <p>{joinedDate}</p>
              </div>
            </CardContent>
            <CardFooter className="border-t bg-muted/50 flex flex-col sm:flex-row items-start sm:items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Your account ID: <span className="font-mono text-xs">{user.id}</span>
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-background mt-4 sm:mt-0"
                onClick={() => window.location.href = "/dashboard"}
              >
                Back to Dashboard
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        <div>
          <UserPortfolio />
        </div>
      </div>
    </div>
  );
};

export default Profile;
