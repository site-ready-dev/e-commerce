"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { createProduct, updateProduct } from "@/lib/actions";
import { MediaItemsEditor, type MediaItem } from "./media-items-editor";

interface Category { id: string; name: string }

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  comparePrice: number | null;
  mediaItems: MediaItem[];
  categoryId: string | null;
  isActive: boolean;
  isFeatured: boolean;
  stock: number;
  sku: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
}

interface ProductFormProps {
  categories: Category[];
  product?: Product;
  onSuccess?: () => void;
}

export function ProductForm({ categories, product, onSuccess }: ProductFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [mediaItems, setMediaItems] = useState<MediaItem[]>(product?.mediaItems || []);
  const [isActive, setIsActive] = useState(product?.isActive ?? true);
  const [isFeatured, setIsFeatured] = useState(product?.isFeatured ?? false);
  const [categoryId, setCategoryId] = useState(product?.categoryId || "");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      price: parseFloat(formData.get("price") as string),
      comparePrice: formData.get("comparePrice") ? parseFloat(formData.get("comparePrice") as string) : undefined,
      mediaItems,
      categoryId: categoryId || undefined,
      isActive,
      isFeatured,
      stock: parseInt(formData.get("stock") as string) || 0,
      sku: formData.get("sku") as string || undefined,
      metaTitle: formData.get("metaTitle") as string || undefined,
      metaDescription: formData.get("metaDescription") as string || undefined,
    };
    startTransition(async () => {
      try {
        if (product) { await updateProduct(product.id, data); toast({ title: "Product updated" }); }
        else { await createProduct(data); toast({ title: "Product created" }); }
        onSuccess?.();
        router.refresh();
      } catch {
        toast({ title: "Error", description: "Something went wrong", variant: "destructive" });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2 space-y-1.5">
          <Label htmlFor="name">Product Name *</Label>
          <Input id="name" name="name" defaultValue={product?.name} required placeholder="e.g. Premium T-Shirt" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="price">Price *</Label>
          <Input id="price" name="price" type="number" step="0.01" min="0" defaultValue={product?.price} required placeholder="0.00" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="comparePrice">Compare Price</Label>
          <Input id="comparePrice" name="comparePrice" type="number" step="0.01" min="0" defaultValue={product?.comparePrice || ""} placeholder="0.00" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="stock">Stock</Label>
          <Input id="stock" name="stock" type="number" min="0" defaultValue={product?.stock ?? 0} placeholder="0" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="sku">SKU</Label>
          <Input id="sku" name="sku" defaultValue={product?.sku || ""} placeholder="SKU-001" />
        </div>
        <div className="sm:col-span-2 space-y-1.5">
          <Label htmlFor="category">Category</Label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No category</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="sm:col-span-2 space-y-1.5">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" defaultValue={product?.description || ""} rows={3} placeholder="Describe your product..." />
        </div>
      </div>

      {/* Media */}
      <div className="space-y-2">
        <Label>Media</Label>
        <MediaItemsEditor value={mediaItems} onChange={setMediaItems} />
      </div>

      {/* Toggles */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Switch id="isActive" checked={isActive} onCheckedChange={setIsActive} />
          <Label htmlFor="isActive">Active</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch id="isFeatured" checked={isFeatured} onCheckedChange={setIsFeatured} />
          <Label htmlFor="isFeatured">Featured</Label>
        </div>
      </div>

      <Separator />

      {/* SEO */}
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">SEO</p>
        <div className="space-y-1.5">
          <Label htmlFor="metaTitle">Meta Title</Label>
          <Input id="metaTitle" name="metaTitle" defaultValue={product?.metaTitle || ""} placeholder="SEO title..." />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="metaDescription">Meta Description</Label>
          <Textarea id="metaDescription" name="metaDescription" defaultValue={product?.metaDescription || ""} rows={2} placeholder="SEO description..." />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" disabled={isPending}>{isPending ? "Saving..." : product ? "Update Product" : "Create Product"}</Button>
      </div>
    </form>
  );
}
