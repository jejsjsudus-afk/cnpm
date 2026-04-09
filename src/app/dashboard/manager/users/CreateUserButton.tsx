"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { CreateUserForm } from "./CreateUserForm";

export function CreateUserButton({ callerRole }: { callerRole: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        className="bg-purple-600 hover:bg-purple-700 gap-2"
        onClick={() => setOpen(true)}
      >
        <UserPlus className="h-4 w-4" />
        Cấp tài khoản mới
      </Button>
      {open && (
        <CreateUserForm
          callerRole={callerRole}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
