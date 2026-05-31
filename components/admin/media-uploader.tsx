"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { MediaLibrary } from "./media-library";
import { toast } from "@/components/ui/use-toast";
import { Upload, Images, X, Loader2, ImageIcon, Video } from "lucide-react";
import { cn } from "@/lib/utils";

interface MediaUploaderProps {
  value: string;
  onChange: (url: string) => void;
  accept?: "image" | "video" | "all";
  className?: string;
}

export function MediaUploader({ value, onChange, accept = "image", className }: MediaUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptAttr =
    accept === "image" ? "image/*" : accept === "video" ? "video/*" : "image/*,video/*";

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      const data = await res.json();
      onChange(data.url);
    } catch (err) {
      toast({ title: "Upload failed", description: String(err), variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const isVideo = value && (value.includes(".mp4") || value.includes(".webm") || value.includes(".mov") || value.includes("video"));

  return (
    <div className={cn("space-y-2", className)}>
      {value ? (
        <div className="relative rounded-lg border border-gray-200 overflow-hidden bg-gray-50 group">
          <div className="aspect-video">
            {isVideo ? (
              <video src={value} className="h-full w-full object-cover" muted controls={false} />
            ) : (
              <img src={value} alt="Media" className="h-full w-full object-cover" />
            )}
          </div>
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-2 right-2 rounded-full bg-white/90 p-1.5 shadow opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
          >
            <X className="h-3.5 w-3.5 text-gray-600" />
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-center rounded-lg border border-dashed border-gray-200 h-28 bg-gray-50">
          {accept === "video" ? (
            <Video className="h-5 w-5 text-gray-300" />
          ) : (
            <ImageIcon className="h-5 w-5 text-gray-300" />
          )}
        </div>
      )}

      <div className="flex gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptAttr}
          className="hidden"
          onChange={handleFileChange}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="flex-1 text-xs"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
          ) : (
            <Upload className="mr-1.5 h-3.5 w-3.5" />
          )}
          Upload from device
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="flex-1 text-xs"
          onClick={() => setLibraryOpen(true)}
        >
          <Images className="mr-1.5 h-3.5 w-3.5" />
          From library
        </Button>
      </div>

      <MediaLibrary
        open={libraryOpen}
        onClose={() => setLibraryOpen(false)}
        onSelect={(url) => onChange(url)}
        accept={accept}
      />
    </div>
  );
}

// Square logo uploader — auto-resizes to max 512×512 px via /api/upload/logo
interface LogoUploaderProps {
  value: string;
  onChange: (url: string) => void;
}

export function LogoUploader({ value, onChange }: LogoUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload/logo", { method: "POST", body: formData });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Upload failed");
      }
      const data = await res.json();
      onChange(data.url);
    } catch (err) {
      toast({ title: "Upload failed", description: String(err), variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <div className="relative w-24 h-24 rounded-xl border border-gray-200 overflow-hidden bg-gray-50 group">
        {value ? (
          <>
            <img src={value} alt="Logo" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute top-1 right-1 rounded-full bg-white/90 p-1 shadow opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
            >
              <X className="h-3 w-3 text-gray-600" />
            </button>
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ImageIcon className="h-5 w-5 text-gray-300" />
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="text-xs"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
      >
        {uploading ? (
          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
        ) : (
          <Upload className="mr-1.5 h-3.5 w-3.5" />
        )}
        {uploading ? "Uploading…" : "Upload logo"}
      </Button>
      <p className="text-xs text-gray-400">Square image required · auto-resized to 512×512 px</p>
    </div>
  );
}

// Multi-image uploader for product images
interface MediaImagesUploaderProps {
  value: string[];
  onChange: (urls: string[]) => void;
}

export function MediaImagesUploader({ value, onChange }: MediaImagesUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Upload failed");
        }
        const data = await res.json();
        uploaded.push(data.url);
      }
      onChange([...value, ...uploaded]);
    } catch (err) {
      toast({ title: "Upload failed", description: String(err), variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="flex-1 text-xs"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
          ) : (
            <Upload className="mr-1.5 h-3.5 w-3.5" />
          )}
          Upload from device
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="flex-1 text-xs"
          onClick={() => setLibraryOpen(true)}
        >
          <Images className="mr-1.5 h-3.5 w-3.5" />
          From library
        </Button>
      </div>

      {value.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {value.map((url, i) => (
            <div key={i} className="group relative h-16 w-16 rounded-lg border border-gray-200 bg-gray-50 overflow-hidden">
              <img
                src={url}
                alt=""
                className="h-full w-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4 text-white" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center rounded-lg border border-dashed border-gray-200 h-16 text-gray-400">
          <ImageIcon className="h-4 w-4 mr-2" />
          <span className="text-xs">No images added</span>
        </div>
      )}

      <MediaLibrary
        open={libraryOpen}
        onClose={() => setLibraryOpen(false)}
        onSelect={(url) => onChange([...value, url])}
        onSelectMultiple={(items) => onChange([...value, ...items.map((i) => i.url)])}
        accept="image"
        multiSelect
      />
    </div>
  );
}
