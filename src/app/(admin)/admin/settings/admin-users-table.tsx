"use client";

import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { updateUserRole, toggleUserActive } from "@/lib/actions/auth";
import { toast } from "sonner";
import { Pencil, Check, X, Ban, CheckCircle } from "lucide-react";
import type { UserProfile, UserRole } from "@/types/database";

const roleOptions: { value: UserRole; label: string }[] = [
  { value: "superadmin", label: "Superadmin" },
  { value: "campus_admin", label: "Campus Admin" },
  { value: "admissions", label: "Admissions" },
  { value: "financial_aid", label: "Financial Aid" },
  { value: "instructor", label: "Instructor" },
  { value: "registrar", label: "Registrar" },
  { value: "auditor", label: "Auditor" },
];

interface AdminUsersTableProps {
  adminUsers: UserProfile[];
  currentUserId?: string;
}

export function AdminUsersTable({ adminUsers, currentUserId }: AdminUsersTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>("campus_admin");
  const [isPending, startTransition] = useTransition();

  function startEditing(user: UserProfile) {
    setEditingId(user.id);
    setSelectedRole(user.role);
  }

  function cancelEditing() {
    setEditingId(null);
  }

  function saveRole(userId: string) {
    startTransition(async () => {
      const result = await updateUserRole(userId, selectedRole);
      if (result.success) {
        toast.success("Role updated successfully.");
        setEditingId(null);
      } else {
        toast.error(result.error || "Failed to update role.");
      }
    });
  }

  function handleToggleActive(userId: string) {
    startTransition(async () => {
      const result = await toggleUserActive(userId);
      if (result.success) {
        toast.success("User status updated.");
      } else {
        toast.error(result.error || "Failed to update status.");
      }
    });
  }

  if (adminUsers.length === 0) {
    return <p className="text-center py-6 text-muted-foreground">No admin users found.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Name</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Email</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Role</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
            <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          {adminUsers.map((user) => {
            const isEditing = editingId === user.id;
            const isSelf = user.id === currentUserId;

            return (
              <tr key={user.id} className="border-b border-border hover:bg-muted/50">
                <td className="py-3 px-4 font-medium text-foreground">
                  {user.first_name} {user.last_name}
                </td>
                <td className="py-3 px-4 text-sm text-muted-foreground">{user.email}</td>
                <td className="py-3 px-4">
                  {isEditing ? (
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                      className="h-8 px-2 rounded-md border border-border bg-background text-foreground text-sm"
                    >
                      {roleOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <Badge variant="outline" className="capitalize">
                      {user.role?.replace(/_/g, " ")}
                    </Badge>
                  )}
                </td>
                <td className="py-3 px-4">
                  <Badge variant={user.is_active ? "default" : "destructive"}>
                    {user.is_active ? "Active" : "Inactive"}
                  </Badge>
                </td>
                <td className="py-3 px-4 text-right">
                  {isSelf ? (
                    <span className="text-xs text-muted-foreground">You</span>
                  ) : isEditing ? (
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => saveRole(user.id)}
                        isLoading={isPending}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={cancelEditing}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => startEditing(user)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleActive(user.id)}
                        disabled={isPending}
                        className={user.is_active ? "text-red-500 hover:text-red-600" : "text-green-500 hover:text-green-600"}
                      >
                        {user.is_active ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                      </Button>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
