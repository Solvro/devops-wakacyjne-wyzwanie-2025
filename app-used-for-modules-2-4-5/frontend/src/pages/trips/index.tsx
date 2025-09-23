import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  tripApi,
  type Trip,
  type CreateTripDto,
  type UpdateTripDto,
  TripCategory,
  enumUtils,
} from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Plus,
  Edit2,
  Trash2,
  MapPin,
  Calendar,
  Users,
  Receipt,
  X,
} from 'lucide-react'
import Link from 'next/link'
import { formatDate, formatCurrency } from '@/lib/utils'

export default function TripsPage() {
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState<CreateTripDto>({
    title: '',
    category: TripCategory.OTHER,
    destination: '',
    budget: undefined,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    accommodation: '',
    travelTime: undefined,
    travelDistance: undefined,
    note: '',
  })

  const queryClient = useQueryClient()

  const { data: trips, isLoading } = useQuery({
    queryKey: ['trips'],
    queryFn: () => tripApi.getAll({ include: 'participants,expenses' }),
  })

  const createMutation = useMutation({
    mutationFn: (data: CreateTripDto) => tripApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] })
      setIsCreating(false)
      resetForm()
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateTripDto }) =>
      tripApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] })
      setEditingId(null)
      resetForm()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: tripApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] })
    },
  })

  const resetForm = () => {
    setFormData({
      title: '',
      category: TripCategory.OTHER,
      destination: '',
      budget: undefined,
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      accommodation: '',
      travelTime: undefined,
      travelDistance: undefined,
      note: '',
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingId) {
      updateMutation.mutate({
        id: editingId,
        data: {
          ...formData,
          updatedAt: new Date().toISOString(),
        },
      })
    } else {
      createMutation.mutate(formData)
    }
  }

  const startEdit = (trip: Trip) => {
    setEditingId(trip.id)
    setFormData({
      title: trip.title,
      category: trip.category,
      destination: trip.destination || '',
      budget: trip.budget || undefined,
      startDate:
        trip.startDate?.split('T')[0] || new Date().toISOString().split('T')[0],
      endDate: trip.endDate?.split('T')[0] || '',
      accommodation: trip.accommodation || '',
      travelTime: trip.travelTime || undefined,
      travelDistance: trip.travelDistance || undefined,
      note: trip.note || '',
    })
    setIsCreating(false)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setIsCreating(false)
    resetForm()
  }

  const calculateTripDuration = (
    startDate?: string,
    endDate?: string
  ): number | null => {
    if (!startDate || !endDate) return null
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  const tripsData: Trip[] = Array.isArray(trips) ? trips : []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <MapPin size={32} />
            Trips
          </h1>
          <p className="text-muted-foreground">
            Manage your travel adventures and itineraries
          </p>
        </div>
        <Button
          onClick={() => setIsCreating(true)}
          disabled={isCreating || editingId !== null}
        >
          <Plus size={16} className="mr-2" />
          Add Trip
        </Button>
      </div>

      {(isCreating || editingId !== null) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {editingId ? 'Edit Trip' : 'Create New Trip'}
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
                    Trip Title *
                  </label>
                  <Input
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Trip name"
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
                        category: e.target.value as TripCategory,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    {enumUtils.getAllTripCategories().map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Destination
                  </label>
                  <Input
                    value={formData.destination}
                    onChange={(e) =>
                      setFormData({ ...formData, destination: e.target.value })
                    }
                    placeholder="Where are you going?"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Budget
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.budget || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        budget: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      })
                    }
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Start Date
                  </label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    End Date
                  </label>
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Accommodation
                  </label>
                  <Input
                    value={formData.accommodation}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        accommodation: e.target.value,
                      })
                    }
                    placeholder="Where you'll stay"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Travel Time (hours)
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.travelTime || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        travelTime: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      })
                    }
                    placeholder="0.0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Travel Distance (km)
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.travelDistance || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        travelDistance: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      })
                    }
                    placeholder="0.0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea
                  value={formData.note}
                  onChange={(e) =>
                    setFormData({ ...formData, note: e.target.value })
                  }
                  placeholder="Additional notes about the trip..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={
                    createMutation.isPending || updateMutation.isPending
                  }
                >
                  {editingId ? 'Update' : 'Create'}
                </Button>
                <Button type="button" variant="outline" onClick={cancelEdit}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {tripsData.length === 0 && !isCreating && (
        <Card>
          <CardContent className="text-center py-8">
            <MapPin className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No trips yet
            </h3>
            <p className="text-gray-600 mb-4">
              Start planning your next adventure
            </p>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Plan Your First Trip
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tripsData.map((trip) => {
          const duration = calculateTripDuration(trip.startDate, trip.endDate)
          const totalExpenses =
            trip.expenses?.reduce(
              (sum, expense) => sum + (expense.amount || 0),
              0
            ) || 0

          return (
            <Card key={trip.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{trip.title}</div>
                    <div className="text-sm text-gray-500">
                      {enumUtils.getTripCategoryLabel(trip.category)}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => startEdit(trip)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteMutation.mutate(trip.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {trip.destination && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span>{trip.destination}</span>
                    </div>
                  )}
                  {trip.startDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>
                        {formatDate(trip.startDate)}
                        {trip.endDate && ` - ${formatDate(trip.endDate)}`}
                        {duration && ` (${duration} days)`}
                      </span>
                    </div>
                  )}
                  {trip.participants && trip.participants.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span>{trip.participants.length} participants</span>
                    </div>
                  )}
                  {(trip.budget || totalExpenses > 0) && (
                    <div className="flex items-center gap-2">
                      <Receipt className="h-4 w-4 text-gray-400" />
                      <span>
                        {totalExpenses > 0 &&
                          `Spent: ${formatCurrency(totalExpenses)}`}
                        {trip.budget && totalExpenses > 0 && ' / '}
                        {trip.budget &&
                          `Budget: ${formatCurrency(trip.budget)}`}
                      </span>
                    </div>
                  )}
                  {trip.note && (
                    <div>
                      <span className="font-medium">Notes:</span>
                      <p className="text-gray-600 mt-1">{trip.note}</p>
                    </div>
                  )}
                </div>
                <div className="mt-4 pt-4 border-t">
                  <Link href={`/trips/${trip.id}`}>
                    <Button variant="outline" size="sm" className="w-full">
                      View Details
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
