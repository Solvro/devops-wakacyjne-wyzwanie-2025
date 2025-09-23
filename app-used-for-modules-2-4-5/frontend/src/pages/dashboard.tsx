import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useQuery } from '@tanstack/react-query'
import {
  participantApi,
  tripApi,
  expenseApi,
  activityApi,
  enumUtils,
  Trip,
  Expense,
  Activity,
  Participant,
} from '@/lib/api'
import { useRouter } from 'next/router'
import { formatDate } from '@/lib/utils'
import { useAuth } from '@/components/contexts/AuthContext'

interface TripStats {
  daysLeft: number
  budgetLeft: number
}

export default function Dashboard() {
  const router = useRouter()
  const { isAuthenticated, loading, user } = useAuth()

  const recommendations = {
    nextPlace: '',
    nextActivity: '',
    nextFood: '',
    nextEvent: '',
  }

  const { data: participants } = useQuery<Participant[]>({
    queryKey: ['participants'],
    queryFn: () => participantApi.getAll(),
    enabled: isAuthenticated,
  })

  const { data: trips } = useQuery<Trip[]>({
    queryKey: ['trips'],
    queryFn: () => tripApi.getAll(),
    enabled: isAuthenticated,
  })

  const { data: expenses } = useQuery<Expense[]>({
    queryKey: ['expenses'],
    queryFn: () => expenseApi.getAll(),
    enabled: isAuthenticated,
  })

  const { data: activities } = useQuery<Activity[]>({
    queryKey: ['activities'],
    queryFn: () => activityApi.getAll(),
    enabled: isAuthenticated,
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }
  if (!isAuthenticated) {
    return null
  }
  const participantsData = participants || []
  const tripsData = trips || []
  const expensesData = expenses || []
  const activitiesData = activities || []
  const currentTrip = tripsData[0] || ({} as Trip)
  const currentActivity = activitiesData[0] || ({} as Activity)
  const calculateTripStats = (trip: Trip): TripStats => {
    if (!trip.startDate || !trip.endDate)
      return { daysLeft: 0, budgetLeft: trip.budget || 0 }
    const now = new Date()
    const end = new Date(trip.endDate)
    const daysLeft = Math.max(
      0,
      Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    )
    const tripExpenses = expensesData.filter(
      (expense: Expense) => expense.tripId === trip.id
    )
    const totalSpent = tripExpenses.reduce(
      (sum: number, expense: Expense) => sum + Number(expense.amount),
      0
    )
    const budgetLeft = (trip.budget || 0) - totalSpent
    return { daysLeft, budgetLeft }
  }
  const tripStats = calculateTripStats(currentTrip)
  const formatActivityTimespan = (activity: Activity): string => {
    if (!activity.startDate || !activity.endDate) return 'Not set'
    const start = new Date(activity.startDate).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })
    const end = new Date(activity.endDate).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })
    return `${start} - ${end}`
  }
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="mb-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-bold">
                    CURRENT ACTIVITY
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div className="grid gap-3">
                    <div className="grid grid-cols-2">
                      <label className="text-xs text-gray-500 uppercase">
                        Title
                      </label>
                      <div className="text-sm font-medium">
                        {currentActivity?.name || 'No current activity'}
                      </div>
                    </div>
                    <div className="grid grid-cols-2">
                      <label className="text-xs text-gray-500 uppercase">
                        Place
                      </label>
                      <div className="text-sm">
                        {currentActivity?.place || 'Not set'}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2">
                      <label className="text-xs text-gray-500 uppercase">
                        Timespan
                      </label>
                      <div className="text-sm">
                        {formatActivityTimespan(currentActivity)}
                      </div>
                    </div>
                    <div className="grid grid-cols-2">
                      <label className="text-xs text-gray-500 uppercase">
                        Category
                      </label>
                      <div className="text-sm">
                        {currentActivity?.category
                          ? enumUtils.getActivityCategoryLabel(
                              currentActivity.category
                            )
                          : 'Unknown'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-bold">
                    CURRENT TRIP
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="grid grid-cols-2">
                      <label className="text-xs text-gray-500 uppercase">
                        Title
                      </label>
                      <div className="text-sm">
                        {currentTrip?.title || 'No active trip'}
                      </div>
                    </div>
                    <div className="grid grid-cols-2">
                      <label className="text-xs text-gray-500 uppercase">
                        Category
                      </label>
                      <div className="text-sm">
                        {currentTrip?.category
                          ? enumUtils.getTripCategoryLabel(currentTrip.category)
                          : 'None'}
                      </div>
                    </div>
                    <div className="grid grid-cols-2">
                      <label className="text-xs text-gray-500 uppercase">
                        Budget Left
                      </label>
                      <div className="text-sm">{tripStats.budgetLeft} PLN</div>
                    </div>
                    <div className="grid grid-cols-2">
                      <label className="text-xs text-gray-500 uppercase">
                        Days Left
                      </label>
                      <div className="text-sm">{tripStats.daysLeft} days</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-bold">
                    NEXT ACTIVITIES
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 max-h-64 overflow-y-auto">
                  {activitiesData
                    .filter(
                      (activity: Activity) =>
                        activity.startDate &&
                        new Date(activity.startDate) > new Date()
                    )
                    .sort(
                      (a: Activity, b: Activity) =>
                        new Date(a.startDate!).getTime() -
                        new Date(b.startDate!).getTime()
                    )
                    .slice(0, 2)
                    .map((activity: Activity) => (
                      <div
                        key={activity.id}
                        className="border rounded-lg p-3 bg-white"
                      >
                        <div className="text-sm font-medium mb-1">
                          {activity.name}
                        </div>
                        <div className="text-xs text-gray-500 space-y-1">
                          <div>Place: {activity.place || 'Not set'}</div>
                          <div>Date: {formatDate(activity.startDate!)}</div>
                        </div>
                      </div>
                    ))}
                  {activitiesData.filter(
                    (activity: Activity) =>
                      activity.startDate &&
                      new Date(activity.startDate) > new Date()
                  ).length === 0 && (
                    <div className="text-sm text-gray-500 italic text-center py-8">
                      No upcoming activities
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            <div className="mb-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-bold">
                    LOCAL RECOMMENDATIONS
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2">
                    <label className="text-xs text-gray-500 uppercase">
                      Next Place
                    </label>
                    <div className="text-sm mt-1">
                      {recommendations?.nextPlace || 'No recommendation'}
                    </div>
                  </div>

                  <div className="grid grid-cols-2">
                    <label className="text-xs text-gray-500 uppercase">
                      Next Food
                    </label>
                    <div className="text-sm mt-1">
                      {recommendations?.nextPlace || 'No recommendation'}
                    </div>
                  </div>
                  <div className="grid grid-cols-2">
                    <label className="text-xs text-gray-500 uppercase">
                      Next Event
                    </label>
                    <div className="text-sm mt-1">
                      {recommendations?.nextEvent || 'No recommendation'}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-bold">
                  RECENT EXPENSES
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 max-h-256 overflow-y-auto">
                {expensesData.slice(0, 6).map((expense: Expense) => (
                  <div
                    key={expense.id}
                    className="border rounded-lg p-3 bg-white"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-sm font-medium">{expense.title}</div>
                      <div className="text-sm font-bold">
                        {expense.amount} PLN
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 space-y-1">
                      <div>
                        Category:{' '}
                        {enumUtils.getExpenseCategoryLabel(expense.category)}
                      </div>
                      <div>Date: {formatDate(expense.createdAt)}</div>
                    </div>
                  </div>
                ))}
                {expensesData.length === 0 && (
                  <div className="text-sm text-gray-500 italic text-center py-8">
                    No expenses recorded yet
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
