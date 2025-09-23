import { useState } from 'react'
import { useRouter } from 'next/router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  participantApi,
  tripApi,
  expenseApi,
  activityApi,
  type Activity as ApiActivity,
  ActivityCategory,
  enumUtils,
  type Trip,
  type Participant,
  type Expense,
} from '@/lib/api'

type Activity = ApiActivity & { note?: string }
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Plus, Edit, Trash2, Calendar } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default function ActivitiesPage() {
  const router = useRouter()
  const { trip: tripIdParam } = router.query

  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    place: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    category: ActivityCategory.OTHER,
    note: '',
    tripId: tripIdParam ? String(tripIdParam) : '',
    participantsIds: [] as string[],
    expensesIds: [] as string[],
  })

  const queryClient = useQueryClient()

  const { data: activities, isLoading } = useQuery({
    queryKey: ['activities'],
    queryFn: () => activityApi.getAll(),
    select: (response) => {
      if (Array.isArray(response)) return response
      if (response?.data && Array.isArray(response.data)) return response.data
      if (response?.data?.data && Array.isArray(response.data.data))
        return response.data.data
      return []
    },
  })

  const { data: participants } = useQuery({
    queryKey: ['participants'],
    queryFn: () => participantApi.getAll(),
    enabled: isCreating || editingId !== null,
    select: (response) => {
      if (Array.isArray(response)) return response
      if (response?.data && Array.isArray(response.data)) return response.data
      if (response?.data?.data && Array.isArray(response.data.data))
        return response.data.data
      return []
    },
  })

  const { data: trips } = useQuery({
    queryKey: ['trips'],
    queryFn: () => tripApi.getAll(),
    enabled: isCreating || editingId !== null,
    select: (response) => {
      if (Array.isArray(response)) return response
      if (response?.data && Array.isArray(response.data)) return response.data
      if (response?.data?.data && Array.isArray(response.data.data))
        return response.data.data
      return []
    },
  })

  const { data: expenses } = useQuery({
    queryKey: ['expenses'],
    queryFn: () => expenseApi.getAll(),
    enabled: isCreating || editingId !== null,
    select: (response) => {
      if (Array.isArray(response)) return response
      if (response?.data && Array.isArray(response.data)) return response.data
      if (response?.data?.data && Array.isArray(response.data.data))
        return response.data.data
      return []
    },
  })

  type ActivityInput = {
    name: string
    place?: string
    startDate?: string
    endDate?: string
    category: ActivityCategory
    note?: string
    tripId?: string
    participantsIds?: string[]
    expenseIds?: string[]
  }

  const createMutation = useMutation({
    mutationFn: (data: ActivityInput) =>
      activityApi.create({
        ...data,
        tripId: data.tripId ? parseInt(data.tripId) : undefined,
        participantsIds: data.participantsIds
          ? data.participantsIds.map((id) => parseInt(id))
          : undefined,
        expensesIds: data.expenseIds
          ? data.expenseIds.map((id) => parseInt(id))
          : undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] })
      setIsCreating(false)
      resetForm()
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ActivityInput }) =>
      activityApi.update(id, {
        ...data,
        tripId: data.tripId ? parseInt(data.tripId) : undefined,
        participantsIds: data.participantsIds
          ? data.participantsIds.map((id) => parseInt(id))
          : undefined,
        expensesIds: data.expenseIds
          ? data.expenseIds.map((id) => parseInt(id))
          : undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] })
      setEditingId(null)
      resetForm()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: activityApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] })
    },
  })

  const resetForm = () => {
    setFormData({
      name: '',
      place: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      category: ActivityCategory.OTHER,
      note: '',
      tripId: tripIdParam ? String(tripIdParam) : '',
      participantsIds: [],
      expensesIds: [],
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  const startEdit = (activity: Activity) => {
    setEditingId(activity.id)
    setFormData({
      name: activity.name,
      place: activity.place || '',
      startDate: activity.startDate
        ? activity.startDate.split('T')[0]
        : new Date().toISOString().split('T')[0],
      endDate: activity.endDate ? activity.endDate.split('T')[0] : '',
      category: activity.category,
      note: activity.note || '',
      tripId: activity.tripId ? String(activity.tripId) : '',
      participantsIds: activity.participantsIds
        ? activity.participantsIds.map((id) => String(id))
        : [],
      expensesIds: activity.expensesIds
        ? activity.expensesIds.map((id) => String(id))
        : [],
    })
    setIsCreating(false)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setIsCreating(false)
    resetForm()
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  const activitiesData = activities || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Calendar size={32} />
            Activities
          </h1>
          <p className="text-muted-foreground">
            Track activities for trips and participants
          </p>
        </div>
        <Button
          onClick={() => setIsCreating(true)}
          disabled={isCreating || editingId !== null}
        >
          <Plus size={16} className="mr-2" />
          Add Activity
        </Button>
      </div>

      {(isCreating || editingId !== null) && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingId ? 'Edit Activity' : 'Create New Activity'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium mb-1"
                >
                  Name
                </label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="place"
                  className="block text-sm font-medium mb-1"
                >
                  Place
                </label>
                <Input
                  id="place"
                  value={formData.place}
                  onChange={(e) =>
                    setFormData({ ...formData, place: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="startDate"
                    className="block text-sm font-medium mb-1"
                  >
                    Start Date
                  </label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label
                    htmlFor="endDate"
                    className="block text-sm font-medium mb-1"
                  >
                    End Date
                  </label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-medium mb-1"
                >
                  Category
                </label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      category: e.target.value as ActivityCategory,
                    })
                  }
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  required
                >
                  {enumUtils.getAllActivityCategories().map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="note"
                  className="block text-sm font-medium mb-1"
                >
                  Note
                </label>
                <Input
                  id="note"
                  value={formData.note}
                  onChange={(e) =>
                    setFormData({ ...formData, note: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="tripId"
                    className="block text-sm font-medium mb-1"
                  >
                    Trip
                  </label>
                  <select
                    id="tripId"
                    value={formData.tripId}
                    onChange={(e) =>
                      setFormData({ ...formData, tripId: e.target.value })
                    }
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="">Select a trip</option>
                    {trips?.map((trip: Trip) => (
                      <option key={trip.id} value={trip.id}>
                        {trip.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="participantId"
                    className="block text-sm font-medium mb-1"
                  >
                    Participant
                  </label>
                  <select
                    id="participantsIds"
                    value={formData.participantsIds[0] || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        participantsIds: e.target.value ? [e.target.value] : [],
                      })
                    }
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="">Select a participant</option>
                    {participants?.map((participant: Participant) => (
                      <option key={participant.id} value={participant.id}>
                        {participant.name} {participant.surname}
                      </option>
                    ))}
                  </select>
                  <select
                    id="expensesIds"
                    value={formData.expensesIds[0] || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        expensesIds: e.target.value ? [e.target.value] : [],
                      })
                    }
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="">Select an expense</option>
                    {expenses?.map((expense: Expense) => (
                      <option key={expense.id} value={expense.id}>
                        {expense.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit">{editingId ? 'Update' : 'Create'}</Button>
                <Button type="button" variant="outline" onClick={cancelEdit}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {activitiesData.map((activity: Activity) => (
          <Card key={activity.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{activity.name}</span>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => startEdit(activity)}
                  >
                    <Edit size={14} />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteMutation.mutate(activity.id)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm font-medium text-blue-600">
                  {enumUtils.getActivityCategoryLabel(activity.category)}
                </div>
                {activity.place && (
                  <div className="text-sm text-muted-foreground">
                    Place: {activity.place}
                  </div>
                )}
                <div className="text-xs text-muted-foreground space-y-1">
                  {activity.startDate && (
                    <p>Start: {formatDate(activity.startDate)}</p>
                  )}
                  {activity.endDate && (
                    <p>End: {formatDate(activity.endDate)}</p>
                  )}
                  {activity.tripId && <p>Trip ID: {activity.tripId}</p>}
                  {activity.participantsIds && (
                    <p>Participant ID: {activity.participantsIds}</p>
                  )}
                  {activity.note && (
                    <p className="mt-2 text-sm">{activity.note}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {activitiesData.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar
              size={48}
              className="mx-auto text-muted-foreground mb-4"
            />
            <h3 className="text-lg font-semibold mb-2">No activities yet</h3>
            <p className="text-muted-foreground mb-4">
              Start tracking activities for your trips.
            </p>
            <Button onClick={() => setIsCreating(true)}>
              <Plus size={16} className="mr-2" />
              Add First Activity
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
