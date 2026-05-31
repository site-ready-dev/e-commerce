"use client";

import { useRef, useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MediaLibrary } from "./media-library";
import { toast } from "@/components/ui/use-toast";
import { Upload, Images, X, Loader2, ImageIcon, Video, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

export type MediaItem = { url: string; type: "image" | "video" };

function SortableMediaItem({
  item,
  onRemove,
}: {
  item: MediaItem;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.url });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative h-24 w-24 rounded-xl border-2 border-gray-200 overflow-hidden bg-gray-50 select-none",
        isDragging && "opacity-50 shadow-xl z-10"
      )}
    >
      {item.type === "video" ? (
        <video src={item.url} className="h-full w-full object-cover" muted preload="metadata" />
      ) : (
        <img src={item.url} alt="" className="h-full w-full object-cover" />
      )}

      {/* Type badge */}
      <div className="absolute bottom-1 left-1">
        <Badge
          variant="secondary"
          className="text-[9px] px-1 py-0 gap-0.5 bg-black/60 text-white border-0 pointer-events-none"
        >
          {item.type === "video" ? (
            <Video className="h-2 w-2" />
          ) : (
            <ImageIcon className="h-2 w-2" />
          )}
        </Badge>
      </div>

      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-1 left-1 cursor-grab active:cursor-grabbing rounded bg-black/50 p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <GripVertical className="h-3 w-3 text-white" />
      </div>

      {/* Remove button */}
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-1 right-1 rounded-full bg-white/90 p-1 shadow opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
      >
        <X className="h-2.5 w-2.5 text-gray-600" />
      </button>
    </div>
  );
}

interface MediaItemsEditorProps {
  value: MediaItem[];
  onChange: (items: MediaItem[]) => void;
}

export function MediaItemsEditor({ value, onChange }: MediaItemsEditorProps) {
  const [uploading, setUploading] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = value.findIndex((item) => item.url === active.id);
      const newIndex = value.findIndex((item) => item.url === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        onChange(arrayMove(value, oldIndex, newIndex));
      }
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      const uploaded: MediaItem[] = [];
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Upload failed");
        }
        const data = await res.json();
        uploaded.push({ url: data.url, type: data.type as "image" | "video" });
      }
      onChange([...value, ...uploaded]);
    } catch (err) {
      toast({ title: "Upload failed", description: String(err), variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeItem = (url: string) => {
    onChange(value.filter((item) => item.url !== url));
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
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
          Upload
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
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={value.map((item) => item.url)}
            strategy={rectSortingStrategy}
          >
            <div className="flex flex-wrap gap-2">
              {value.map((item) => (
                <SortableMediaItem
                  key={item.url}
                  item={item}
                  onRemove={() => removeItem(item.url)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="flex items-center justify-center rounded-xl border border-dashed border-gray-200 h-20 text-gray-400">
          <ImageIcon className="h-4 w-4 mr-2" />
          <span className="text-xs">No media added — images and videos welcome</span>
        </div>
      )}

      {value.length > 0 && (
        <p className="text-[11px] text-gray-400">Drag to reorder · {value.length} item{value.length !== 1 ? "s" : ""}</p>
      )}

      <MediaLibrary
        open={libraryOpen}
        onClose={() => setLibraryOpen(false)}
        onSelect={(url, type) =>
          onChange([...value, { url, type: type as "image" | "video" }])
        }
        onSelectMultiple={(items) =>
          onChange([
            ...value,
            ...items.map((i) => ({ url: i.url, type: i.type as "image" | "video" })),
          ])
        }
        accept="all"
        multiSelect
      />
    </div>
  );
}
