"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { updateStoreSettings } from "@/lib/actions";
import { toast } from "@/components/ui/use-toast";
import { MediaUploader } from "@/components/admin/media-uploader";
import { Store, Link2, Search, MessageCircle } from "lucide-react";

const CURRENCIES = [
  { code: "USD", label: "USD – US Dollar" },
  { code: "EUR", label: "EUR – Euro" },
  { code: "GBP", label: "GBP – British Pound" },
  { code: "CAD", label: "CAD – Canadian Dollar" },
  { code: "AUD", label: "AUD – Australian Dollar" },
  { code: "INR", label: "INR – Indian Rupee" },
  { code: "PKR", label: "PKR – Pakistani Rupee" },
  { code: "AED", label: "AED – UAE Dirham" },
  { code: "SAR", label: "SAR – Saudi Riyal" },
  { code: "MYR", label: "MYR – Malaysian Ringgit" },
  { code: "SGD", label: "SGD – Singapore Dollar" },
  { code: "BDT", label: "BDT – Bangladeshi Taka" },
  { code: "LKR", label: "LKR – Sri Lankan Rupee" },
  { code: "NGN", label: "NGN – Nigerian Naira" },
  { code: "KES", label: "KES – Kenyan Shilling" },
  { code: "ZAR", label: "ZAR – South African Rand" },
  { code: "EGP", label: "EGP – Egyptian Pound" },
  { code: "TRY", label: "TRY – Turkish Lira" },
  { code: "BRL", label: "BRL – Brazilian Real" },
  { code: "MXN", label: "MXN – Mexican Peso" },
  { code: "JPY", label: "JPY – Japanese Yen" },
  { code: "CNY", label: "CNY – Chinese Yuan" },
];

interface Settings {
  id: string;
  orgName: string;
  storeName: string;
  tagline: string;
  currency: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  whatsappNumber: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
  twitterUrl: string | null;
  youtubeUrl: string | null;
  tiktokUrl: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
}

export function SettingsClient({ settings }: { settings: Settings | null }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [formKey, setFormKey] = useState(0);
  const [logoUrl, setLogoUrl] = useState(settings?.logoUrl || "");
  const [faviconUrl, setFaviconUrl] = useState(settings?.faviconUrl || "");
  const s = settings;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      orgName: formData.get("orgName") as string,
      storeName: formData.get("storeName") as string,
      tagline: formData.get("tagline") as string,
      currency: formData.get("currency") as string || "USD",
      logoUrl: logoUrl || undefined,
      faviconUrl: faviconUrl || undefined,
      whatsappNumber: formData.get("whatsappNumber") as string || undefined,
      email: formData.get("email") as string || undefined,
      phone: formData.get("phone") as string || undefined,
      address: formData.get("address") as string || undefined,
      instagramUrl: formData.get("instagramUrl") as string || undefined,
      facebookUrl: formData.get("facebookUrl") as string || undefined,
      twitterUrl: formData.get("twitterUrl") as string || undefined,
      youtubeUrl: formData.get("youtubeUrl") as string || undefined,
      tiktokUrl: formData.get("tiktokUrl") as string || undefined,
      metaTitle: formData.get("metaTitle") as string || undefined,
      metaDescription: formData.get("metaDescription") as string || undefined,
    };
    startTransition(async () => {
      try {
        const updated = await updateStoreSettings(data);
        toast({ title: "Settings saved" });
        setLogoUrl(updated.logoUrl || "");
        setFaviconUrl(updated.faviconUrl || "");
        setFormKey(k => k + 1);
        router.refresh();
      } catch (err) {
        console.error("Settings save error:", err);
        toast({ title: "Error saving settings", description: String(err), variant: "destructive" });
      }
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
        <p className="mt-0.5 text-sm text-gray-500">Configure your store details</p>
      </div>

      <form key={formKey} onSubmit={handleSubmit} className="space-y-5">
        {/* Store Identity */}
        <Card>
          <CardHeader className="pb-0">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <Store className="h-4 w-4 text-gray-400" />
              Store Identity
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="orgName">Organization Name</Label>
                <Input id="orgName" name="orgName" defaultValue={s?.orgName || ""} placeholder="Acme Corp" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="storeName">Store Name *</Label>
                <Input id="storeName" name="storeName" defaultValue={s?.storeName || ""} required placeholder="My Store" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tagline">Tagline</Label>
              <Input id="tagline" name="tagline" defaultValue={s?.tagline || ""} placeholder="Quality products at great prices" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="currency">Currency</Label>
              <select
                id="currency"
                name="currency"
                defaultValue={s?.currency || "USD"}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.label}</option>
                ))}
              </select>
              <p className="text-xs text-gray-400">Applied to all price displays across the store and admin</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Logo</Label>
                <MediaUploader value={logoUrl} onChange={setLogoUrl} accept="image" />
              </div>
              <div className="space-y-1.5">
                <Label>Favicon</Label>
                <MediaUploader value={faviconUrl} onChange={setFaviconUrl} accept="image" />
              </div>
            </div>
            <Separator />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" defaultValue={s?.email || ""} placeholder="hello@store.com" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" defaultValue={s?.phone || ""} placeholder="+1 555 000 0000" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="address">Address</Label>
              <Textarea id="address" name="address" defaultValue={s?.address || ""} rows={2} placeholder="123 Main St, City, Country" />
            </div>
          </CardContent>
        </Card>

        {/* WhatsApp */}
        <Card>
          <CardHeader className="pb-0">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <MessageCircle className="h-4 w-4 text-gray-400" />
              WhatsApp
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-1.5">
            <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
            <Input id="whatsappNumber" name="whatsappNumber" defaultValue={s?.whatsappNumber || ""} placeholder="14155552671 (with country code, no +)" />
            <p className="text-xs text-gray-400">Customers will be redirected here when they click the buy button</p>
          </CardContent>
        </Card>

        {/* Social Media */}
        <Card>
          <CardHeader className="pb-0">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <Link2 className="h-4 w-4 text-gray-400" />
              Social Media
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { id: "instagramUrl", label: "Instagram", placeholder: "https://instagram.com/..." },
                { id: "facebookUrl", label: "Facebook", placeholder: "https://facebook.com/..." },
                { id: "twitterUrl", label: "X / Twitter", placeholder: "https://x.com/..." },
                { id: "youtubeUrl", label: "YouTube", placeholder: "https://youtube.com/..." },
                { id: "tiktokUrl", label: "TikTok", placeholder: "https://tiktok.com/@..." },
              ].map(({ id, label, placeholder }) => (
                <div key={id} className="space-y-1.5">
                  <Label htmlFor={id}>{label}</Label>
                  <Input id={id} name={id} defaultValue={(s as unknown as Record<string, string | null>)?.[id] || ""} placeholder={placeholder} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* SEO */}
        <Card>
          <CardHeader className="pb-0">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <Search className="h-4 w-4 text-gray-400" />
              SEO
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="metaTitle">Default Meta Title</Label>
              <Input id="metaTitle" name="metaTitle" defaultValue={s?.metaTitle || ""} placeholder="Store name - tagline" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="metaDescription">Default Meta Description</Label>
              <Textarea id="metaDescription" name="metaDescription" defaultValue={s?.metaDescription || ""} rows={2} placeholder="Brief description of your store for search engines..." />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={isPending}>{isPending ? "Saving..." : "Save Settings"}</Button>
        </div>
      </form>
    </div>
  );
}
