import { useState } from 'react'
import { useRouter } from 'next/router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  expenseApi,
  tripApi,
  participantApi,
  type Expense,
  type CreateExpenseDto,
  type UpdateExpenseDto,
  type Trip,
  type Participant,
  ExpenseCategory,
  enumUtils,
} from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Plus, Edit, Trash2, Receipt, Loader2, X } from 'lucide-react'
import { formatDate, formatCurrency } from '@/lib/utils'

export default function ExpensesPage() {
  const router = useRouter()
  const { trip: tripIdParam } = router.query

  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState<CreateExpenseDto>({
    title: '',
    amount: 0,
    category: ExpenseCategory.OTHER,
    currency: 'USD',
    quantity: 1,
    recipientName: '',
    recipientIban: '',
    note: '',
    tripId: tripIdParam ? Number(tripIdParam) : undefined,
    participantId: undefined,
  })

  const queryClient = useQueryClient()

  const { data: expenses, isLoading } = useQuery({
    queryKey: ['expenses'],
    queryFn: () => expenseApi.getAll(),
  })

  const { data: trips } = useQuery({
    queryKey: ['trips'],
    queryFn: () => tripApi.getAll(),
    enabled: isCreating || editingId !== null,
  })

  const { data: participants } = useQuery({
    queryKey: ['participants'],
    queryFn: () => participantApi.getAll(),
    enabled: isCreating || editingId !== null,
  })

  const expensesData: Expense[] = Array.isArray(expenses) ? expenses : []
  const tripsData: Trip[] = Array.isArray(trips) ? trips : []
  const participantsData: Participant[] = Array.isArray(participants)
    ? participants
    : []

  const createMutation = useMutation({
    mutationFn: (data: CreateExpenseDto) => expenseApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      setIsCreating(false)
      resetForm()
    },
    onError: (error) => {
      console.error('Failed to create expense:', error)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateExpenseDto }) =>
      expenseApi.update(id, {
        ...data,
        updatedAt: new Date().toISOString(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      setEditingId(null)
      resetForm()
    },
    onError: (error) => {
      console.error('Failed to update expense:', error)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: expenseApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
    },
    onError: (error) => {
      console.error('Failed to delete expense:', error)
    },
  })

  const resetForm = () => {
    setFormData({
      title: '',
      amount: 0,
      category: ExpenseCategory.OTHER,
      currency: 'USD',
      quantity: 1,
      recipientName: '',
      recipientIban: '',
      note: '',
      tripId: tripIdParam ? Number(tripIdParam) : undefined,
      participantId: undefined,
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim() || (formData.amount || 0) <= 0) {
      return
    }

    const submitData = {
      ...formData,
      title: formData.title.trim(),
      recipientName: formData.recipientName?.trim() || '',
      recipientIban: formData.recipientIban?.trim() || '',
      note: formData.note?.trim() || '',
      tripId: formData.tripId || undefined,
      participantId: formData.participantId || undefined,
    }

    if (editingId) {
      updateMutation.mutate({ id: editingId, data: submitData })
    } else {
      createMutation.mutate(submitData)
    }
  }

  const startEdit = (expense: Expense) => {
    setEditingId(expense.id)
    setFormData({
      title: expense.title,
      amount: expense.amount,
      category: expense.category,
      currency: expense.currency,
      quantity: expense.quantity || 1,
      recipientName: expense.recipientName || '',
      recipientIban: expense.recipientIban || '',
      note: expense.note || '',
      tripId: expense.tripId || undefined,
      participantId: expense.participantId || undefined,
    })
    setIsCreating(false)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setIsCreating(false)
    resetForm()
  }

  const getDisplayName = (
    expense: Expense
  ): { tripName?: string; participantName?: string } => {
    let tripName = undefined
    let participantName = undefined

    if (expense.tripId) {
      const trip = tripsData.find((t) => t.id === expense.tripId)
      tripName = trip?.title
    }

    if (expense.participantId) {
      const participant = participantsData.find(
        (p) => p.id === expense.participantId
      )
      participantName = participant
        ? `${participant.name} ${participant.surname}`
        : undefined
    }

    return { tripName, participantName }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Receipt size={32} />
            Expenses
          </h1>
          <p className="text-muted-foreground">
            Track and manage your travel expenses
          </p>
        </div>
        <Button
          onClick={() => setIsCreating(true)}
          disabled={isCreating || editingId !== null}
        >
          <Plus size={16} className="mr-2" />
          Add Expense
        </Button>
      </div>

      {(isCreating || editingId !== null) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {editingId ? 'Edit Expense' : 'Create New Expense'}
              <Button variant="ghost" size="sm" onClick={cancelEdit}>
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Title *
                  </label>
                  <Input
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Expense description"
                    required
                    maxLength={255}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        category: e.target.value as ExpenseCategory,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    {enumUtils.getAllExpenseCategories().map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Amount *
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        amount: e.target.value ? Number(e.target.value) : 0,
                      })
                    }
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Currency
                  </label>
                  <Input
                    value={formData.currency}
                    onChange={(e) =>
                      setFormData({ ...formData, currency: e.target.value })
                    }
                    placeholder="USD"
                    maxLength={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Quantity
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.quantity || 1}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        quantity: e.target.value ? parseInt(e.target.value) : 1,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Recipient Name
                  </label>
                  <Input
                    value={formData.recipientName || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        recipientName: e.target.value,
                      })
                    }
                    placeholder="Who received the payment"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Recipient IBAN
                  </label>
                  <Input
                    value={formData.recipientIban || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        recipientIban: e.target.value,
                      })
                    }
                    placeholder="Bank account number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Trip</label>
                  <select
                    value={formData.tripId || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tripId: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select a trip</option>
                    {tripsData.map((trip) => (
                      <option key={trip.id} value={trip.id}>
                        {trip.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Participant
                  </label>
                  <select
                    value={formData.participantId || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        participantId: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select a participant</option>
                    {participantsData.map((participant) => (
                      <option key={participant.id} value={participant.id}>
                        {participant.name} {participant.surname}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea
                  value={formData.note || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, note: e.target.value })
                  }
                  placeholder="Additional details about this expense..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={
                    createMutation.isPending ||
                    updateMutation.isPending ||
                    !formData.title.trim() ||
                    (formData.amount || 0) <= 0
                  }
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      {editingId ? 'Updating...' : 'Creating...'}
                    </>
                  ) : editingId ? (
                    'Update'
                  ) : (
                    'Create'
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={cancelEdit}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {expensesData.length === 0 && !isCreating && (
        <Card>
          <CardContent className="text-center py-8">
            <Receipt className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No expenses yet
            </h3>
            <p className="text-gray-600 mb-4">
              Start tracking your travel expenses
            </p>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Expense
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {expensesData.map((expense) => {
          const { tripName, participantName } = getDisplayName(expense)

          return (
            <Card
              key={expense.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold truncate">
                      {expense.title}
                    </div>
                    <div className="text-lg font-bold text-green-600 mt-1">
                      {formatCurrency(expense.amount)}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => startEdit(expense)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteMutation.mutate(expense.id)}
                      disabled={deleteMutation.isPending}
                    >
                      {deleteMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                    {enumUtils.getExpenseCategoryLabel(expense.category)}
                  </div>

                  {expense.quantity && expense.quantity > 1 && (
                    <div className="flex justify-between">
                      <span>Quantity:</span>
                      <span className="font-medium">{expense.quantity}</span>
                    </div>
                  )}

                  {expense.recipientName && (
                    <div className="flex justify-between">
                      <span>Recipient:</span>
                      <span className="font-medium truncate ml-2 max-w-[120px]">
                        {expense.recipientName}
                      </span>
                    </div>
                  )}

                  {tripName && (
                    <div className="flex justify-between">
                      <span>Trip:</span>
                      <span className="font-medium truncate ml-2 max-w-[120px]">
                        {tripName}
                      </span>
                    </div>
                  )}

                  {participantName && (
                    <div className="flex justify-between">
                      <span>Participant:</span>
                      <span className="font-medium truncate ml-2 max-w-[120px]">
                        {participantName}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>Date:</span>
                    <span className="font-medium">
                      {formatDate(expense.createdAt)}
                    </span>
                  </div>

                  {expense.note && (
                    <div className="pt-2 border-t border-gray-200">
                      <p className="text-sm italic text-gray-600">
                        &quot;{expense.note}&quot;
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
