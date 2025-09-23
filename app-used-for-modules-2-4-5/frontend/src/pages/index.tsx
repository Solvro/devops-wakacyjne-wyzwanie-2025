import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter } from 'next/router'

export default function Home() {
  const router = useRouter()

  const recommendations = {
    nextPlace: '',
    nextFood: '',
    nextEvent: '',
  }

  return (
    <div className="bg-gray-50">
      <div className="flex">
        <main className="flex-1 p-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="grid grid-cols-2 gap-6">
                <div className="lg:row-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg font-bold">
                        LOCAL WEATHER
                      </CardTitle>
                    </CardHeader>
                  </Card>
                </div>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-bold">
                      LOCAL MAP
                    </CardTitle>
                  </CardHeader>
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
                        {recommendations?.nextFood || 'No recommendation'}
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
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-bold">
                    LOCAL NEWS
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 max-h-128 overflow-y-auto"></CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
