"use client"

import * as React from "react"
import { cn } from "@/lib/utils/cn"
import { ImageOff } from "lucide-react"

interface ImageWithFallbackProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "onError"> {
  fallback?: React.ReactNode
  imgClassName?: string
}

export function ImageWithFallback({
  src,
  alt = "",
  className,
  imgClassName,
  fallback,
  ...props
}: ImageWithFallbackProps) {
  const [error, setError] = React.useState(false)
  const showFallback = !src || error

  return (
    <div className={cn("relative h-full w-full overflow-hidden", className)}>
      {showFallback ? (
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/40">
          {fallback ?? <ImageOff className="h-1/4 w-1/4 max-h-8 max-w-8" />}
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          onError={() => setError(true)}
          className={cn("h-full w-full object-cover", imgClassName)}
          {...props}
        />
      )}
    </div>
  )
}
