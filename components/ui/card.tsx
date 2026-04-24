import * as React from "react";
import { cn } from "@/lib/utils";

export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...p }, ref) => (
  <div ref={ref} className={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)} {...p} />
));
Card.displayName = "Card";
export const CardHeader = ({ className, ...p }: any) => <div className={cn("p-6 pb-3", className)} {...p} />;
export const CardTitle = ({ className, ...p }: any) => <h3 className={cn("text-lg font-semibold", className)} {...p} />;
export const CardDescription = ({ className, ...p }: any) => <p className={cn("text-sm text-muted-foreground", className)} {...p} />;
export const CardContent = ({ className, ...p }: any) => <div className={cn("p-6 pt-0", className)} {...p} />;
export const CardFooter = ({ className, ...p }: any) => <div className={cn("p-6 pt-0 flex items-center", className)} {...p} />;
