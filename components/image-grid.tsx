"use client";

import { useRef, useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import Image from "next/image";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ImageCropperDialog } from "@/components/image-cropper-dialog";
import { Button } from "@/components/ui/button";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface ImageItem {
  id: string;
  url: string;
}

interface ImageGridProps {
  images: ImageItem[];
  setImages: (images: ImageItem[]) => void;
  aspectRatio: "1:1" | "4:5" | "1.91:1";
  onExport: () => void;
  onCrop: (id: string, croppedUrl: string) => void;
}

function SortableImage({ image, index, aspectRatio, onClick }: { image: ImageItem; index: number; aspectRatio: "1:1" | "4:5" | "1.91:1"; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: image.id });
  const aspectRatioClass = {
    "1:1": "aspect-square",
    "4:5": "aspect-[4/5]",
    "1.91:1": "aspect-[1.91/1]",
  }[aspectRatio];
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative ${aspectRatioClass} bg-muted rounded-lg overflow-hidden cursor-move ${isDragging ? "opacity-50" : "opacity-100"}`}
      {...attributes}
      {...listeners}
      onClick={onClick}
    >
      <img
        src={image.url}
        alt={`Grid item ${index + 1}`}
        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8, display: 'block' }}
      />
    </div>
  );
}

export function ImageGrid({ images, setImages, aspectRatio, onExport, onCrop }: ImageGridProps) {
  const sensors = useSensors(useSensor(PointerSensor));
  const [cropIndex, setCropIndex] = useState<number | null>(null);
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={event => {
        const { active, over } = event;
        if (active.id !== over?.id) {
          const oldIndex = images.findIndex(img => img.id === active.id);
          const newIndex = images.findIndex(img => img.id === over?.id);
          setImages(arrayMove(images, oldIndex, newIndex));
        }
      }}
    >
      <SortableContext items={images.map(img => img.id)} strategy={verticalListSortingStrategy}>
        <div className="h-[500px] overflow-y-auto">
          <div className="grid grid-cols-3 gap-4 p-4">
            {images.slice().reverse().map((image, index) => (
              <SortableImage key={image.id} image={image} index={index} aspectRatio={aspectRatio} onClick={() => setCropIndex(images.length - 1 - index)} />
            ))}
          </div>
        </div>
      </SortableContext>
      <Dialog open={cropIndex !== null} onOpenChange={() => setCropIndex(null)}>
        <DialogContent>
          <DialogTitle>Crop Image</DialogTitle>
          {cropIndex !== null && (
            <ImageCropperDialog
              image={images[cropIndex]}
              aspectRatio={aspectRatio}
              onCrop={(croppedUrl) => {
                onCrop(images[cropIndex].id, croppedUrl);
                setCropIndex(null);
              }}
              onCancel={() => setCropIndex(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </DndContext>
  );
} 