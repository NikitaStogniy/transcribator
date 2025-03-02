"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTranslations } from "next-intl";
import { BellRing, Moon } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { useTheme } from "next-themes";

export default function Settings() {
  const t = useTranslations("Dashboard.settings");
  const { theme, setTheme } = useTheme();

  const [notificationSettings, setNotificationSettings] = useState({
    all: true,
    email: true,
    push: true,
    sms: false,
    browser: true,
    weekly: true,
  });

  const handleThemeChange = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleNotificationChange = (key: string) => {
    setNotificationSettings((prev) => {
      const newSettings = { ...prev, [key]: !prev[key as keyof typeof prev] };

      // If turning off "all", turn off everything
      if (key === "all" && !newSettings.all) {
        return {
          all: false,
          email: false,
          push: false,
          sms: false,
          browser: false,
          weekly: false,
        };
      }

      // If turning on any specific notification, make sure "all" is on
      if (key !== "all" && newSettings[key as keyof typeof prev]) {
        newSettings.all = true;
      }

      return newSettings;
    });
  };

  return (
    <div className="container w-full space-y-6 p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Theme Settings Card */}
        <Card className="h-full">
          <CardHeader>
            <Moon className="h-8 w-8 mb-2 text-muted-foreground" />
            <CardTitle>{t("theme") || "Theme"}</CardTitle>
            <CardDescription>
              {t("themeDescription") || "Customize application appearance"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  {t("darkMode") || "Dark Mode"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("darkModeDescription") ||
                    "Switch between light and dark theme"}
                </p>
              </div>
              <Switch
                checked={theme === "dark"}
                onCheckedChange={handleThemeChange}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings Card */}
        <Card className="h-full">
          <CardHeader>
            <BellRing className="h-8 w-8 mb-2 text-muted-foreground" />
            <CardTitle>{t("notifications") || "Notifications"}</CardTitle>
            <CardDescription>
              {t("notificationsDescription") ||
                "Manage notification preferences"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">
                  {t("notificationsAll") || "All Notifications"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("notificationsAllDescription") ||
                    "Enable or disable all notifications"}
                </p>
              </div>
              <Switch
                checked={notificationSettings.all}
                onCheckedChange={() => handleNotificationChange("all")}
              />
            </div>

            <div className="border-t pt-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium flex-1">
                    {t("notificationsEmail") || "Email Notifications"}
                  </p>
                  <Switch
                    checked={notificationSettings.email}
                    onCheckedChange={() => handleNotificationChange("email")}
                    disabled={!notificationSettings.all}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium flex-1">
                    {t("notificationsPush") || "Push Notifications"}
                  </p>
                  <Switch
                    checked={notificationSettings.push}
                    onCheckedChange={() => handleNotificationChange("push")}
                    disabled={!notificationSettings.all}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium flex-1">
                    {t("notificationsSMS") || "SMS Notifications"}
                  </p>
                  <Switch
                    checked={notificationSettings.sms}
                    onCheckedChange={() => handleNotificationChange("sms")}
                    disabled={!notificationSettings.all}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium flex-1">
                    {t("notificationsBrowser") || "Browser Notifications"}
                  </p>
                  <Switch
                    checked={notificationSettings.browser}
                    onCheckedChange={() => handleNotificationChange("browser")}
                    disabled={!notificationSettings.all}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium flex-1">
                    {t("notificationsWeekly") || "Weekly Summary"}
                  </p>
                  <Switch
                    checked={notificationSettings.weekly}
                    onCheckedChange={() => handleNotificationChange("weekly")}
                    disabled={!notificationSettings.all}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
