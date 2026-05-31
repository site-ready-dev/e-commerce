"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { deleteMediaFile } from "@/lib/actions";
import { toast } from "@/components/ui/use-toast";
import { Upload, Trash2, ImageIcon, Video, Loader2, Copy, Check } from "lucide-react";

interface MediaFile {
  id: string;
  filename: string;
  url: string;
  size: number;
  mimeType: string;
  type: string;
  createdAt: Date;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function MediaPageClient({ files: initialFiles }: { files: MediaFile[] }) {
  const router = useRouter();
  const [files, setFiles] = useState(initialFiles);
  const [uploading, setUploading] = useState(false);
  const [filter, setFilter] = useState<"all" | "image" | "video">("all");
  const [copied, setCopied] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = filter === "all" ? files : files.filter((f) => f.type === filter);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (!selectedFiles.length) return;
    setUploading(true);
    try {
      const uploaded: MediaFile[] = [];
      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Upload failed");
        }
        uploaded.push(await res.json());
      }
      setFiles((prev) => [...uploaded, ...prev]);
      toast({ title: `${uploaded.length} file${uploaded.length > 1 ? "s" : ""} uploaded` });
    } catch (err) {
      toast({ title: "Upload failed", description: String(err), variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMediaFile(id);
      setFiles((prev) => prev.filter((f) => f.id !== id));
      router.refresh();
    } catch {
      toast({ title: "Delete failed", variant: "destructive" });
    }
  };

  const copyUrl = async (url: string, id: string) => {
    await navigator.clipboard.writeText(url);
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Media</h1>
          <p className="mt-0.5 text-sm text-gray-500">{files.length} file{files.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            className="hidden"
            onChange={handleUpload}
          />
          <Button size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
            {uploading ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-1.5 h-4 w-4" />
            )}
            Upload
          </Button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="mb-4 flex gap-2">
        {(["all", "image", "video"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              filter === f
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {f === "all" ? "All" : f === "image" ? "Images" : "Videos"}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white py-20 text-center">
          <ImageIcon className="h-10 w-10 text-gray-200 mb-3" />
          <p className="text-sm font-medium text-gray-500">No files yet</p>
          <p className="text-xs text-gray-400 mt-0.5">Upload images or videos to get started</p>
          <Button size="sm" variant="outline" className="mt-4" onClick={() => fileInputRef.current?.click()}>
            <Upload className="mr-1.5 h-3.5 w-3.5" />
            Upload file
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {filtered.map((file) => (
            <div key={file.id} className="group rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="aspect-square bg-gray-100 overflow-hidden relative">
                {file.type === "video" ? (
                  <video src={file.url} className="h-full w-full object-cover" muted />
                ) : (
                  <img src={file.url} alt={file.filename} className="h-full w-full object-cover" />
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              </div>
              <div className="p-2">
                <div className="flex items-center gap-1 mb-1">
                  <Badge variant="secondary" className="text-[9px] px-1 py-0 gap-0.5">
                    {file.type === "video" ? <Video className="h-2 w-2" /> : <ImageIcon className="h-2 w-2" />}
                    {file.type}
                  </Badge>
                  <span className="text-[10px] text-gray-400 ml-auto">{formatBytes(file.size)}</span>
                </div>
                <p className="text-[11px] text-gray-500 truncate" title={file.filename}>
                  {file.filename.split("/").pop()}
                </p>
                <div className="mt-2 flex gap-1">
                  <button
                    onClick={() => copyUrl(file.url, file.id)}
                    className="flex-1 flex items-center justify-center gap-1 rounded-md border border-gray-200 py-1 text-[11px] text-gray-500 hover:bg-gray-50 transition-colors"
                    title="Copy URL"
                  >
                    {copied === file.id ? (
                      <Check className="h-3 w-3 text-green-500" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button className="flex items-center justify-center rounded-md border border-gray-200 px-2 py-1 text-[11px] text-red-400 hover:bg-red-50 transition-colors">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete file?</AlertDialogTitle>
                        <AlertDialogDescription>This will permanently delete this file from storage. Content using this file will show broken images.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(file.id)} className="bg-red-500 hover:bg-red-600">Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
