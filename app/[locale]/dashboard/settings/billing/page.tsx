import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Download, CreditCard, CheckCircle } from "lucide-react";
import { useTranslations } from "next-intl";

export default function BillingSettings() {
  const t = useTranslations("Dashboard.settings");

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">{t("billing")}</h1>
        <Button>
          <CreditCard className="mr-2 h-4 w-4" />
          {t("updatePaymentMethod")}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("currentPlan")}</CardTitle>
            <CardDescription>{t("currentPlanDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold">Pro Plan</h3>
                  <p className="text-sm text-muted-foreground">$29/month</p>
                </div>
                <Badge variant="secondary">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {t("active")}
                </Badge>
              </div>
              <div className="pt-2">
                <p className="text-sm text-muted-foreground">
                  {t("nextBillingDate")}: April 1, 2024
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline">{t("cancelSubscription")}</Button>
            <Button>{t("upgradePlan")}</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("usageStats")}</CardTitle>
            <CardDescription>{t("usageStatsDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm">{t("storage")}: 4.2GB / 10GB</span>
                <span className="text-sm">42%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2.5">
                <div
                  className="bg-primary h-2.5 rounded-full"
                  style={{ width: "42%" }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm">{t("apiCalls")}: 842 / 5,000</span>
                <span className="text-sm">17%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2.5">
                <div
                  className="bg-primary h-2.5 rounded-full"
                  style={{ width: "17%" }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm">{t("teamMembers")}: 4 / 10</span>
                <span className="text-sm">40%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2.5">
                <div
                  className="bg-primary h-2.5 rounded-full"
                  style={{ width: "40%" }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("paymentMethod")}</CardTitle>
            <CardDescription>{t("paymentMethodDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="bg-muted p-2 rounded">
                <CreditCard className="h-6 w-6" />
              </div>
              <div>
                <p className="font-medium">Visa ending in 4242</p>
                <p className="text-sm text-muted-foreground">
                  {t("expires")}: 04/2025
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              {t("updatePaymentMethod")}
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("billingHistory")}</CardTitle>
          <CardDescription>{t("billingHistoryDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("date")}</TableHead>
                <TableHead>{t("amount")}</TableHead>
                <TableHead>{t("status")}</TableHead>
                <TableHead>{t("invoice")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>March 1, 2024</TableCell>
                <TableCell>$29.00</TableCell>
                <TableCell>
                  <Badge variant="secondary">{t("paid")}</Badge>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    PDF
                  </Button>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>February 1, 2024</TableCell>
                <TableCell>$29.00</TableCell>
                <TableCell>
                  <Badge variant="secondary">{t("paid")}</Badge>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    PDF
                  </Button>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>January 1, 2024</TableCell>
                <TableCell>$29.00</TableCell>
                <TableCell>
                  <Badge variant="secondary">{t("paid")}</Badge>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    PDF
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full">
            {t("viewAllInvoices")}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
