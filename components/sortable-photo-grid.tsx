"use client"

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  useSortable,
  arrayMove,
  rectSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { PHOTO_GRID_CLASS, PhotoTile, type ImageItem, type PhotoGridProps } from "./photo-grid"

function SortablePhoto({
  item,
  index,
  onRemove,
}: {
  item: ImageItem
  index: number
  onRemove: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id })

  return (
    <PhotoTile
      ref={setNodeRef}
      item={item}
      index={index}
      onRemove={onRemove}
      className="touch-none"
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        zIndex: isDragging ? 10 : undefined,
      }}
      dragHandleProps={{ ...attributes, ...listeners }}
    />
  )
}

export default function SortablePhotoGrid({
  items,
  onRemove,
  addButton,
  onReorder,
}: PhotoGridProps & {
  onReorder: (update: (prev: ImageItem[]) => ImageItem[]) => void
}) {
  // distance:8 prevents accidental drags on click/tap
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return
    onReorder((prev) => {
      const from = prev.findIndex((i) => i.id === active.id)
      const to = prev.findIndex((i) => i.id === over.id)
      return arrayMove(prev, from, to)
    })
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map((i) => i.id)} strategy={rectSortingStrategy}>
        <div className={PHOTO_GRID_CLASS}>
          {items.map((item, index) => (
            <SortablePhoto key={item.id} item={item} index={index} onRemove={onRemove} />
          ))}
          {addButton}
        </div>
      </SortableContext>
    </DndContext>
  )
}
