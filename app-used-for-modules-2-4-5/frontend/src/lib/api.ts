import axios from 'axios'

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://budzetownik-dev.local/api'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const healthCheck = {
  checkBackend: () => api.get('/wakacyjne/health').then((res) => res.data),
  checkFrontend: () => {
    if (typeof window !== 'undefined') {
      return Promise.resolve({
        status: 'ok',
        service: 'frontend',
        timestamp: new Date().toISOString(),
      })
    }
    return Promise.resolve({
      status: 'ok',
      service: 'frontend',
      timestamp: new Date().toISOString(),
    })
  },
}

export enum ParticipantRole {
  ORGANIZER = 'ORGANIZER',
  PARTICIPANT = 'PARTICIPANT',
  GUEST = 'GUEST',
  DRIVER = 'DRIVER',
  VOLUNTEER = 'VOLUNTEER',
  OTHER = 'OTHER',
}

export enum TripCategory {
  BUSINESS = 'BUSINESS',
  VACATION = 'VACATION',
  FAMILY = 'FAMILY',
  PERSONAL = 'PERSONAL',
  WEEKEND = 'WEEKEND',
  OTHER = 'OTHER',
}

export enum ExpenseCategory {
  ACCOMMODATION = 'ACCOMMODATION',
  TRANSPORT = 'TRANSPORT',
  FOOD = 'FOOD',
  HEALTH = 'HEALTH',
  UTILITIES = 'UTILITIES',
  SHOPPING = 'SHOPPING',
  INSURANCE = 'INSURANCE',
  ENTERTAINMENT = 'ENTERTAINMENT',
  GIFT = 'GIFT',
  OTHER = 'OTHER',
}

export enum ActivityCategory {
  SIGHTSEEING = 'SIGHTSEEING',
  RELAXATION = 'RELAXATION',
  CULTURE = 'CULTURE',
  NATURE = 'NATURE',
  SPORTS = 'SPORTS',
  ENTERTAINMENT = 'ENTERTAINMENT',
  MEDIA = 'MEDIA',
  OTHER = 'OTHER',
}

export enum Role {
  ADMIN = 'ADMIN',
  TRIPCOORD = 'TRIPCOORD',
  USER = 'USER',
}

export enum ParticipantSex {
  FEMALE = 'FEMALE',
  MALE = 'MALE',
  OTHER = 'OTHER',
}

export interface Participant {
  id: number
  name: string
  surname: string
  role: ParticipantRole
  email?: string
  phone?: string
  address?: string
  iban?: string
  isAdult: boolean
  dateOfBirth?: string
  placeOfBirth?: string
  sex: ParticipantSex
  note?: string
  createdAt: string
  updatedAt: string
  isArchived: boolean
  trips?: Trip[]
  expenses?: Expense[]
}

export interface Trip {
  id: number
  title: string
  category: TripCategory
  destination?: string
  budget?: number
  startDate?: string
  endDate?: string
  accommodation?: string
  travelTime?: number
  travelDistance?: number
  note?: string
  createdAt: string
  updatedAt: string
  isArchived: boolean
  participants?: Participant[]
  expenses?: Expense[]
}

export interface Expense {
  id: number
  title: string
  category: ExpenseCategory
  recipientName?: string
  recipientIban?: string
  quantity?: number
  currency: string
  amount?: number
  budgetLeft?: number
  note?: string
  tripId?: number
  participantId?: number
  createdAt: string
  updatedAt: string
  isArchived: boolean
}

export interface Activity {
  id: number
  name: string
  category: ActivityCategory
  place?: string
  startDate?: string
  endDate?: string
  note?: string
  tripId?: number
  participantsIds?: number[]
  expensesIds?: number[]
  createdAt: string
  updatedAt: string
  isArchived: boolean
}

export interface User {
  email: string
  username: string | null
  role: Role
  note: string | null
  updatedAt: Date
  createdAt: Date
  isArchived: boolean
}

export interface CreateParticipantDto {
  name: string
  surname: string
  role: ParticipantRole
  email?: string
  phone?: string
  address?: string
  iban?: string
  isAdult: boolean
  dateOfBirth?: string
  placeOfBirth?: string
  sex: ParticipantSex
  note?: string
  tripsIds?: number[]
  expensesIds?: number[]
}

export interface CreateTripDto {
  title: string
  category: TripCategory
  destination?: string
  budget?: number
  startDate?: string
  endDate?: string
  accommodation?: string
  travelTime?: number
  travelDistance?: number
  note?: string
  participantsIds?: number[]
  expensesIds?: number[]
}

export interface CreateExpenseDto {
  title: string
  category: ExpenseCategory
  recipientName?: string
  recipientIban?: string
  quantity?: number
  currency: string
  amount?: number
  budgetLeft?: number
  note?: string
  participantId?: number
  tripId?: number
}

export interface CreateActivityDto {
  name: string
  category: ActivityCategory
  place?: string
  startDate?: string
  endDate?: string
  note?: string
  tripId?: number
  participantsIds?: number[]
  expensesIds?: number[]
}

export interface UpdateParticipantDto extends Partial<CreateParticipantDto> {
  updatedAt?: string
  isArchived?: boolean
}

export interface UpdateTripDto extends Partial<CreateTripDto> {
  updatedAt?: string
  isArchived?: boolean
}

export interface UpdateExpenseDto extends Partial<CreateExpenseDto> {
  updatedAt?: string
  isArchived?: boolean
}

export interface UpdateActivityDto extends Partial<CreateActivityDto> {
  updatedAt?: string
  isArchived?: boolean
}

export interface LoginDto {
  email: string
  password: string
}

export interface RegisterDto extends LoginDto {
  username?: string
  note?: string
}

export interface AuthResponseDto {
  token: string
}

export interface UpdateUserDto {
  email?: string
  username?: string
  password?: string
  note?: string
  isArchived?: boolean
}

export const enumUtils = {
  getParticipantRoleLabel: (role: ParticipantRole): string => {
    const labels: Record<ParticipantRole, string> = {
      [ParticipantRole.ORGANIZER]: 'Organizer',
      [ParticipantRole.PARTICIPANT]: 'Participant',
      [ParticipantRole.GUEST]: 'Guest',
      [ParticipantRole.DRIVER]: 'Driver',
      [ParticipantRole.VOLUNTEER]: 'Volunteer',
      [ParticipantRole.OTHER]: 'Other',
    }
    return labels[role]
  },

  getTripCategoryLabel: (category: TripCategory): string => {
    const labels: Record<TripCategory, string> = {
      [TripCategory.BUSINESS]: 'Business',
      [TripCategory.VACATION]: 'Vacation',
      [TripCategory.FAMILY]: 'Family',
      [TripCategory.PERSONAL]: 'Personal',
      [TripCategory.WEEKEND]: 'Weekend',
      [TripCategory.OTHER]: 'Other',
    }
    return labels[category]
  },

  getActivityCategoryLabel: (category: ActivityCategory): string => {
    const labels: Record<ActivityCategory, string> = {
      [ActivityCategory.SIGHTSEEING]: 'Sightseeing',
      [ActivityCategory.RELAXATION]: 'Relaxation',
      [ActivityCategory.CULTURE]: 'Culture',
      [ActivityCategory.NATURE]: 'Nature',
      [ActivityCategory.SPORTS]: 'Sports',
      [ActivityCategory.ENTERTAINMENT]: 'Entertainment',
      [ActivityCategory.MEDIA]: 'Media',
      [ActivityCategory.OTHER]: 'Other',
    }
    return labels[category]
  },

  getExpenseCategoryLabel: (category: ExpenseCategory): string => {
    const labels: Record<ExpenseCategory, string> = {
      [ExpenseCategory.ACCOMMODATION]: 'Accommodation',
      [ExpenseCategory.TRANSPORT]: 'Transport',
      [ExpenseCategory.FOOD]: 'Food & Dining',
      [ExpenseCategory.HEALTH]: 'Health & Medical',
      [ExpenseCategory.UTILITIES]: 'Utilities',
      [ExpenseCategory.SHOPPING]: 'Shopping',
      [ExpenseCategory.INSURANCE]: 'Insurance',
      [ExpenseCategory.ENTERTAINMENT]: 'Entertainment',
      [ExpenseCategory.GIFT]: 'Gifts',
      [ExpenseCategory.OTHER]: 'Other',
    }
    return labels[category]
  },

  getAllTripCategories: () =>
    Object.values(TripCategory).map((category) => ({
      value: category,
      label: enumUtils.getTripCategoryLabel(category),
    })),

  getAllExpenseCategories: () =>
    Object.values(ExpenseCategory).map((category) => ({
      value: category,
      label: enumUtils.getExpenseCategoryLabel(category),
    })),

  getAllParticipantRoles: () =>
    Object.values(ParticipantRole).map((role) => ({
      value: role,
      label: enumUtils.getParticipantRoleLabel(role),
    })),

  getAllActivityCategories: () =>
    Object.values(ActivityCategory).map((category) => ({
      value: category,
      label: enumUtils.getActivityCategoryLabel(category),
    })),
}

export const participantApi = {
  getAll: (params?: {
    skip?: number
    take?: number
    orderBy?: string
    include?: string
  }) => {
    const searchParams = new URLSearchParams()
    if (params?.skip !== undefined)
      searchParams.append('skip', params.skip.toString())
    if (params?.take !== undefined)
      searchParams.append('take', params.take.toString())
    if (params?.orderBy) searchParams.append('orderBy', params.orderBy)
    if (params?.include) searchParams.append('include', params.include)

    const queryString = searchParams.toString()
    return api
      .get(`/participant${queryString ? `?${queryString}` : ''}`)
      .then((res) => res.data)
  },
  getById: (id: number) =>
    api.get(`/participant/${id}`).then((res) => res.data),
  create: (data: CreateParticipantDto) =>
    api.post('/participant', data).then((res) => res.data),
  update: (id: number, data: UpdateParticipantDto) =>
    api.patch(`/participant/${id}`, data).then((res) => res.data),
  delete: (id: number) =>
    api.delete(`/participant/${id}`).then((res) => res.data),
  getByTrip: (tripId: number) =>
    api
      .get(`/participant?include=trips`)
      .then((res) =>
        res.data?.filter((p: Participant) =>
          p.trips?.some((trip) => trip.id === tripId)
        )
      ),
  addToTrip: async (participantId: number, tripId: number) => {
    const participant = await participantApi.getById(participantId)
    const currentTripIds = participant.tripsIds || []
    if (currentTripIds.includes(tripId)) return participant

    const newTripIds = [...currentTripIds, tripId]
    return participantApi.update(participantId, { tripsIds: newTripIds })
  },
  removeFromTrip: async (participantId: number, tripId: number) => {
    const participant = await participantApi.getById(participantId)
    const currentTripIds = participant.tripsIds || []
    const newTripIds = currentTripIds.filter((id: number) => id !== tripId)

    return participantApi.update(participantId, { tripsIds: newTripIds })
  },
}

export const tripApi = {
  getAll: (params?: {
    skip?: number
    take?: number
    orderBy?: string
    include?: string
  }) => {
    const searchParams = new URLSearchParams()
    if (params?.skip !== undefined)
      searchParams.append('skip', params.skip.toString())
    if (params?.take !== undefined)
      searchParams.append('take', params.take.toString())
    if (params?.orderBy) searchParams.append('orderBy', params.orderBy)
    if (params?.include) searchParams.append('include', params.include)

    const queryString = searchParams.toString()
    return api
      .get(`/trip${queryString ? `?${queryString}` : ''}`)
      .then((res) => res.data)
  },
  getById: (id: number) => api.get(`/trip/${id}`).then((res) => res.data),
  create: (data: CreateTripDto) =>
    api.post('/trip', data).then((res) => res.data),
  update: (id: number, data: UpdateTripDto) =>
    api.patch(`/trip/${id}`, data).then((res) => res.data),
  delete: (id: number) => api.delete(`/trip/${id}`).then((res) => res.data),
  getByParticipant: (participantId: number) => {
    return api.get(`/trip?include=participants`).then((res) => ({
      ...res,
      data: res.data?.filter((t: Trip) =>
        t.participants?.some((participant) => participant.id === participantId)
      ),
    }))
  },
  addParticipant: async (tripId: number, participantId: number) => {
    const trip = await tripApi.getById(tripId)
    const currentparticipantsIds = trip.participantsIds || []
    if (currentparticipantsIds.includes(participantId)) return trip

    const newparticipantsIds = [...currentparticipantsIds, participantId]
    return tripApi.update(tripId, { participantsIds: newparticipantsIds })
  },
  removeParticipant: async (tripId: number, participantId: number) => {
    const trip = await tripApi.getById(tripId)
    const currentparticipantsIds = trip.participantsIds || []
    const newparticipantsIds = currentparticipantsIds.filter(
      (id: number) => id !== participantId
    )

    return tripApi.update(tripId, { participantsIds: newparticipantsIds })
  },
}

export const expenseApi = {
  getAll: (params?: { skip?: number; take?: number; orderBy?: string }) => {
    const searchParams = new URLSearchParams()
    if (params?.skip !== undefined)
      searchParams.append('skip', params.skip.toString())
    if (params?.take !== undefined)
      searchParams.append('take', params.take.toString())
    if (params?.orderBy) searchParams.append('orderBy', params.orderBy)

    const queryString = searchParams.toString()
    return api
      .get(`/expense${queryString ? `?${queryString}` : ''}`)
      .then((res) => res.data)
  },
  getById: (id: number) => api.get(`/expense/${id}`).then((res) => res.data),
  create: (data: CreateExpenseDto) =>
    api.post('/expense', data).then((res) => res.data),
  update: (id: number, data: UpdateExpenseDto) =>
    api.patch(`/expense/${id}`, data).then((res) => res.data),
  delete: (id: number) => api.delete(`/expense/${id}`).then((res) => res.data),
  getByParticipant: (participantId: number) => {
    return api.get(`/expense`).then((res) => ({
      ...res,
      data: res.data?.filter((e: Expense) => e.participantId === participantId),
    }))
  },
  getByTrip: (tripId: number) =>
    api.get(`/expense`).then((res) => ({
      ...res,
      data: res.data?.filter((e: Expense) => e.tripId === tripId),
    })),
}

export const activityApi = {
  getAll: (params?: { skip?: number; take?: number; orderBy?: string }) => {
    const searchParams = new URLSearchParams()
    if (params?.skip !== undefined)
      searchParams.append('skip', params.skip.toString())
    if (params?.take !== undefined)
      searchParams.append('take', params.take.toString())
    if (params?.orderBy) searchParams.append('orderBy', params.orderBy)

    const queryString = searchParams.toString()
    return api
      .get(`/activity${queryString ? `?${queryString}` : ''}`)
      .then((res) => res.data)
  },
  getById: (id: number) => api.get(`/activity/${id}`).then((res) => res.data),
  create: (data: CreateActivityDto) =>
    api.post('/activity', data).then((res) => res.data),
  update: (id: number, data: UpdateActivityDto) =>
    api.patch(`/activity/${id}`, data).then((res) => res.data),
  delete: (id: number) => api.delete(`/activity/${id}`).then((res) => res.data),
}

export const authApi = {
  login: (data: LoginDto): Promise<AuthResponseDto> =>
    api.post('/auth/login', data).then((res) => res.data),
  register: (data: RegisterDto): Promise<AuthResponseDto> =>
    api.post('/auth/register', data).then((res) => res.data),
}

export const userApi = {
  getAll: () => api.get('/users').then((res) => res.data),
  getByEmail: (email: string) =>
    api.get(`/users/${encodeURIComponent(email)}`).then((res) => res.data),
  update: (email: string, data: UpdateUserDto) =>
    api
      .patch(`/users/${encodeURIComponent(email)}`, data)
      .then((res) => res.data),
  archive: (email: string) =>
    api
      .patch(`/users/${encodeURIComponent(email)}/archive`)
      .then((res) => res.data),
  dearchive: (email: string) =>
    api
      .patch(`/users/${encodeURIComponent(email)}/dearchive`)
      .then((res) => res.data),
  delete: (email: string) =>
    api.delete(`/users/${encodeURIComponent(email)}`).then((res) => res.data),
}

export const databaseApi = {
  getStats: () => api.get('/database/stats').then((res) => res.data),
  clearAllData: () => api.post('/database/clear').then((res) => res.data),
}

export const tokenManager = {
  setToken: (token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', token)
      document.cookie = `access_token=${token}; path=/; max-age=${
        7 * 24 * 60 * 60
      }; secure; samesite=strict`
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }
  },
  getToken: () => {
    if (typeof window !== 'undefined') {
      const tokenFromStorage = localStorage.getItem('access_token')
      if (tokenFromStorage) return tokenFromStorage

      const cookies = document.cookie.split(';')
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=')
        if (name === 'access_token') return value
      }
    }
    return null
  },
  removeToken: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token')
      document.cookie =
        'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
      delete api.defaults.headers.common['Authorization']
    }
  },
  initializeToken: () => {
    const token = tokenManager.getToken()
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }
  },
}

tokenManager.initializeToken()

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message)

    if (error.response?.status === 401) {
      tokenManager.removeToken()
      if (
        typeof window !== 'undefined' &&
        window.location.pathname !== '/auth/login'
      ) {
        window.location.href = '/auth/login'
      }
    } else if (error.response?.status === 403) {
      console.error('Access forbidden - insufficient permissions')
    } else if (error.response?.status === 404) {
      console.error('Resource not found')
    } else if (error.response?.status >= 500) {
      console.error('Server error - please try again later')
    }

    throw error
  }
)
