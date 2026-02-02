"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Phone, Lock, CheckCircle } from "lucide-react";
import { updateProfile, updatePassword } from "@/lib/actions/auth";

interface ProfileEditFormProps {
  currentPhone: string;
}

export function ProfileEditForm({ currentPhone }: ProfileEditFormProps) {
  const [phone, setPhone] = useState(currentPhone);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleUpdatePhone = () => {
    setMessage(null);
    startTransition(async () => {
      const result = await updateProfile({ phone });
      if (result.success) {
        setMessage({ type: "success", text: "Phone number updated." });
      } else {
        setMessage({ type: "error", text: result.error || "Failed to update." });
      }
    });
  };

  const handleChangePassword = () => {
    setPasswordMessage(null);
    if (newPassword.length < 6) {
      setPasswordMessage({ type: "error", text: "Password must be at least 6 characters." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "Passwords do not match." });
      return;
    }
    startTransition(async () => {
      const result = await updatePassword(newPassword);
      if (result.success) {
        setPasswordMessage({ type: "success", text: "Password updated successfully." });
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setPasswordMessage({ type: "error", text: result.error || "Failed to update password." });
      }
    });
  };

  return (
    <>
      {/* Phone Update */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Phone className="w-5 h-5" />
            Update Phone Number
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium text-foreground mb-1 block">Phone</label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(555) 123-4567"
              />
            </div>
            <Button onClick={handleUpdatePhone} isLoading={isPending} disabled={isPending}>
              Save
            </Button>
          </div>
          {message && (
            <p className={`text-sm mt-2 ${message.type === "success" ? "text-green-500" : "text-destructive"}`}>
              {message.type === "success" && <CheckCircle className="w-4 h-4 inline mr-1" />}
              {message.text}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Password Change */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Lock className="w-5 h-5" />
            Change Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-w-sm">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">New Password</label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Confirm Password</label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
              />
            </div>
            <Button onClick={handleChangePassword} isLoading={isPending} disabled={isPending}>
              Update Password
            </Button>
            {passwordMessage && (
              <p className={`text-sm ${passwordMessage.type === "success" ? "text-green-500" : "text-destructive"}`}>
                {passwordMessage.type === "success" && <CheckCircle className="w-4 h-4 inline mr-1" />}
                {passwordMessage.text}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
