import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <Card>
      <CardContent className="p-10 text-center">
        <p className="text-sm text-gray-400">{message}</p>
        <Button variant="outline" className="mt-4" onClick={onRetry}>
          Reintentar
        </Button>
      </CardContent>
    </Card>
  );
}
