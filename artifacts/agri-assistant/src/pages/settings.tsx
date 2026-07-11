import { useState } from "react";
import { useLocation } from "wouter";
import {
  useUpdateUserLanguage,
  useLogoutUser,
  getGetCurrentUserQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  const { user, isLoading: authLoading, invalidate } = useAuth();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const updateLang = useUpdateUserLanguage();
  const logout = useLogoutUser();
  const [language, setLanguage] = useState(user?.language ?? "en");
  const [saved, setSaved] = useState(false);

  if (!authLoading && !user) {
    navigate("/login");
    return null;
  }

  if (!user) return null;

  function handleSaveLanguage() {
    updateLang.mutate(
      { data: { language } },
      {
        onSuccess() {
          invalidate();
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
        },
      }
    );
  }

  function handleLogout() {
    logout.mutate(undefined, {
      onSuccess() {
        queryClient.invalidateQueries({ queryKey: getGetCurrentUserQueryKey() });
        navigate("/");
      },
    });
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-foreground">Settings</h1>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Name</span>
              <span className="font-medium text-foreground">{user.name}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Email</span>
              <span className="font-medium text-foreground">{user.email}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Member since</span>
              <span className="font-medium text-foreground">
                {new Date(user.createdAt).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Language Preference</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="language">Preferred language for AI responses</Label>
              <select
                id="language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="en">English</option>
                <option value="te">Telugu</option>
              </select>
            </div>
            <Button
              onClick={handleSaveLanguage}
              disabled={updateLang.isPending}
              variant={saved ? "outline" : "default"}
            >
              {saved ? "Saved!" : updateLang.isPending ? "Saving..." : "Save language"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base text-destructive">Danger Zone</CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" onClick={handleLogout}>
              Sign out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
