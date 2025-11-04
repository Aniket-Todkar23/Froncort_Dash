'use client'

import React, { useState, useEffect } from 'react'
import { useProjectStore } from '@/lib/stores/project-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, Calendar, User, Tag, X } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils/cn'
import { SEED_KANBAN_CARDS } from '@/lib/constants/seed-data'
import { getSupabaseClient } from '@/lib/supabase/client'
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useDroppable } from '@dnd-kit/core'


function ColumnComponent({
  column,
  columnCards,
  onDragEnd,
  isAddingCard: parentIsAddingCard,
  setIsAddingCard: parentSetIsAddingCard,
  selectedColumnId: parentSelectedColumnId,
  setSelectedColumnId: parentSetSelectedColumnId,
  newCardTitle: parentNewCardTitle,
  setNewCardTitle: parentSetNewCardTitle,
  newCardDesc: parentNewCardDesc,
  setNewCardDesc: parentSetNewCardDesc,
  selectedAssignee: parentSelectedAssignee,
  setSelectedAssignee: parentSetSelectedAssignee,
  users,
  handleCreateCard,
  onEdit,
}: {
  column: any
  columnCards: any[]
  onDragEnd: any
  isAddingCard: boolean
  setIsAddingCard: (val: boolean) => void
  selectedColumnId: string | null
  setSelectedColumnId: (val: string | null) => void
  newCardTitle: string
  setNewCardTitle: (val: string) => void
  newCardDesc: string
  setNewCardDesc: (val: string) => void
  selectedAssignee: string | null
  setSelectedAssignee: (val: string | null) => void
  users: any[]
  handleCreateCard: () => void
  onEdit: (card: any) => void
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  })

  return (
    <div
      key={column.id}
      ref={setNodeRef}
      className={cn(
        'flex-shrink-0 w-96 flex flex-col bg-muted/30 rounded-lg border border-border transition-colors',
        isOver && 'bg-primary/10 border-primary'
      )}
    >
      {/* Column Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2">
            {column.name}
            <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
              {columnCards.length}
            </span>
          </h3>
        </div>
      </div>

      {/* Cards Container - Droppable Area */}
      <SortableContext
        items={columnCards.map((c) => c.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex-1 overflow-auto p-3 space-y-3 min-h-[100px]">
          {columnCards.map((card) => (
            <DraggableCard key={card.id} card={card} users={users} onEdit={onEdit} />
          ))}

          {columnCards.length === 0 && (
            <div className="text-xs text-muted-foreground text-center py-8">
              No cards yet. Drag cards here or create new ones.
            </div>
          )}
        </div>
      </SortableContext>

      {/* Add Card Button/Form */}
      {!parentIsAddingCard || parentSelectedColumnId !== column.id ? (
        <button 
          onClick={() => {
            parentSetIsAddingCard(true)
            parentSetSelectedColumnId(column.id)
          }}
          className="p-3 text-xs text-muted-foreground hover:bg-background transition-colors flex items-center gap-2 border-t border-border w-full"
        >
          <Plus className="h-4 w-4" />
          Add card
        </button>
      ) : (
        <div className="p-3 border-t border-border space-y-2">
          <input
            type="text"
            placeholder="Card title..."
            value={parentNewCardTitle}
            onChange={(e) => parentSetNewCardTitle(e.target.value)}
            autoFocus
            className="w-full px-2 py-1 text-xs border border-border rounded bg-background text-foreground"
          />
          <textarea
            placeholder="Description (optional)"
            value={parentNewCardDesc}
            onChange={(e) => parentSetNewCardDesc(e.target.value)}
            className="w-full px-2 py-1 text-xs border border-border rounded bg-background text-foreground resize-none h-20"
          />
          <select
            value={parentSelectedAssignee || ''}
            onChange={(e) => parentSetSelectedAssignee(e.target.value || null)}
            className="w-full px-2 py-1 text-xs border border-border rounded bg-background text-foreground"
          >
            <option value="">Assign to...</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <button
              onClick={handleCreateCard}
              disabled={!parentNewCardTitle.trim()}
              className="flex-1 px-2 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create
            </button>
            <button
              onClick={() => {
                parentSetIsAddingCard(false)
                parentSetSelectedColumnId(null)
                parentSetNewCardTitle('')
                parentSetNewCardDesc('')
                parentSetSelectedAssignee(null)
              }}
              className="flex-1 px-2 py-1 text-xs border border-border rounded hover:bg-muted"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function DraggableCard({ card, users, onEdit }: { card: any; users: any[]; onEdit: (card: any) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('button')) return
        onEdit(card)
      }}
      className="bg-card border border-border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing group"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <p className="font-medium text-sm line-clamp-2">{card.title}</p>
          {card.description && (
            <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
              {card.description}
            </p>
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onEdit(card)
          }}
          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-muted rounded text-xs text-muted-foreground"
          title="Edit card"
        >
          ✎
        </button>
      </div>

      <div className="flex items-center gap-2 mt-3 flex-wrap">
        {card.labels && card.labels.length > 0 && (
          <Badge variant="secondary" className="text-xs">
            {card.labels[0].name}
          </Badge>
        )}
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          {card.due_date && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(card.due_date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          )}
        </div>
        {card.assignee && (
          <span className="flex items-center gap-1">
            <User className="h-3 w-3" />
            {(card.assignee?.name || 'Assigned')?.split(' ')[0]}
          </span>
        )}
      </div>
    </div>
  )
}

export default function KanbanPage({ params }: { params: { projectId: string } }) {
  const { currentProject, projects, setCurrentProject } = useProjectStore()
  const [cards, setCards] = useState<any[]>([])
  const [columns, setColumns] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddingCard, setIsAddingCard] = useState(false)
  const [newCardTitle, setNewCardTitle] = useState('')
  const [newCardDesc, setNewCardDesc] = useState('')
  const [selectedAssignee, setSelectedAssignee] = useState<string | null>(null)
  const [selectedColumnId, setSelectedColumnId] = useState<string | null>(null)
  const [boardId, setBoardId] = useState<string | null>(null)
  const [editingCard, setEditingCard] = useState<any | null>(null)
  const [editCardTitle, setEditCardTitle] = useState('')
  const [editCardDesc, setEditCardDesc] = useState('')
  const [editCardAssignee, setEditCardAssignee] = useState<string | null>(null)

  // Sync current project when component mounts or projectId changes
  useEffect(() => {
    const project = projects.find((p) => p.id === params.projectId)
    if (project) {
      setCurrentProject(project)
    }
  }, [params.projectId, projects, setCurrentProject])

  // Fetch board, columns, and cards from database
  useEffect(() => {
    const fetchBoardData = async () => {
      try {
        setLoading(true)
        const supabase = getSupabaseClient()

        // Get ALL kanban boards (to find the one for this project)
        const { data: allBoards, error: allBoardsError } = await supabase
          .from('kanban_boards')
          .select('id, project_id')

        if (allBoardsError) {
          console.error('Error fetching all boards:', allBoardsError)
          setLoading(false)
          return
        }

        // Find the board for this project
        const board = allBoards?.find(b => b.project_id === params.projectId)
        if (!board) {
          console.log('No board found for project:', params.projectId)
          setLoading(false)
          return
        }

        const boardIdValue = board.id
        setBoardId(boardIdValue)
        console.log('Found board:', boardIdValue, 'for project:', params.projectId)

        // Get ALL columns
        const { data: allColumns, error: allColumnsError } = await supabase
          .from('kanban_columns')
          .select('*')

        if (allColumnsError) {
          console.error('Error fetching columns:', allColumnsError)
          console.log('All columns:', allColumns)
        } else {
          console.log('All columns from DB:', allColumns?.length)
          console.log('Looking for board ID:', boardIdValue)
          console.log('Sample columns:', allColumns?.slice(0, 3).map(c => ({ id: c.id, board_id: c.board_id })))
          // Filter columns for this board
          const boardColumns = allColumns?.filter(c => c.board_id === boardIdValue) || []
          console.log('Filtered columns for this board:', boardColumns.length)
          setColumns(boardColumns)
        }

        // Get ALL users
        const { data: allUsers } = await supabase
          .from('users')
          .select('id, name, avatar')
          .limit(50)

        if (allUsers) {
          setUsers(allUsers)
          console.log('Fetched users:', allUsers.length)
        }

        // Get ALL cards with assignee details
        const { data: allCards, error: cardsError } = await supabase
          .from('kanban_cards')
          .select('*, assignee:assignee_id(id, name, avatar)')

        if (cardsError) {
          console.error('Error fetching cards:', cardsError)
        } else {
          // Filter cards for this board
          const boardCards = allCards?.filter(c => c.board_id === boardIdValue) || []
          console.log('Fetched cards for board:', boardCards.length)
          setCards(boardCards)
        }
      } catch (err) {
        console.error('Failed to fetch board data:', err)
        setCards([])
        setColumns([])
      } finally {
        setLoading(false)
      }
    }

    if (params.projectId) {
      console.log('Fetching board data for project:', params.projectId)
      fetchBoardData()
    }
  }, [params.projectId])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  )

  const handleEditCard = (card: any) => {
    setEditingCard(card)
    setEditCardTitle(card.title)
    setEditCardDesc(card.description || '')
    setEditCardAssignee(card.assignee_id || null)
  }

  const handleSaveCardEdit = async () => {
    if (!editingCard || !editCardTitle.trim()) return

    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase
        .from('kanban_cards')
        .update({
          title: editCardTitle.trim(),
          description: editCardDesc.trim(),
          assignee_id: editCardAssignee || null,
        })
        .eq('id', editingCard.id)

      if (error) {
        toast.error('Failed to update card')
        console.error(error)
        return
      }

      // Fetch updated card with assignee details
      const { data: updatedCard } = await supabase
        .from('kanban_cards')
        .select('*, assignee:assignee_id(id, name, avatar)')
        .eq('id', editingCard.id)
        .single()

      // Update local state with fresh data
      setCards(cards.map(c => 
        c.id === editingCard.id ? updatedCard : c
      ))

      setEditingCard(null)
      setEditCardTitle('')
      setEditCardDesc('')
      setEditCardAssignee(null)
      toast.success('Card updated successfully')
    } catch (err) {
      toast.error('Error updating card')
      console.error(err)
    }
  }

  const handleCreateCard = async () => {
    if (!newCardTitle.trim() || !selectedColumnId || !boardId) return

    try {
      const supabase = getSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        toast.error('User not authenticated')
        return
      }

      const { data: newCard, error } = await supabase
        .from('kanban_cards')
        .insert({
          board_id: boardId,
          column_id: selectedColumnId,
          title: newCardTitle.trim(),
          description: newCardDesc.trim(),
          order: cards.filter(c => c.column_id === selectedColumnId).length,
          created_by: user.id,
          assignee_id: selectedAssignee || null,
        })
        .select('*, assignee:assignee_id(id, name, avatar)')
        .single()

      if (error) {
        toast.error('Failed to create card')
        console.error(error)
        return
      }

      setCards([...cards, newCard])
      setNewCardTitle('')
      setNewCardDesc('')
      setSelectedAssignee(null)
      setIsAddingCard(false)
      setSelectedColumnId(null)
      toast.success('Card created successfully')
    } catch (err) {
      toast.error('Error creating card')
      console.error(err)
    }
  }

  // Get cards for each column
  const getCardsForColumn = (columnId: string) => {
    return cards.filter((card) => card.column_id === columnId)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over) {
      toast.error('Invalid drop target')
      return
    }

    const activeCardId = active.id as string
    let targetColumnId = over.id as string

    // If we dropped over a card, find its column
    const overCard = cards.find((c) => c.id === targetColumnId)
    if (overCard) {
      targetColumnId = overCard.columnId || overCard.column_id
    }

    // Find the card being dragged
    const draggedCard = cards.find((c) => c.id === activeCardId)
    if (!draggedCard) return

    const cardColumnId = draggedCard.column_id
    // Don't move if already in the same column
    if (cardColumnId === targetColumnId) {
      return
    }

    const targetColumn = columns.find((c) => c.id === targetColumnId)
    if (!targetColumn) {
      toast.error('Invalid target column')
      return
    }

    // Update the card's column locally
    setCards((prevCards) =>
      prevCards.map((card) =>
        card.id === activeCardId ? { ...card, column_id: targetColumnId } : card
      )
    )

    // Persist to database
    try {
      const supabase = getSupabaseClient()
      await supabase
        .from('kanban_cards')
        .update({ column_id: targetColumnId })
        .eq('id', activeCardId)
    } catch (err) {
      console.error('Failed to update card:', err)
      toast.error('Failed to update card')
    }

    toast.success(`Moved "${draggedCard.title}" to ${targetColumn.name}`)
  }

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-background">
        <div className="border-b border-border bg-card p-6">
          <h1 className="text-3xl font-bold">Kanban Board</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {currentProject?.name || 'Project'} • Task Management
          </p>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-muted-foreground">Loading cards...</div>
        </div>
      </div>
    )
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
      <div className="flex flex-col h-full bg-background">
        {/* Header */}
        <div className="border-b border-border bg-card p-6">
          <h1 className="text-3xl font-bold">Kanban Board</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {currentProject?.name || 'Project'} • Task Management
          </p>
        </div>

        {/* Board */}
        <div className="flex-1 overflow-auto p-6">
          {columns.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No columns found. Creating default board...</p>
            </div>
          ) : (
            <div className="flex gap-4">
              {columns.map((column) => {
                const columnCards = getCardsForColumn(column.id)
                return (
                  <ColumnComponent
                    key={column.id}
                    column={column}
                    columnCards={columnCards}
                    onDragEnd={handleDragEnd}
                    isAddingCard={isAddingCard}
                    setIsAddingCard={setIsAddingCard}
                    selectedColumnId={selectedColumnId}
                    setSelectedColumnId={setSelectedColumnId}
                    newCardTitle={newCardTitle}
                    setNewCardTitle={setNewCardTitle}
                    newCardDesc={newCardDesc}
                    setNewCardDesc={setNewCardDesc}
                    selectedAssignee={selectedAssignee}
                    setSelectedAssignee={setSelectedAssignee}
                    users={users}
                    handleCreateCard={handleCreateCard}
                    onEdit={handleEditCard}
                  />
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Edit Card Modal */}
      {editingCard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg shadow-lg max-w-md w-full mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Edit Card</h2>
              <button
                onClick={() => {
                  setEditingCard(null)
                  setEditCardTitle('')
                  setEditCardDesc('')
                  setEditCardAssignee(null)
                }}
                className="p-1 hover:bg-muted rounded"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Title
                </label>
                <input
                  type="text"
                  value={editCardTitle}
                  onChange={(e) => setEditCardTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-border rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Description
                </label>
                <textarea
                  value={editCardDesc}
                  onChange={(e) => setEditCardDesc(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-border rounded bg-background text-foreground resize-none h-24 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Assigned to
                </label>
                <select
                  value={editCardAssignee || ''}
                  onChange={(e) => setEditCardAssignee(e.target.value || null)}
                  className="w-full px-3 py-2 text-sm border border-border rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Unassigned</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={handleSaveCardEdit}
                disabled={!editCardTitle.trim()}
                className="flex-1 px-3 py-2 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Save Changes
              </button>
              <button
                onClick={() => {
                  setEditingCard(null)
                  setEditCardTitle('')
                  setEditCardDesc('')
                  setEditCardAssignee(null)
                }}
                className="flex-1 px-3 py-2 text-sm border border-border rounded hover:bg-muted font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </DndContext>
  )
}
