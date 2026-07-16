import { youtubeEmbedUrl } from "@/lib/youtube"

export default function PropertyVideo({
  videoId,
  title,
}: {
  videoId: string
  title: string
}) {
  return (
    <div className="rounded-2xl border border-hairline overflow-hidden bg-black">
      <div className="relative aspect-video">
        <iframe
          src={youtubeEmbedUrl(videoId)}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      </div>
    </div>
  )
}
