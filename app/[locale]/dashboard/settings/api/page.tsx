import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Copy, Plus, RefreshCw, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";

export default function ApiSettings() {
  const t = useTranslations("Dashboard.settings");

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">{t("api")}</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          {t("createApiKey")}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("apiKeys")}</CardTitle>
          <CardDescription>{t("apiKeysDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("name")}</TableHead>
                <TableHead>{t("key")}</TableHead>
                <TableHead>{t("created")}</TableHead>
                <TableHead>{t("lastUsed")}</TableHead>
                <TableHead>{t("status")}</TableHead>
                <TableHead>{t("actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">
                  Production API Key
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <span>••••••••••••••••</span>
                    <Button variant="ghost" size="sm">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell>2023-12-01</TableCell>
                <TableCell>2024-03-01</TableCell>
                <TableCell>
                  <Badge variant="secondary">Active</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">
                  Development API Key
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <span>••••••••••••••••</span>
                    <Button variant="ghost" size="sm">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell>2023-12-15</TableCell>
                <TableCell>2024-02-28</TableCell>
                <TableCell>
                  <Badge variant="secondary">Active</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("apiUsage")}</CardTitle>
          <CardDescription>{t("apiUsageDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-sm text-muted-foreground">
                  {t("totalRequests")}
                </div>
                <div className="text-2xl font-bold">1,248</div>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-sm text-muted-foreground">
                  {t("averageResponseTime")}
                </div>
                <div className="text-2xl font-bold">235ms</div>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-sm text-muted-foreground">
                  {t("errorRate")}
                </div>
                <div className="text-2xl font-bold">0.8%</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("webhooks")}</CardTitle>
          <CardDescription>{t("webhooksDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("webhookUrl")}</label>
                <Input placeholder="https://your-domain.com/webhook" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("secretKey")}</label>
                <Input placeholder="••••••••••••••••" />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <Button>{t("saveWebhook")}</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
