import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Props {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: Props) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 p-12 text-center">
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3 text-gray-500">
          <Icon size={22} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-300">{title}</p>
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        </div>
        {actionLabel && onAction && (
          <Button className="mt-2" onClick={onAction}>
            {actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
