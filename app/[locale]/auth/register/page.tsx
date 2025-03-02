"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { z } from "zod";
import { registerSchema, RegisterFormData, useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import { usePathname } from "next/navigation";

export default function RegisterPage() {
  const t = useTranslations("Auth.register");
  const commonT = useTranslations("Common");
  const router = useRouter();
  const pathname = usePathname();

  // Получение текущей локали из пути
  const locale = pathname.split("/")[1] || "en";

  const [formData, setFormData] = useState<RegisterFormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Partial<RegisterFormData>>({});
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [termsError, setTermsError] = useState("");

  const { register, isRegistering, isLoading } = useAuth();

  const validateForm = () => {
    try {
      registerSchema.parse(formData);
      setErrors({});

      if (!acceptTerms) {
        setTermsError("You must accept the terms and conditions");
        return false;
      }
      setTermsError("");

      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors: Partial<RegisterFormData> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            const path = err.path[0] as keyof RegisterFormData;
            formattedErrors[path] = err.message;
          }
        });
        setErrors(formattedErrors);
      }
      return false;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    console.log("Submitting registration form", { formData });
    register(formData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {t("title")}
          </CardTitle>
          <CardDescription className="text-center">
            {t("subtitle")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                {t("name")}
              </label>
              <Input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                {t("email")}
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                {t("password")}
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className={errors.password ? "border-red-500" : ""}
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                {t("confirmPassword")}
              </label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={errors.confirmPassword ? "border-red-500" : ""}
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                checked={acceptTerms}
                onCheckedChange={(checked) => setAcceptTerms(checked === true)}
              />
              <label
                htmlFor="terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {t("terms")}
              </label>
            </div>
            {termsError && (
              <p className="text-red-500 text-xs mt-1">{termsError}</p>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isRegistering ? commonT("loading") : t("submit")}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            {t("alreadyHaveAccount")}{" "}
            <Link
              href={`/${locale}/auth/login`}
              className="text-primary hover:underline font-medium"
            >
              {t("login")}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
