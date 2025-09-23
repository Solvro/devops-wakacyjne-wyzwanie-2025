import { useRouter } from 'next/router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  tripApi,
  participantApi,
  expenseApi,
  type Trip,
  type Participant,
  type Expense,
} from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft,
  Users,
  Receipt,
  DollarSign,
  Plus,
  Trash2,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import Link from 'next/link'
import { formatDate, formatCurrency } from '@/lib/utils'
import { useState } from 'react'

export default function TripDetailPage() {
  const router = useRouter()
  const { id } = router.query
  const queryClient = useQueryClient()

  const [showAddParticipant, setShowAddParticipant] = useState(false)
  const [participantToRemove, setParticipantToRemove] = useState<number | null>(
    null
  )

  const {
    data: trip,
    isLoading: tripLoading,
    error: tripError,
  } = useQuery({
    queryKey: ['trip', id],
    queryFn: () => tripApi.getById(Number(id)),
    enabled: !!id,
  })

  const { data: participants, isLoading: participantsLoading } = useQuery({
    queryKey: ['trip-participants', id],
    queryFn: () => participantApi.getByTrip(Number(id)),
    enabled: !!id,
  })

  const { data: expenses, isLoading: expensesLoading } = useQuery({
    queryKey: ['trip-expenses', id],
    queryFn: () => expenseApi.getByTrip(Number(id)),
    enabled: !!id,
  })

  const { data: allParticipants, isLoading: allParticipantsLoading } = useQuery(
    {
      queryKey: ['participants'],
      queryFn: () => participantApi.getAll(),
      enabled: showAddParticipant,
    }
  )

  const addParticipantMutation = useMutation({
    mutationFn: ({
      tripId,
      participantId,
    }: {
      tripId: number
      participantId: number
    }) => tripApi.addParticipant(tripId, participantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip-participants', id] })
      setShowAddParticipant(false)
    },
  })

  const removeParticipantMutation = useMutation({
    mutationFn: ({
      tripId,
      participantId,
    }: {
      tripId: number
      participantId: number
    }) => tripApi.removeParticipant(tripId, participantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip-participants', id] })
      setParticipantToRemove(null)
    },
  })

  if (tripLoading || participantsLoading || expensesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (tripError || !trip?.data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Trip not found
          </h1>
          <p className="text-gray-600 mb-4">
            The trip you&apos;re looking for doesn&apos;t exist.
          </p>
          <Button onClick={() => router.push('/')}>Go Back Home</Button>
        </div>
      </div>
    )
  }

  const totalExpenses =
    expenses?.data?.reduce(
      (sum: number, expense: Expense) =>
        sum + Number.parseFloat(String(expense.amount)),
      0
    ) || 0

  const availableParticipants =
    allParticipants?.data?.filter(
      (p: Participant) =>
        !participants?.data?.some((tp: Participant) => tp.id === p.id)
    ) || []

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="rounded-full"
          >
            <ArrowLeft size={16} />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {trip.data.name}
            </h1>
            <p className="text-gray-600 mt-1">
              {formatDate(trip.data.startDate)} -{' '}
              {formatDate(trip.data.endDate)}
            </p>
            {trip.data.description && (
              <p className="text-gray-600 mt-2">{trip.data.description}</p>
            )}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Participants
              </CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {participants?.data?.length || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Expenses
              </CardTitle>
              <Receipt className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {expenses?.data?.length || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Amount
              </CardTitle>
              <DollarSign className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(totalExpenses)}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users size={20} className="text-blue-500" />
                Participants ({participants?.data?.length || 0})
              </CardTitle>
              <Button
                size="sm"
                onClick={() => setShowAddParticipant(!showAddParticipant)}
                className="rounded-md"
              >
                <Plus size={16} />
              </Button>
            </CardHeader>
            <CardContent>
              {showAddParticipant && (
                <div className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <h4 className="font-medium mb-3 text-gray-900">
                    Add Participant
                  </h4>
                  {allParticipantsLoading ? (
                    <div className="flex justify-center py-2">
                      <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
                    </div>
                  ) : availableParticipants.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      No available participants to add
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {availableParticipants.map((participant: Participant) => (
                        <div
                          key={participant.id}
                          className="flex items-center justify-between p-2 bg-white rounded-md border"
                        >
                          <span className="text-sm text-gray-900">
                            {participant.name}
                          </span>
                          <Button
                            size="sm"
                            onClick={() =>
                              addParticipantMutation.mutate({
                                tripId: Number(id),
                                participantId: participant.id,
                              })
                            }
                            disabled={addParticipantMutation.isPending}
                            className="rounded-md"
                          >
                            {addParticipantMutation.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              'Add'
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {participants?.data?.length === 0 ? (
                <div className="text-center py-6">
                  <Users className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">No participants yet</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 rounded-md"
                    onClick={() => setShowAddParticipant(true)}
                  >
                    Add Participants
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {participants?.data?.map((participant: Participant) => (
                    <div
                      key={participant.id}
                      className="flex items-center justify-between border border-gray-200 rounded-lg p-3 bg-white"
                    >
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {participant.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {participant.email}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/participants/${participant.id}`}>
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-md"
                          >
                            View
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setParticipantToRemove(participant.id)}
                          className="rounded-md"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Receipt size={20} className="text-green-500" />
                Expenses ({expenses?.data?.length || 0})
              </CardTitle>
              <Link href={`/expenses?trip=${id}`}>
                <Button size="sm" className="rounded-md">
                  <Plus size={16} />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {expenses?.data?.length === 0 ? (
                <div className="text-center py-6">
                  <Receipt className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">No expenses yet</p>
                  <Link href={`/expenses?trip=${id}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 rounded-md"
                    >
                      Add Expense
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {expenses?.data?.map((expense: Expense) => (
                    <div
                      key={expense.id}
                      className="border border-gray-200 rounded-lg p-3 bg-white"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900">
                          {expense.title}
                        </h4>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(expense.amount)}
                        </span>
                      </div>
                      {expense.note && (
                        <p className="text-sm text-gray-600 mt-1">
                          {expense.note}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {participantToRemove && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Remove Participant
            </h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to remove this participant from the trip?
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setParticipantToRemove(null)}
                className="rounded-md"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() =>
                  removeParticipantMutation.mutate({
                    tripId: Number(id),
                    participantId: participantToRemove,
                  })
                }
                disabled={removeParticipantMutation.isPending}
                className="rounded-md"
              >
                {removeParticipantMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Removing...
                  </>
                ) : (
                  'Remove'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
