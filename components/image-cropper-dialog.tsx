"use client";

import Cropper from "react-easy-crop";
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";

interface ImageCropperDialogProps {
  image: { id: string; url: string };
  aspectRatio: "1:1" | "4:5" | "1.91:1";
  onCrop: (croppedUrl: string) => void;
  onCancel: () => void;
}

const ASPECT_RATIO_MAP = {
  "1:1": 1,
  "4:5": 4 / 5,
  "1.91:1": 1.91 / 1,
};

export function ImageCropperDialog({ image, aspectRatio, onCrop, onCancel }: ImageCropperDialogProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const onCropComplete = useCallback((_, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // Utility to crop the image and return a data URL
  const getCroppedImg = async (imageSrc: string, crop: any) => {
    const image = document.createElement("img");
    image.src = imageSrc;
    await new Promise((resolve) => (image.onload = resolve));
    const canvas = document.createElement("canvas");
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(
      image,
      crop.x,
      crop.y,
      crop.width,
      crop.height,
      0,
      0,
      crop.width,
      crop.height
    );
    return canvas.toDataURL("image/jpeg");
  };

  const handleCrop = async () => {
    if (!croppedAreaPixels) return;
    setLoading(true);
    const croppedUrl = await getCroppedImg(image.url, croppedAreaPixels);
    setLoading(false);
    if (croppedUrl) onCrop(croppedUrl);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-full h-72 bg-muted rounded-lg overflow-hidden">
        <Cropper
          image={image.url}
          crop={crop}
          zoom={zoom}
          aspect={ASPECT_RATIO_MAP[aspectRatio]}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
        />
      </div>
      <div className="flex gap-2 w-full justify-end">
        <Button variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleCrop} disabled={loading}>
          {loading ? "Cropping..." : "Crop & Save"}
        </Button>
      </div>
    </div>
  );
} 