"use client"

import { useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

export default function AgentAvatar({
  name,
  image,
  className,
}: {
  name: string
  image?: string | null
  className?: string
}) {
  const [failed, setFailed] = useState(false)
  const showImage = Boolean(image) && !failed

  return (
    <div
      className={cn(
        "w-12 h-12 rounded-full flex-shrink-0 overflow-hidden bg-ink flex items-center justify-center",
        className
      )}
    >
      {showImage ? (
        <Image
          src={image as string}
          alt={name}
          width={48}
          height={48}
          className="w-full h-full object-cover"
          onError={() => setFailed(true)}
          referrerPolicy="no-referrer"
        />
      ) : (
        <span className="text-sm font-black text-white select-none">
          {initials(name) || "?"}
        </span>
      )}
    </div>
  )
}
