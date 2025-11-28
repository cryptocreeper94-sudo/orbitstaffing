import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { AlertCircle, Loader2, Building2, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function EmployerLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/talent-exchange/employers/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || result.message || "Invalid credentials");
      }

      localStorage.setItem("talentExchangeEmployer", JSON.stringify(result.employer));

      toast({
        title: "Login Successful",
        description: `Welcome back, ${result.employer.company_name}!`,
      });

      setLocation("/employer/portal");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed. Please try again.";
      setError(message);
      toast({
        title: "Login Failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link href="/jobs" className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 mb-6 transition-colors" data-testid="link-back-jobs">
          <ArrowLeft className="w-4 h-4" />
          Back to Job Board
        </Link>

        <Card className="bg-slate-800/50 border-slate-700/50 shadow-2xl" data-testid="card-employer-login">
          <CardHeader className="space-y-4 text-center pb-6">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-white" data-testid="text-login-title">
                Employer Login
              </CardTitle>
              <CardDescription className="text-slate-400 mt-2">
                Sign in to manage your job postings and candidates
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400" data-testid="error-message">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="employer@company.com"
                  {...register("email")}
                  className="bg-slate-900/50 border-slate-600 focus:border-cyan-500 text-white placeholder:text-slate-500"
                  disabled={isLoading}
                  data-testid="input-email"
                />
                {errors.email && (
                  <p className="text-sm text-red-400" data-testid="error-email">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...register("password")}
                  className="bg-slate-900/50 border-slate-600 focus:border-cyan-500 text-white placeholder:text-slate-500"
                  disabled={isLoading}
                  data-testid="input-password"
                />
                {errors.password && (
                  <p className="text-sm text-red-400" data-testid="error-password">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white font-semibold py-5"
                disabled={isLoading}
                data-testid="button-login"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 pt-4 border-t border-slate-700/50">
            <p className="text-center text-sm text-slate-400">
              Don't have an employer account?{" "}
              <Link
                href="/employer/register"
                className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
                data-testid="link-register"
              >
                Register your company
              </Link>
            </p>
          </CardFooter>
        </Card>

        <p className="text-center text-xs text-slate-500 mt-6">
          ORBIT Talent Exchange • Connecting talent with opportunity
        </p>
      </div>
    </div>
  );
}
