import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background text-foreground">
      <Card className="w-full max-w-md mx-4 bg-card border-border">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <h1 className="text-2xl font-bold font-heading">404 Page Not Found</h1>
          </div>

          <p className="mt-4 text-sm text-muted-foreground">
            The page you are looking for does not exist or has been moved.
          </p>

          <Link href="/">
            <a className="mt-4 inline-block w-full text-center bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90 transition-colors">
              Return to Dashboard
            </a>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}