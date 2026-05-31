"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { getMediaFiles, deleteMediaFile } from "@/lib/actions";
import { ImageIcon, Video, Trash2, Upload, Check, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface MediaFile {
  id: string;
  filename: string;
  url: string;
  size: number;
  mimeType: string;
  type: string;
  createdAt: Date;
}

interface MediaLibraryProps {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string, type: string) => void;
  onSelectMultiple?: (items: Array<{ url: string; type: string }>) => void;
  accept?: "image" | "video" | "all";
  multiSelect?: boolean;
}

export function MediaLibrary({ open, onClose, onSelect, onSelectMultiple, accept = "all", multiSelect = false }: MediaLibraryProps) {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMediaFiles(accept === "all" ? undefined : accept);
      setFiles(data as MediaFile[]);
    } finally {
      setLoading(false);
    }
  }, [accept]);

  useEffect(() => {
    if (open) {
      setSelected([]);
      load();
    }
  }, [open, load]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Upload failed");
      }
      const uploaded: MediaFile = await res.json();
      setFiles((prev) => [uploaded, ...prev]);
      setSelected([uploaded.id]);
      toast({ title: "Uploaded" });
    } catch (err) {
      toast({ title: "Upload failed", description: String(err), variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (file: MediaFile) => {
    setDeleting(file.id);
    try {
      await deleteMediaFile(file.id);
      setFiles((prev) => prev.filter((f) => f.id !== file.id));
      setSelected((prev) => prev.filter((id) => id !== file.id));
    } catch {
      toast({ title: "Delete failed", variant: "destructive" });
    } finally {
      setDeleting(null);
    }
  };

  const handleTileClick = (id: string) => {
    if (multiSelect) {
      setSelected((prev) =>
        prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
      );
    } else {
      setSelected((prev) => (prev[0] === id ? [] : [id]));
    }
  };

  const handleConfirmSelect = () => {
    if (multiSelect && onSelectMultiple) {
      const items = files
        .filter((f) => selected.includes(f.id))
        .map((f) => ({ url: f.url, type: f.type }));
      onSelectMultiple(items);
    } else {
      const file = files.find((f) => f.id === selected[0]);
      if (file) onSelect(file.url, file.type);
    }
    onClose();
  };

  const acceptAttr =
    accept === "image"
      ? "image/*"
      : accept === "video"
      ? "video/*"
      : "image/*,video/*";

  return (
    <DialogPrimitive.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className={cn(
            "fixed z-50 bg-white shadow-xl duration-200",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            // Mobile: full-screen
            "inset-0 flex flex-col",
            // Desktop: large centered modal
            "sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-[min(90vw,860px)] sm:max-h-[85vh] sm:flex sm:flex-col sm:rounded-2xl sm:border sm:border-gray-200 sm:data-[state=closed]:zoom-out-95 sm:data-[state=open]:zoom-in-95"
          )}
        >
          <DialogPrimitive.Title className="sr-only">Media Library</DialogPrimitive.Title>

          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 flex-shrink-0">
            <div>
              <p className="font-semibold text-gray-900">Media Library</p>
              <p className="text-xs text-gray-400">{files.length} file{files.length !== 1 ? "s" : ""}</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept={acceptAttr}
                className="hidden"
                onChange={handleUpload}
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? (
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Upload className="mr-1.5 h-3.5 w-3.5" />
                )}
                Upload
              </Button>
              <DialogPrimitive.Close asChild>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                  <X className="h-4 w-4" />
                </Button>
              </DialogPrimitive.Close>
            </div>
          </div>

          {/* Grid */}
          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-6 w-6 animate-spin text-gray-300" />
              </div>
            ) : files.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <ImageIcon className="h-10 w-10 text-gray-200 mb-3" />
                <p className="text-sm font-medium text-gray-500">No media yet</p>
                <p className="text-xs text-gray-400 mt-0.5">Upload images or videos to get started</p>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-4"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="mr-1.5 h-3.5 w-3.5" />
                  Upload file
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
                {files.map((file) => (
                  <MediaTile
                    key={file.id}
                    file={file}
                    isSelected={selected.includes(file.id)}
                    isDeleting={deleting === file.id}
                    onSelect={() => handleTileClick(file.id)}
                    onDelete={() => handleDelete(file)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3 flex-shrink-0">
            <p className="text-xs text-gray-400">
              {selected.length > 0
                ? `${selected.length} file${selected.length !== 1 ? "s" : ""} selected`
                : "Click a file to select"}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
              <Button size="sm" disabled={selected.length === 0} onClick={handleConfirmSelect}>
                <Check className="mr-1.5 h-3.5 w-3.5" />
                {multiSelect && selected.length > 1 ? `Use ${selected.length} files` : "Use this file"}
              </Button>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

function MediaTile({
  file,
  isSelected,
  isDeleting,
  onSelect,
  onDelete,
}: {
  file: MediaFile;
  isSelected: boolean;
  isDeleting: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={cn(
        "group relative aspect-square rounded-lg overflow-hidden border-2 cursor-pointer transition-all",
        isSelected ? "border-gray-900 shadow-md" : "border-transparent hover:border-gray-300"
      )}
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {file.type === "video" ? (
        <video src={file.url} className="h-full w-full object-cover" muted />
      ) : (
        <img src={file.url} alt={file.filename} className="h-full w-full object-cover" />
      )}

      {/* Type badge */}
      <div className="absolute bottom-1 left-1">
        <Badge variant="secondary" className="text-[9px] px-1 py-0 gap-0.5 bg-black/60 text-white border-0">
          {file.type === "video" ? <Video className="h-2 w-2" /> : <ImageIcon className="h-2 w-2" />}
        </Badge>
      </div>

      {/* Selected check */}
      {isSelected && (
        <div className="absolute inset-0 bg-gray-900/20 flex items-center justify-center">
          <div className="rounded-full bg-gray-900 p-1">
            <Check className="h-3 w-3 text-white" />
          </div>
        </div>
      )}

      {/* Delete button */}
      {(hovered || isDeleting) && (
        <button
          className="absolute top-1 right-1 rounded-full bg-white/90 p-1 shadow hover:bg-red-50 transition-colors"
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <Loader2 className="h-2.5 w-2.5 animate-spin text-gray-500" />
          ) : (
            <Trash2 className="h-2.5 w-2.5 text-red-500" />
          )}
        </button>
      )}
    </div>
  );
}
