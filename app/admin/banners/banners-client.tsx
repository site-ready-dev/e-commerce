"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { createBanner, updateBanner, deleteBanner } from "@/lib/actions";
import { toast } from "@/components/ui/use-toast";
import { MediaUploader } from "@/components/admin/media-uploader";
import { Plus, Pencil, Trash2, ImageIcon, Video } from "lucide-react";

interface Banner {
  id: string;
  title: string | null;
  subtitle: string | null;
  mediaUrl: string;
  mediaType: string;
  isFullScreen: boolean;
  isActive: boolean;
  ctaText: string | null;
  ctaUrl: string | null;
  order: number;
}

function BannerForm({ banner, onSuccess }: { banner?: Banner; onSuccess: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [isFullScreen, setIsFullScreen] = useState(banner?.isFullScreen ?? true);
  const [isActive, setIsActive] = useState(banner?.isActive ?? true);
  const [mediaType, setMediaType] = useState(banner?.mediaType || "image");
  const [mediaUrl, setMediaUrl] = useState(banner?.mediaUrl || "");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!mediaUrl) { toast({ title: "Please add media", variant: "destructive" }); return; }
    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get("title") as string || undefined,
      subtitle: formData.get("subtitle") as string || undefined,
      mediaUrl,
      mediaType,
      isFullScreen,
      isActive,
      ctaText: formData.get("ctaText") as string || undefined,
      ctaUrl: formData.get("ctaUrl") as string || undefined,
      order: parseInt(formData.get("order") as string) || 0,
    };
    startTransition(async () => {
      try {
        if (banner) { await updateBanner(banner.id, data); toast({ title: "Banner updated" }); }
        else { await createBanner(data); toast({ title: "Banner created" }); }
        onSuccess();
      } catch { toast({ title: "Error", variant: "destructive" }); }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" defaultValue={banner?.title || ""} placeholder="Hero title..." />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="subtitle">Subtitle</Label>
          <Input id="subtitle" name="subtitle" defaultValue={banner?.subtitle || ""} placeholder="Supporting text..." />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Media Type</Label>
        <Select value={mediaType} onValueChange={(v) => { setMediaType(v); setMediaUrl(""); }}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="image">Image</SelectItem>
            <SelectItem value="video">Video</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label>Media *</Label>
        <MediaUploader
          value={mediaUrl}
          onChange={setMediaUrl}
          accept={mediaType as "image" | "video"}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="ctaText">CTA Button Text</Label>
          <Input id="ctaText" name="ctaText" defaultValue={banner?.ctaText || ""} placeholder="Shop Now" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ctaUrl">CTA Link</Label>
          <Input id="ctaUrl" name="ctaUrl" defaultValue={banner?.ctaUrl || ""} placeholder="/products" />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="order">Display Order</Label>
        <Input id="order" name="order" type="number" defaultValue={banner?.order ?? 0} min="0" className="w-24" />
      </div>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Switch id="isFullScreen" checked={isFullScreen} onCheckedChange={setIsFullScreen} />
          <Label htmlFor="isFullScreen">Full Screen</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch id="isActive" checked={isActive} onCheckedChange={setIsActive} />
          <Label htmlFor="isActive">Active</Label>
        </div>
      </div>
      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={isPending}>{isPending ? "Saving..." : banner ? "Update" : "Create"}</Button>
      </div>
    </form>
  );
}

export function BannersClient({ banners: initialBanners }: { banners: Banner[] }) {
  const router = useRouter();
  const [openCreate, setOpenCreate] = useState(false);
  const [editBanner, setEditBanner] = useState<Banner | null>(null);

  const handleDelete = (id: string) => {
    (async () => {
      try {
        await deleteBanner(id);
        toast({ title: "Banner deleted" });
        router.refresh();
      } catch { toast({ title: "Error", variant: "destructive" }); }
    })();
  };

  return (
    <TooltipProvider>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Banners</h1>
            <p className="mt-0.5 text-sm text-gray-500">Manage hero section media</p>
          </div>
          <Dialog open={openCreate} onOpenChange={setOpenCreate}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" />Add Banner</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>New Banner</DialogTitle></DialogHeader>
              <BannerForm onSuccess={() => { setOpenCreate(false); router.refresh(); }} />
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {initialBanners.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white py-16 text-center">
              <ImageIcon className="h-10 w-10 text-gray-200 mb-3" />
              <p className="text-sm font-medium text-gray-500">No banners yet</p>
              <p className="text-xs text-gray-400 mt-0.5">Add images or videos for your hero section</p>
            </div>
          )}
          {initialBanners.map((banner) => (
            <div key={banner.id} className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="aspect-video bg-gray-100 relative">
                {banner.mediaType === "video" ? (
                  <video src={banner.mediaUrl} className="h-full w-full object-cover" muted />
                ) : (
                  <img src={banner.mediaUrl} alt={banner.title || "Banner"} className="h-full w-full object-cover" />
                )}
                <div className="absolute top-2 left-2 flex gap-1.5">
                  <Badge variant={banner.isActive ? "success" : "secondary"} className="text-[10px]">{banner.isActive ? "Active" : "Inactive"}</Badge>
                  {banner.isFullScreen && <Badge variant="outline" className="text-[10px] bg-white">Full Screen</Badge>}
                </div>
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="text-[10px]">
                    {banner.mediaType === "video" ? <Video className="h-2.5 w-2.5 mr-1" /> : <ImageIcon className="h-2.5 w-2.5 mr-1" />}
                    {banner.mediaType}
                  </Badge>
                </div>
              </div>
              <div className="p-4">
                <p className="text-sm font-medium text-gray-900 truncate">{banner.title || "Untitled Banner"}</p>
                {banner.subtitle && <p className="text-xs text-gray-500 truncate mt-0.5">{banner.subtitle}</p>}
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-gray-400">Order: {banner.order}</span>
                  <div className="flex gap-1">
                    <Dialog open={editBanner?.id === banner.id} onOpenChange={(open) => !open && setEditBanner(null)}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => setEditBanner(banner)}><Pencil className="h-4 w-4" /></Button>
                          </DialogTrigger>
                        </TooltipTrigger>
                        <TooltipContent>Edit</TooltipContent>
                      </Tooltip>
                      <DialogContent>
                        <DialogHeader><DialogTitle>Edit Banner</DialogTitle></DialogHeader>
                        {editBanner && <BannerForm banner={editBanner} onSuccess={() => { setEditBanner(null); router.refresh(); }} />}
                      </DialogContent>
                    </Dialog>

                    <AlertDialog>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-red-400" /></Button>
                          </AlertDialogTrigger>
                        </TooltipTrigger>
                        <TooltipContent>Delete</TooltipContent>
                      </Tooltip>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete banner?</AlertDialogTitle>
                          <AlertDialogDescription>This will permanently delete this banner.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(banner.id)} className="bg-red-500 hover:bg-red-600">Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
}
