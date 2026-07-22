import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface PlaceholderProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

export function Placeholder({ title, description, icon: Icon }: PlaceholderProps) {
  return (
    <div className="mx-auto w-full max-w-4xl p-4 sm:p-6 lg:p-8">
      <Card className="flex flex-col items-center gap-4 p-10 text-center shadow-card-soft">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary text-primary-foreground shadow-elegant">
          <Icon className="h-8 w-8" />
        </div>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">{title}</h1>
        <p className="max-w-md text-muted-foreground">{description}</p>
        <p className="text-xs text-muted-foreground">
          Este módulo está sendo preparado e será entregue na próxima fase.
        </p>
      </Card>
    </div>
  );
}