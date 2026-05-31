"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { createCategory, updateCategory, deleteCategory, reorderCategories } from "@/lib/actions";
import { toast } from "@/components/ui/use-toast";
import { MediaUploader } from "@/components/admin/media-uploader";
import { Plus, Pencil, Trash2, Tag, GripVertical } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  isActive: boolean;
  order: number;
  _count: { products: number };
}

// ─── Category Form ────────────────────────────────────────────────────────────

function CategoryForm({ category, onSuccess }: { category?: Category; onSuccess: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [isActive, setIsActive] = useState(category?.isActive ?? true);
  const [imageUrl, setImageUrl] = useState(category?.imageUrl || "");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      description: (formData.get("description") as string) || undefined,
      imageUrl: imageUrl || undefined,
      isActive,
    };
    startTransition(async () => {
      try {
        if (category) { await updateCategory(category.id, data); toast({ title: "Category updated" }); }
        else { await createCategory(data); toast({ title: "Category created" }); }
        onSuccess();
      } catch { toast({ title: "Error", variant: "destructive" }); }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="name">Name *</Label>
        <Input id="name" name="name" defaultValue={category?.name} required placeholder="e.g. Clothing" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" defaultValue={category?.description || ""} rows={2} placeholder="Category description..." />
      </div>
      <div className="space-y-1.5">
        <Label>Image</Label>
        <MediaUploader value={imageUrl} onChange={setImageUrl} accept="image" />
      </div>
      <div className="flex items-center gap-2">
        <Switch id="isActive" checked={isActive} onCheckedChange={setIsActive} />
        <Label htmlFor="isActive">Active</Label>
      </div>
      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={isPending}>{isPending ? "Saving..." : category ? "Update" : "Create"}</Button>
      </div>
    </form>
  );
}

// ─── Sortable row (desktop table) ─────────────────────────────────────────────

function SortableTableRow({ cat, editCategory, setEditCategory, onDelete, onSuccess }: {
  cat: Category; editCategory: Category | null;
  setEditCategory: (c: Category | null) => void;
  onDelete: (id: string, name: string) => void;
  onSuccess: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: cat.id });

  return (
    <tr
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        position: "relative",
        zIndex: isDragging ? 10 : "auto",
      }}
      className="hover:bg-gray-50 transition-colors"
    >
      <td className="pl-2 pr-0 py-3 w-8">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1.5 rounded text-gray-300 hover:text-gray-500 hover:bg-gray-100 transition-colors touch-none"
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-4 w-4" />
        </button>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          {cat.imageUrl
            ? <img src={cat.imageUrl} alt={cat.name} className="h-8 w-8 rounded-lg object-cover" />
            : <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100"><Tag className="h-3.5 w-3.5 text-gray-400" /></div>}
          <div>
            <p className="text-sm font-medium text-gray-900">{cat.name}</p>
            {cat.description && <p className="text-xs text-gray-400 truncate max-w-xs">{cat.description}</p>}
          </div>
        </div>
      </td>
      <td className="px-5 py-3 hidden md:table-cell"><code className="text-xs bg-gray-100 rounded px-1.5 py-0.5 text-gray-600">{cat.slug}</code></td>
      <td className="px-5 py-3 text-sm text-gray-500">{cat._count.products}</td>
      <td className="px-5 py-3"><Badge variant={cat.isActive ? "success" : "secondary"}>{cat.isActive ? "Active" : "Inactive"}</Badge></td>
      <td className="px-5 py-3 text-right">
        <div className="flex items-center justify-end gap-1">
          <CategoryActions cat={cat} editCategory={editCategory} setEditCategory={setEditCategory} onDelete={onDelete} onSuccess={onSuccess} />
        </div>
      </td>
    </tr>
  );
}

// ─── Sortable card (mobile) ───────────────────────────────────────────────────

function SortableMobileCard({ cat, editCategory, setEditCategory, onDelete, onSuccess }: {
  cat: Category; editCategory: Category | null;
  setEditCategory: (c: Category | null) => void;
  onDelete: (id: string, name: string) => void;
  onSuccess: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: cat.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
      }}
      className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm"
    >
      <div className="flex items-center gap-3">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1.5 rounded text-gray-300 hover:text-gray-500 hover:bg-gray-100 transition-colors touch-none flex-shrink-0"
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        {cat.imageUrl
          ? <img src={cat.imageUrl} alt={cat.name} className="h-10 w-10 rounded-lg object-cover flex-shrink-0" />
          : <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 flex-shrink-0"><Tag className="h-4 w-4 text-gray-400" /></div>}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900">{cat.name}</p>
          <p className="text-xs text-gray-500">{cat._count.products} products · <code className="bg-gray-100 px-1 rounded">{cat.slug}</code></p>
          <div className="mt-1"><Badge variant={cat.isActive ? "success" : "secondary"}>{cat.isActive ? "Active" : "Inactive"}</Badge></div>
        </div>
        <div className="flex items-center gap-0.5">
          <CategoryActions cat={cat} editCategory={editCategory} setEditCategory={setEditCategory} onDelete={onDelete} onSuccess={onSuccess} />
        </div>
      </div>
    </div>
  );
}

// ─── Main client component ────────────────────────────────────────────────────

export function CategoriesClient({ categories: initialCategories }: { categories: Category[] }) {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
  const [openCreate, setOpenCreate] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 6 } })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = categories.findIndex((c) => c.id === active.id);
    const newIndex = categories.findIndex((c) => c.id === over.id);
    const reordered = arrayMove(categories, oldIndex, newIndex);
    setCategories(reordered);

    reorderCategories(reordered.map((c) => c.id)).catch(() => {
      toast({ title: "Failed to save order", variant: "destructive" });
      setCategories(categories);
    });
  };

  const handleDelete = (id: string, name: string) => {
    (async () => {
      try {
        await deleteCategory(id);
        setCategories((prev) => prev.filter((c) => c.id !== id));
        toast({ title: `"${name}" deleted` });
        router.refresh();
      } catch { toast({ title: "Error", variant: "destructive" }); }
    })();
  };

  return (
    <TooltipProvider>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Categories</h1>
            <p className="mt-0.5 text-sm text-gray-500">{categories.length} total · drag to reorder</p>
          </div>
          <Dialog open={openCreate} onOpenChange={setOpenCreate}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="mr-1.5 h-4 w-4" /><span className="hidden sm:inline">Add Category</span><span className="sm:hidden">Add</span></Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>New Category</DialogTitle></DialogHeader>
              <CategoryForm onSuccess={() => { setOpenCreate(false); router.refresh(); }} />
            </DialogContent>
          </Dialog>
        </div>

        {categories.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white flex flex-col items-center justify-center py-16 text-center shadow-sm">
            <Tag className="h-10 w-10 text-gray-200 mb-3" />
            <p className="text-sm font-medium text-gray-500">No categories yet</p>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={categories.map((c) => c.id)} strategy={verticalListSortingStrategy}>

              {/* Mobile cards */}
              <div className="sm:hidden space-y-2">
                {categories.map((cat) => (
                  <SortableMobileCard
                    key={cat.id}
                    cat={cat}
                    editCategory={editCategory}
                    setEditCategory={setEditCategory}
                    onDelete={handleDelete}
                    onSuccess={() => router.refresh()}
                  />
                ))}
              </div>

              {/* Desktop table */}
              <div className="hidden sm:block rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="pl-2 pr-0 py-3 w-8" />
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Category</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 hidden md:table-cell">Slug</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Products</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
                      <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {categories.map((cat) => (
                      <SortableTableRow
                        key={cat.id}
                        cat={cat}
                        editCategory={editCategory}
                        setEditCategory={setEditCategory}
                        onDelete={handleDelete}
                        onSuccess={() => router.refresh()}
                      />
                    ))}
                  </tbody>
                </table>
              </div>

            </SortableContext>
          </DndContext>
        )}
      </div>
    </TooltipProvider>
  );
}

// ─── Category action buttons ──────────────────────────────────────────────────

function CategoryActions({ cat, editCategory, setEditCategory, onDelete, onSuccess }: {
  cat: Category; editCategory: Category | null;
  setEditCategory: (c: Category | null) => void;
  onDelete: (id: string, name: string) => void;
  onSuccess: () => void;
}) {
  return (
    <>
      <Dialog open={editCategory?.id === cat.id} onOpenChange={(open) => !open && setEditCategory(null)}>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" onClick={() => setEditCategory(cat)}><Pencil className="h-4 w-4" /></Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>Edit</TooltipContent>
        </Tooltip>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Category</DialogTitle></DialogHeader>
          {editCategory && <CategoryForm category={editCategory} onSuccess={() => { setEditCategory(null); onSuccess(); }} />}
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
            <AlertDialogTitle>Delete category?</AlertDialogTitle>
            <AlertDialogDescription>This will delete &quot;{cat.name}&quot;. Products won&apos;t be deleted but will be uncategorized.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => onDelete(cat.id, cat.name)} className="bg-red-500 hover:bg-red-600">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
