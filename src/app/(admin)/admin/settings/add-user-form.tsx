"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createUser } from "@/lib/actions/auth";
import { toast } from "sonner";
import { UserPlus, X } from "lucide-react";
import type { UserRole } from "@/types/database";

const roleOptions: { value: UserRole; label: string }[] = [
  { value: "campus_admin", label: "Campus Admin" },
  { value: "admissions", label: "Admissions" },
  { value: "financial_aid", label: "Financial Aid" },
  { value: "instructor", label: "Instructor" },
  { value: "registrar", label: "Registrar" },
  { value: "auditor", label: "Auditor" },
  { value: "superadmin", label: "Superadmin" },
];

export function AddUserForm() {
  const [showForm, setShowForm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("campus_admin");

  function resetForm() {
    setFirstName("");
    setLastName("");
    setEmail("");
    setPassword("");
    setRole("campus_admin");
    setShowForm(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password.trim()) {
      toast.error("All fields are required.");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    startTransition(async () => {
      const result = await createUser(email.trim(), password, firstName.trim(), lastName.trim(), role);
      if (result.success) {
        toast.success(`${firstName} ${lastName} has been added as ${role.replace(/_/g, " ")}.`);
        resetForm();
      } else {
        toast.error(result.error || "Failed to create user.");
      }
    });
  }

  if (!showForm) {
    return (
      <div className="mb-4">
        <Button onClick={() => setShowForm(true)} size="sm">
          <UserPlus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6 p-4 rounded-lg border border-border bg-muted/20">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium text-foreground">Add New User</h4>
        <button type="button" onClick={resetForm} className="text-muted-foreground hover:text-foreground">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <Input
          placeholder="First name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />
        <Input
          placeholder="Last name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="Password (min 6 chars)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />
      </div>

      <div className="flex items-center gap-3">
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as UserRole)}
          className="h-10 px-3 rounded-md border border-border bg-background text-foreground text-sm flex-1 max-w-[200px]"
        >
          {roleOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <Button type="submit" isLoading={isPending} size="sm">
          Create User
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={resetForm}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
