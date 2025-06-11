"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { useDropzone } from "react-dropzone"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { ThemeToggle } from "@/components/theme-toggle"
import { ImageGrid } from "@/components/image-grid"
import { MobileFrame } from "@/components/mobile-frame"
import { AspectRatioSelector } from "@/components/aspect-ratio-selector"
import { storage } from "@/lib/storage"
import domtoimage from 'dom-to-image-more'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import html2canvas from "html2canvas"

// Utility to crop an image to a given aspect ratio (cover) and size
async function cropImageToCover(url: string, aspectRatio: number, width: number, height: number): Promise<string> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(url);
      // Calculate cover crop
      const imgRatio = img.width / img.height;
      let sx = 0, sy = 0, sw = img.width, sh = img.height;
      if (imgRatio > aspectRatio) {
        // Image is wider than target
        sw = img.height * aspectRatio;
        sx = (img.width - sw) / 2;
      } else {
        // Image is taller than target
        sh = img.width / aspectRatio;
        sy = (img.height - sh) / 2;
      }
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.92));
    };
    img.onerror = () => resolve(url);
    img.src = url;
  });
}

export default function Home() {
  const [images, setImages] = useState<Array<{ id: string; url: string }>>([])
  const [aspectRatio, setAspectRatio] = useState<"1:1" | "4:5" | "1.91:1">("1:1")
  const gridRef = useRef<HTMLDivElement>(null)
  const exportGridRef = useRef<HTMLDivElement>(null)
  const [exportDialogOpen, setExportDialogOpen] = useState(false)
  const [exportFormat, setExportFormat] = useState<"png" | "jpeg">("png")
  const [exportBackground, setExportBackground] = useState<string>("")
  const [exportReady, setExportReady] = useState(false)
  const [pendingExport, setPendingExport] = useState(false)
  const [loadedCount, setLoadedCount] = useState(0)
  const [exportTransparent, setExportTransparent] = useState(false)
  const [exportGridVisible, setExportGridVisible] = useState(false)
  const [shouldExportNow, setShouldExportNow] = useState(false)
  const [exportLoading, setExportLoading] = useState(false)

  // Robust unique ID for each image
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const readFiles = acceptedFiles.map(
      (file) =>
        new Promise<{ id: string; url: string }>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            resolve({
              id:
                typeof crypto !== "undefined" && crypto.randomUUID
                  ? crypto.randomUUID()
                  : `${Date.now()}-${Math.random()}`,
              url: e.target?.result as string,
            });
          };
          reader.readAsDataURL(file);
        })
    );
    Promise.all(readFiles).then((newImages) => {
      setImages((prev) => [...prev, ...newImages]);
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    }
  })

  // Export logic: show export grid, open dialog, but do not export yet
  const handleExport = () => {
    setLoadedCount(0)
    setExportGridVisible(true)
    setExportReady(false)
    setPendingExport(true)
    setExportDialogOpen(true)
    setShouldExportNow(false)
    setExportLoading(true)
  }

  // Only set exportReady when all images are loaded
  useEffect(() => {
    if (!pendingExport) return
    if (loadedCount === images.length && images.length > 0) {
      setExportReady(true)
      setPendingExport(false)
      setExportLoading(false)
    }
  }, [loadedCount, images.length, pendingExport])

  // Reset loading state when dialog closes
  useEffect(() => {
    if (!exportDialogOpen) {
      setExportLoading(false)
      setLoadedCount(0)
      setExportGridVisible(false)
      setShouldExportNow(false)
    }
  }, [exportDialogOpen])

  // Only export when user clicks Export in dialog and exportReady is true
  useEffect(() => {
    if (shouldExportNow && exportReady && exportGridRef.current) {
      const node = exportGridRef.current;
      // 1. Prepare cropped images for export
      const aspect = aspectRatio === '1:1' ? 1 : aspectRatio === '4:5' ? 4/5 : 1.91/1;
      const cellWidth = 220;
      const cellHeight = Math.round(cellWidth / aspect);
      Promise.all(images.slice().reverse().map(img => cropImageToCover(img.url, aspect, cellWidth, cellHeight)))
        .then((croppedUrls) => {
          // 2. Render export grid with cropped images
          const exportGrid = document.createElement('div');
          exportGrid.className = 'grid grid-cols-3 gap-4 p-4';
          exportGrid.style.width = '750px';
          exportGrid.style.margin = '40px auto';
          exportGrid.style.background = exportTransparent ? 'transparent' : exportBackground || '#18181b';
          exportGrid.style.borderRadius = '16px';
          croppedUrls.forEach((url) => {
            const cell = document.createElement('div');
            cell.className = `relative ${aspectRatio === '1:1' ? 'aspect-square' : aspectRatio === '4:5' ? 'aspect-[4/5]' : 'aspect-[1.91/1]'} bg-muted rounded-lg overflow-hidden`;
            cell.style.width = cellWidth + 'px';
            cell.style.height = cellHeight + 'px';
            const img = document.createElement('img');
            img.src = url;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            img.style.borderRadius = '8px';
            img.style.display = 'block';
            cell.appendChild(img);
            exportGrid.appendChild(cell);
          });
          // 3. Use html2canvas to export the grid
          document.body.appendChild(exportGrid);
          setTimeout(() => {
            html2canvas(exportGrid, {
              backgroundColor: exportTransparent ? null : (exportBackground || '#18181b'),
              useCORS: true,
              scale: 3,
              logging: false,
              width: exportGrid.offsetWidth,
              height: exportGrid.offsetHeight,
            }).then((canvas: HTMLCanvasElement) => {
              const dataUrl = exportFormat === 'jpeg'
                ? canvas.toDataURL('image/jpeg')
                : canvas.toDataURL('image/png');
              const link = document.createElement('a');
              const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
              link.download = `instagrid-preview-${timestamp}.${exportFormat}`;
              link.href = dataUrl;
              link.click();
              document.body.removeChild(exportGrid);
              setExportDialogOpen(false);
              setLoadedCount(0);
              setExportGridVisible(false);
              setShouldExportNow(false);
            });
          }, 200);
        });
    }
  }, [shouldExportNow, exportReady, exportFormat, exportBackground, exportTransparent, aspectRatio, images]);

  // Clear grid and localStorage
  const handleClearGrid = () => {
    setImages([])
    storage.clearImages()
  }

  // Fix cropping: update image by id
  const handleCrop = (id: string, croppedUrl: string) => {
    setImages((prev) => prev.map(img => img.id === id ? { ...img, url: croppedUrl } : img));
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">InstaGrid Previewer</h1>
            <ThemeToggle />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                  ${isDragActive ? 'border-primary bg-primary/10' : 'border-border'}`}
              >
                <input {...getInputProps()} />
                <p className="text-muted-foreground">
                  {isDragActive
                    ? "Drop the images here..."
                    : "Drag and drop images here, or click to select files"}
                </p>
              </div>

              <AspectRatioSelector
                value={aspectRatio}
                onChange={setAspectRatio}
              />
            </div>

            <MobileFrame>
              <div ref={gridRef}>
                <ImageGrid
                  images={images}
                  setImages={setImages}
                  aspectRatio={aspectRatio}
                  onExport={handleExport}
                  onCrop={handleCrop}
                />
              </div>
              {/* Export grid overlay (opacity: 0, pointerEvents: none, not hidden) */}
              {exportGridVisible && (
                <div
                  style={{
                    position: 'absolute',
                    left: '-99999px',
                    top: 0,
                    zIndex: -1,
                    background: 'transparent',
                    opacity: 1,
                    pointerEvents: 'none',
                  }}
                  aria-hidden="true"
                >
                  <div
                    ref={exportGridRef}
                    className="grid grid-cols-3 gap-4 p-4"
                    style={{
                      width: 375,
                      margin: '40px auto',
                      background: exportTransparent ? 'transparent' : exportBackground || '#18181b',
                      borderRadius: 16,
                    }}
                  >
                    {images.slice().reverse().map((image, index) => (
                      <div
                        key={image.id}
                        className={`relative ${aspectRatio === '1:1' ? 'aspect-square' : aspectRatio === '4:5' ? 'aspect-[4/5]' : 'aspect-[1.91/1]'} bg-muted rounded-lg overflow-hidden`}
                      >
                        <img
                          src={image.url}
                          alt={`Grid item ${index + 1}`}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            borderRadius: 8,
                            display: 'block',
                          }}
                          onLoad={() => setLoadedCount((c) => c + 1)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </MobileFrame>
          </div>

          <div className="flex justify-end mt-4 gap-2">
            <Button onClick={handleExport}>Export Grid</Button>
            <Button variant="outline" onClick={handleClearGrid}>Clear Grid</Button>
          </div>
        </div>
      </main>

      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Options</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {exportLoading && (
              <div className="flex flex-col items-center justify-center py-4">
                <Loader2 className="animate-spin w-8 h-8 mb-2 text-primary" />
                <span className="text-sm text-muted-foreground">Preparing export preview... Loading images ({loadedCount}/{images.length})</span>
              </div>
            )}
            <div>
              <Label>Format</Label>
              <Select value={exportFormat} onValueChange={(value: "png" | "jpeg") => setExportFormat(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="png">PNG</SelectItem>
                  <SelectItem value="jpeg">JPEG</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Background Color (optional)</Label>
              <Input
                type="color"
                value={exportBackground}
                onChange={(e) => setExportBackground(e.target.value)}
                disabled={exportTransparent}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                id="transparent-bg"
                type="checkbox"
                checked={exportTransparent}
                onChange={(e) => setExportTransparent(e.target.checked)}
              />
              <Label htmlFor="transparent-bg">Export with transparent background</Label>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShouldExportNow(true)} disabled={!exportReady || exportLoading}>Export</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DndProvider>
  )
}
