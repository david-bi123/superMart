"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, X, ImageIcon, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils/cn"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"

interface ImageUploadProps {
  images: string[]
  onChange: (images: string[]) => void
  maxImages?: number
  className?: string
}

export function ImageUpload({ images, onChange, maxImages = 10, className }: ImageUploadProps) {
  const [ uploading, setUploading ] = React.useState(false)
  const [ dragOver, setDragOver ] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed")
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB")
      return
    }
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("upload_preset", "retailflow_products")
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
      )
      const data = await res.json()
      if (data.secure_url) {
        onChange([...images, data.secure_url])
        toast.success("Image uploaded successfully")
      } else {
        toast.error("Failed to upload image")
      }
    } catch {
      toast.error("Failed to upload image")
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    if (inputRef.current) inputRef.current.value = ""
  }

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index))
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-wrap gap-3">
        <AnimatePresence mode="popLayout">
          {images.map((url, i) => (
            <motion.div
              key={url}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="relative group h-24 w-24 rounded-xl overflow-hidden border border-white/10"
            >
              <img
                src={url}
                alt={`Upload ${i + 1}`}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-white hover:bg-white/20"
                  onClick={() => removeImage(i)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {images.length < maxImages && (
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className={cn(
              "relative h-24 w-24 rounded-xl border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center gap-1 text-xs",
              dragOver
                ? "border-violet-500 bg-violet-500/10 text-violet-400"
                : "border-white/10 hover:border-white/20 text-white/40 hover:text-white/60 bg-white/5",
              uploading && "opacity-50 cursor-not-allowed"
            )}
          >
            {uploading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="h-5 w-5" />
                <span>Upload</span>
              </>
            )}
          </motion.button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleInput}
      />
      {images.length === 0 && !uploading && (
        <div className="flex items-center gap-2 text-xs text-white/30">
          <ImageIcon className="h-3 w-3" />
          Drag & drop images or click to upload (max {maxImages})
        </div>
      )}
    </div>
  )
}
