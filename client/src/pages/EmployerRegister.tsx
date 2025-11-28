import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, Loader2, Building2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
];

const INDUSTRIES = [
  "Technology",
  "Healthcare",
  "Finance & Banking",
  "Manufacturing",
  "Retail",
  "Construction",
  "Education",
  "Hospitality",
  "Transportation & Logistics",
  "Real Estate",
  "Energy & Utilities",
  "Professional Services",
  "Government",
  "Non-Profit",
  "Other"
];

const COMPANY_SIZES = [
  { value: "1-10", label: "1-10 employees" },
  { value: "11-50", label: "11-50 employees" },
  { value: "51-200", label: "51-200 employees" },
  { value: "201-500", label: "201-500 employees" },
  { value: "501-1000", label: "501-1,000 employees" },
  { value: "1001+", label: "1,000+ employees" }
];

const registerSchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  industry: z.string().min(1, "Please select an industry"),
  companySize: z.string().min(1, "Please select company size"),
  contactName: z.string().min(2, "Contact name must be at least 2 characters"),
  contactEmail: z.string().email("Please enter a valid email address"),
  contactPhone: z.string().min(10, "Please enter a valid phone number"),
  contactTitle: z.string().min(2, "Job title must be at least 2 characters"),
  addressLine1: z.string().min(5, "Please enter a valid address"),
  city: z.string().min(2, "Please enter a valid city"),
  state: z.string().min(2, "Please select a state"),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, "Please enter a valid ZIP code"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine(val => val === true, "You must accept the terms and conditions"),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function EmployerRegister() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      acceptTerms: false,
    },
  });

  const acceptTerms = watch("acceptTerms");

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const payload = {
        company_name: data.companyName,
        industry: data.industry,
        company_size: data.companySize,
        contact_name: data.contactName,
        contact_email: data.contactEmail,
        contact_phone: data.contactPhone,
        contact_title: data.contactTitle,
        address_line1: data.addressLine1,
        city: data.city,
        state: data.state,
        zip_code: data.zipCode,
        password: data.password,
      };

      const response = await fetch("/api/talent-exchange/employers/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || result.message || "Registration failed");
      }

      setIsSuccess(true);
      toast({
        title: "Registration Submitted",
        description: "Your employer account is pending approval.",
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Registration failed. Please try again.";
      setError(message);
      toast({
        title: "Registration Failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md bg-slate-800/50 border-slate-700/50 shadow-2xl" data-testid="card-success">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg mb-4">
              <CheckCircle2 className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-white" data-testid="text-success-title">
              Registration Submitted!
            </CardTitle>
            <CardDescription className="text-slate-400 mt-2">
              Your employer account is pending approval
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4">
              <h3 className="font-semibold text-cyan-300 mb-2">What happens next?</h3>
              <ul className="text-sm text-slate-300 space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                  <span>Our team will review your company information</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                  <span>You'll receive an email notification once approved</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                  <span>Approval typically takes 1-2 business days</span>
                </li>
              </ul>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Link href="/employer/login" className="w-full">
              <Button className="w-full bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400" data-testid="button-go-login">
                Go to Login
              </Button>
            </Link>
            <Link href="/jobs" className="w-full">
              <Button variant="outline" className="w-full border-slate-600 text-slate-300 hover:bg-slate-700" data-testid="button-browse-jobs">
                Browse Job Board
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 py-12 px-4">
      <div className="w-full max-w-2xl mx-auto">
        <Link href="/jobs" className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 mb-6 transition-colors" data-testid="link-back-jobs">
          <ArrowLeft className="w-4 h-4" />
          Back to Job Board
        </Link>

        <Card className="bg-slate-800/50 border-slate-700/50 shadow-2xl" data-testid="card-employer-register">
          <CardHeader className="space-y-4 text-center pb-6">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-white" data-testid="text-register-title">
                Register Your Company
              </CardTitle>
              <CardDescription className="text-slate-400 mt-2">
                Create an employer account to post jobs and find talent
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400" data-testid="error-message">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white border-b border-slate-700 pb-2">
                  Company Information
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="companyName" className="text-slate-300">
                    Company Name *
                  </Label>
                  <Input
                    id="companyName"
                    placeholder="Acme Corporation"
                    {...register("companyName")}
                    className="bg-slate-900/50 border-slate-600 focus:border-cyan-500 text-white placeholder:text-slate-500"
                    disabled={isLoading}
                    data-testid="input-company-name"
                  />
                  {errors.companyName && (
                    <p className="text-sm text-red-400" data-testid="error-company-name">
                      {errors.companyName.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="industry" className="text-slate-300">
                      Industry *
                    </Label>
                    <Select
                      onValueChange={(value) => setValue("industry", value)}
                      disabled={isLoading}
                    >
                      <SelectTrigger className="bg-slate-900/50 border-slate-600 focus:border-cyan-500 text-white" data-testid="select-industry">
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {INDUSTRIES.map((industry) => (
                          <SelectItem key={industry} value={industry} className="text-white hover:bg-slate-700">
                            {industry}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.industry && (
                      <p className="text-sm text-red-400" data-testid="error-industry">
                        {errors.industry.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="companySize" className="text-slate-300">
                      Company Size *
                    </Label>
                    <Select
                      onValueChange={(value) => setValue("companySize", value)}
                      disabled={isLoading}
                    >
                      <SelectTrigger className="bg-slate-900/50 border-slate-600 focus:border-cyan-500 text-white" data-testid="select-company-size">
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {COMPANY_SIZES.map((size) => (
                          <SelectItem key={size.value} value={size.value} className="text-white hover:bg-slate-700">
                            {size.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.companySize && (
                      <p className="text-sm text-red-400" data-testid="error-company-size">
                        {errors.companySize.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white border-b border-slate-700 pb-2">
                  Contact Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactName" className="text-slate-300">
                      Contact Name *
                    </Label>
                    <Input
                      id="contactName"
                      placeholder="John Smith"
                      {...register("contactName")}
                      className="bg-slate-900/50 border-slate-600 focus:border-cyan-500 text-white placeholder:text-slate-500"
                      disabled={isLoading}
                      data-testid="input-contact-name"
                    />
                    {errors.contactName && (
                      <p className="text-sm text-red-400" data-testid="error-contact-name">
                        {errors.contactName.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactTitle" className="text-slate-300">
                      Job Title *
                    </Label>
                    <Input
                      id="contactTitle"
                      placeholder="HR Manager"
                      {...register("contactTitle")}
                      className="bg-slate-900/50 border-slate-600 focus:border-cyan-500 text-white placeholder:text-slate-500"
                      disabled={isLoading}
                      data-testid="input-contact-title"
                    />
                    {errors.contactTitle && (
                      <p className="text-sm text-red-400" data-testid="error-contact-title">
                        {errors.contactTitle.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail" className="text-slate-300">
                      Email Address *
                    </Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      placeholder="john@company.com"
                      {...register("contactEmail")}
                      className="bg-slate-900/50 border-slate-600 focus:border-cyan-500 text-white placeholder:text-slate-500"
                      disabled={isLoading}
                      data-testid="input-contact-email"
                    />
                    {errors.contactEmail && (
                      <p className="text-sm text-red-400" data-testid="error-contact-email">
                        {errors.contactEmail.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactPhone" className="text-slate-300">
                      Phone Number *
                    </Label>
                    <Input
                      id="contactPhone"
                      type="tel"
                      placeholder="(555) 123-4567"
                      {...register("contactPhone")}
                      className="bg-slate-900/50 border-slate-600 focus:border-cyan-500 text-white placeholder:text-slate-500"
                      disabled={isLoading}
                      data-testid="input-contact-phone"
                    />
                    {errors.contactPhone && (
                      <p className="text-sm text-red-400" data-testid="error-contact-phone">
                        {errors.contactPhone.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white border-b border-slate-700 pb-2">
                  Company Address
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="addressLine1" className="text-slate-300">
                    Street Address *
                  </Label>
                  <Input
                    id="addressLine1"
                    placeholder="123 Business Ave, Suite 100"
                    {...register("addressLine1")}
                    className="bg-slate-900/50 border-slate-600 focus:border-cyan-500 text-white placeholder:text-slate-500"
                    disabled={isLoading}
                    data-testid="input-address"
                  />
                  {errors.addressLine1 && (
                    <p className="text-sm text-red-400" data-testid="error-address">
                      {errors.addressLine1.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2 col-span-2 md:col-span-2">
                    <Label htmlFor="city" className="text-slate-300">
                      City *
                    </Label>
                    <Input
                      id="city"
                      placeholder="Nashville"
                      {...register("city")}
                      className="bg-slate-900/50 border-slate-600 focus:border-cyan-500 text-white placeholder:text-slate-500"
                      disabled={isLoading}
                      data-testid="input-city"
                    />
                    {errors.city && (
                      <p className="text-sm text-red-400" data-testid="error-city">
                        {errors.city.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state" className="text-slate-300">
                      State *
                    </Label>
                    <Select
                      onValueChange={(value) => setValue("state", value)}
                      disabled={isLoading}
                    >
                      <SelectTrigger className="bg-slate-900/50 border-slate-600 focus:border-cyan-500 text-white" data-testid="select-state">
                        <SelectValue placeholder="State" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700 max-h-[200px]">
                        {US_STATES.map((state) => (
                          <SelectItem key={state} value={state} className="text-white hover:bg-slate-700">
                            {state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.state && (
                      <p className="text-sm text-red-400" data-testid="error-state">
                        {errors.state.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="zipCode" className="text-slate-300">
                      ZIP Code *
                    </Label>
                    <Input
                      id="zipCode"
                      placeholder="37203"
                      {...register("zipCode")}
                      className="bg-slate-900/50 border-slate-600 focus:border-cyan-500 text-white placeholder:text-slate-500"
                      disabled={isLoading}
                      data-testid="input-zip"
                    />
                    {errors.zipCode && (
                      <p className="text-sm text-red-400" data-testid="error-zip">
                        {errors.zipCode.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white border-b border-slate-700 pb-2">
                  Account Security
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-slate-300">
                      Password *
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
                    <p className="text-xs text-slate-500">
                      Min 8 characters, with uppercase, lowercase, and number
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-slate-300">
                      Confirm Password *
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      {...register("confirmPassword")}
                      className="bg-slate-900/50 border-slate-600 focus:border-cyan-500 text-white placeholder:text-slate-500"
                      disabled={isLoading}
                      data-testid="input-confirm-password"
                    />
                    {errors.confirmPassword && (
                      <p className="text-sm text-red-400" data-testid="error-confirm-password">
                        {errors.confirmPassword.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-700">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="acceptTerms"
                    checked={acceptTerms}
                    onCheckedChange={(checked) => setValue("acceptTerms", checked as boolean)}
                    className="mt-1 border-slate-600 data-[state=checked]:bg-cyan-600 data-[state=checked]:border-cyan-600"
                    disabled={isLoading}
                    data-testid="checkbox-terms"
                  />
                  <div className="space-y-1">
                    <Label htmlFor="acceptTerms" className="text-slate-300 cursor-pointer">
                      I accept the Terms of Service *
                    </Label>
                    <p className="text-xs text-slate-500">
                      By registering, you agree to our{" "}
                      <a href="/terms" className="text-cyan-400 hover:underline">Terms of Service</a>
                      {" "}and{" "}
                      <a href="/privacy" className="text-cyan-400 hover:underline">Privacy Policy</a>
                    </p>
                  </div>
                </div>
                {errors.acceptTerms && (
                  <p className="text-sm text-red-400" data-testid="error-terms">
                    {errors.acceptTerms.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white font-semibold py-5"
                disabled={isLoading}
                data-testid="button-register"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Register Company"
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 pt-4 border-t border-slate-700/50">
            <p className="text-center text-sm text-slate-400">
              Already have an employer account?{" "}
              <Link
                href="/employer/login"
                className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
                data-testid="link-login"
              >
                Sign in here
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
