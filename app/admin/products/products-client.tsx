"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { ProductForm } from "@/components/admin/product-form";
import { type MediaItem } from "@/components/admin/media-items-editor";
import { deleteProduct } from "@/lib/actions";
import { formatPrice } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import { Plus, Pencil, Trash2, Package, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice: number | null;
  mediaItems: MediaItem[];
  categoryId: string | null;
  isActive: boolean;
  isFeatured: boolean;
  stock: number;
  sku: string | null;
  description: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  category: { id: string; name: string } | null;
}

interface Category { id: string; name: string }

export function ProductsClient({ products: initialProducts, categories, currency = "USD" }: { products: Product[]; categories: Category[]; currency?: string }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [openCreate, setOpenCreate] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);

  const filtered = initialProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category?.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct(id);
      toast({ title: "Product deleted" });
      router.refresh();
    } catch {
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    }
  };

  return (
    <TooltipProvider>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Products</h1>
            <p className="mt-0.5 text-sm text-gray-500">{initialProducts.length} total</p>
          </div>
          <Dialog open={openCreate} onOpenChange={setOpenCreate}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="mr-1.5 h-4 w-4" /><span className="hidden sm:inline">Add Product</span><span className="sm:hidden">Add</span></Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader><DialogTitle>New Product</DialogTitle></DialogHeader>
              <ProductForm categories={categories} onSuccess={() => { setOpenCreate(false); router.refresh(); }} />
            </DialogContent>
          </Dialog>
        </div>

        <div className="mb-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input className="pl-9" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white flex flex-col items-center justify-center py-16 text-center shadow-sm">
            <Package className="h-10 w-10 text-gray-200 mb-3" />
            <p className="text-sm font-medium text-gray-500">No products found</p>
            <p className="text-xs text-gray-400 mt-0.5">Add your first product to get started</p>
          </div>
        ) : (
          <>
            <div className="sm:hidden space-y-2">
              {filtered.map((product) => (
                <div key={product.id} className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                      {product.mediaItems.find((m) => m.type === "image") ? <img src={product.mediaItems.find((m) => m.type === "image")!.url} alt={product.name} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center"><Package className="h-5 w-5 text-gray-300" /></div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                      <p className="text-xs text-gray-500">{product.category?.name || "Uncategorized"} · {formatPrice(product.price, currency)}</p>
                      <div className="flex gap-1.5 mt-1.5">
                        <Badge variant={product.isActive ? "success" : "secondary"}>{product.isActive ? "Active" : "Inactive"}</Badge>
                        {product.isFeatured && <Badge variant="warning">Featured</Badge>}
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <ProductActions product={product} categories={categories} editProduct={editProduct} setEditProduct={setEditProduct} onDelete={handleDelete} onSuccess={() => router.refresh()} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden sm:block rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Product</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 hidden md:table-cell">Category</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Price</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 hidden lg:table-cell">Stock</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                            {product.mediaItems.find((m) => m.type === "image") ? <img src={product.mediaItems.find((m) => m.type === "image")!.url} alt={product.name} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center"><Package className="h-4 w-4 text-gray-300" /></div>}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate max-w-35 lg:max-w-none">{product.name}</p>
                            {product.sku && <p className="text-xs text-gray-400">{product.sku}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-500 hidden md:table-cell">{product.category?.name || "—"}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-semibold text-gray-900">{formatPrice(product.price, currency)}</span>
                          {product.comparePrice && <span className="text-xs line-through text-gray-400">{formatPrice(product.comparePrice, currency)}</span>}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-500 hidden lg:table-cell">{product.stock}</td>
                      <td className="px-5 py-3">
                        <div className="flex gap-1.5">
                          <Badge variant={product.isActive ? "success" : "secondary"}>{product.isActive ? "Active" : "Inactive"}</Badge>
                          {product.isFeatured && <Badge variant="warning">Featured</Badge>}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <ProductActions product={product} categories={categories} editProduct={editProduct} setEditProduct={setEditProduct} onDelete={handleDelete} onSuccess={() => router.refresh()} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </TooltipProvider>
  );
}

function ProductActions({ product, categories, editProduct, setEditProduct, onDelete, onSuccess }: {
  product: Product; categories: Category[]; editProduct: Product | null;
  setEditProduct: (p: Product | null) => void; onDelete: (id: string) => void; onSuccess: () => void;
}) {
  return (
    <>
      <Dialog open={editProduct?.id === product.id} onOpenChange={(open) => !open && setEditProduct(null)}>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" onClick={() => setEditProduct(product)}><Pencil className="h-4 w-4" /></Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>Edit</TooltipContent>
        </Tooltip>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader><DialogTitle>Edit Product</DialogTitle></DialogHeader>
          {editProduct && <ProductForm categories={categories} product={editProduct} onSuccess={() => { setEditProduct(null); onSuccess(); }} />}
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
            <AlertDialogTitle>Delete product?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete &quot;{product.name}&quot;. This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => onDelete(product.id)} className="bg-red-500 hover:bg-red-600">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
