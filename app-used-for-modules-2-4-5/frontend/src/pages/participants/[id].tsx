import { useRouter } from 'next/router'
import { useQuery } from '@tanstack/react-query'
import {
  participantApi,
  tripApi,
  expenseApi,
  type Participant,
  type Trip,
  type Expense,
} from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft,
  MapPin,
  Receipt,
  DollarSign,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'

export default function ParticipantDetailPage() {
  const router = useRouter()
  const { id } = router.query

  const {
    data: participant,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['participant', id],
    queryFn: () => participantApi.getById(Number(id)),
    enabled: !!id,
  })

  const { data: trips, isLoading: tripsLoading } = useQuery({
    queryKey: ['participant-trips', id],
    queryFn: () => tripApi.getByParticipant(Number(id)),
    enabled: !!id,
  })

  const { data: expenses, isLoading: expensesLoading } = useQuery({
    queryKey: ['participant-expenses', id],
    queryFn: () => expenseApi.getByParticipant(Number(id)),
    enabled: !!id,
  })

  if (isLoading || tripsLoading || expensesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (error || !participant?.data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Participant not found
          </h1>
          <p className="text-gray-600 mb-4">
            The participant you&apos;re looking for doesn&apos;t exist.
          </p>
          <Button onClick={() => router.push('/participants')}>
            Back to Participants
          </Button>
        </div>
      </div>
    )
  }

  const totalExpenses =
    expenses?.data?.reduce(
      (sum: number, expense: Expense) =>
        sum + parseFloat(String(expense.amount)),
      0
    ) || 0

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
              {participant.data.name}
            </h1>
            <p className="text-gray-600 mt-1">{participant.data.email}</p>
            {participant.data.surname && (
              <p className="text-gray-600">{participant.data.surname}</p>
            )}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Trips</CardTitle>
              <MapPin className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {trips?.data?.length || 0}
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
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin size={20} className="text-blue-500" />
                Trips ({trips?.data?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {trips?.data?.length === 0 ? (
                <div className="text-center py-6">
                  <MapPin className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">No trips yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {trips?.data?.map((trip: Trip) => (
                    <div
                      key={trip.id}
                      className="border border-gray-200 rounded-lg p-3 bg-white"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900">
                          {trip.title}
                        </h4>
                        <Link href={`/trips/${trip.id}`}>
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-md"
                          >
                            View
                          </Button>
                        </Link>
                      </div>
                      {trip.note && (
                        <p className="text-sm text-gray-600 mt-1">
                          {trip.note}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Receipt size={20} className="text-green-500" />
                Expenses ({expenses?.data?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {expenses?.data?.length === 0 ? (
                <div className="text-center py-6">
                  <Receipt className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">No expenses yet</p>
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
    </div>
  )
}
