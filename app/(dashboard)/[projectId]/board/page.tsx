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
        'flex-shrink-0 w-96 flex flex-col bg-card rounded-xl border border-border transition-all duration-200 shadow-sm overflow-hidden',
        isOver && 'bg-primary/5 border-primary shadow-md ring-2 ring-primary/20'
      )}
    >
      {/* Column Header */}
      <div className="p-4 border-b border-border/50 bg-gradient-to-r from-card to-card/95">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2 text-foreground">
            {column.name}
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-md font-medium">
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
        <div className="flex-1 overflow-auto p-3 space-y-3 min-h-[100px] bg-gradient-to-b from-card/50 to-card">
          {columnCards.map((card) => (
            <DraggableCard key={card.id} card={card} users={users} onEdit={onEdit} />
          ))}

          {columnCards.length === 0 && (
            <div className="text-xs text-muted-foreground text-center py-8 italic opacity-60">
              Drop cards here to get started
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
          className="p-3 text-xs text-muted-foreground hover:text-foreground hover:bg-primary/5 transition-all duration-200 flex items-center gap-2 border-t border-border/50 w-full group"
        >
          <Plus className="h-4 w-4 transition-transform group-hover:scale-110" />
          <span className="group-hover:font-medium">Add card</span>
        </button>
      ) : (
        <div className="p-4 border-t border-border/50 space-y-3 bg-primary/5">
          <input
            type="text"
            placeholder="Card title..."
            value={parentNewCardTitle}
            onChange={(e) => parentSetNewCardTitle(e.target.value)}
            autoFocus
            className="w-full px-3 py-2 text-xs border border-border rounded-md bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
          <textarea
            placeholder="Description (optional)"
            value={parentNewCardDesc}
            onChange={(e) => parentSetNewCardDesc(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-border rounded-md bg-card text-foreground resize-none h-20 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
          <select
            value={parentSelectedAssignee || ''}
            onChange={(e) => parentSetSelectedAssignee(e.target.value || null)}
            className="w-full px-3 py-2 text-xs border border-border rounded-md bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
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
              className="flex-1 px-3 py-2 text-xs font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
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
              className="flex-1 px-3 py-2 text-xs font-medium border border-border rounded-md hover:bg-muted/50 transition-all"
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
      className="bg-card border border-border rounded-lg p-4 shadow-sm hover:shadow-md hover:border-primary/50 transition-all duration-200 cursor-grab active:cursor-grabbing active:opacity-90 group"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <p className="font-semibold text-sm line-clamp-2 text-foreground group-hover:text-primary transition-colors">{card.title}</p>
          {card.description && (
            <p className="text-xs text-muted-foreground mt-2 line-clamp-2 group-hover:text-muted-foreground/80 transition-colors">
              {card.description}
            </p>
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onEdit(card)
          }}
          className="opacity-0 group-hover:opacity-100 p-2 hover:bg-muted rounded-md text-xs text-muted-foreground hover:text-foreground transition-all duration-200"
          title="Edit card"
        >
          ✎
        </button>
      </div>

      <div className="flex items-center gap-2 mt-3 flex-wrap">
        {card.labels && card.labels.length > 0 && (
          <Badge variant="secondary" className="text-xs font-medium">
            {card.labels[0].name}
          </Badge>
        )}
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          {card.due_date && (
            <span className="flex items-center gap-1 group-hover:text-foreground/70 transition-colors">
              <Calendar className="h-3 w-3" />
              {new Date(card.due_date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          )}
        </div>
        {card.assignee && (
          <span className="flex items-center gap-1 group-hover:text-foreground/70 transition-colors">
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
        <div className="border-b border-border/50 bg-gradient-to-r from-card to-card/95 p-6">
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
        <div className="border-b border-border/50 bg-gradient-to-r from-card to-card/95 p-6 shadow-sm">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">Kanban Board</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {currentProject?.name || 'Project'} • Task Management
          </p>
        </div>

        {/* Board */}
        <div className="flex-1 overflow-auto p-6 bg-gradient-to-br from-background via-background to-muted/20">
          {columns.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-sm">No columns found. Creating default board...</p>
            </div>
          ) : (
            <div className="flex gap-6 pb-6">
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-xl shadow-2xl max-w-md w-full mx-4 p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Edit Card</h2>
              <button
                onClick={() => {
                  setEditingCard(null)
                  setEditCardTitle('')
                  setEditCardDesc('')
                  setEditCardAssignee(null)
                }}
                className="p-2 hover:bg-muted rounded-md transition-all duration-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-foreground mb-2 block uppercase tracking-wide">
                  Title
                </label>
                <input
                  type="text"
                  value={editCardTitle}
                  onChange={(e) => setEditCardTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground mb-2 block uppercase tracking-wide">
                  Description
                </label>
                <textarea
                  value={editCardDesc}
                  onChange={(e) => setEditCardDesc(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground resize-none h-24 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground mb-2 block uppercase tracking-wide">
                  Assigned to
                </label>
                <select
                  value={editCardAssignee || ''}
                  onChange={(e) => setEditCardAssignee(e.target.value || null)}
                  className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all"
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
                className="flex-1 px-3 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
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
                className="flex-1 px-3 py-2 text-sm font-semibold border border-border rounded-md hover:bg-muted/50 transition-all"
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
