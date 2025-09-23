import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  participantApi,
  type Participant,
  type CreateParticipantDto,
  type UpdateParticipantDto,
  ParticipantRole,
  ParticipantSex,
  enumUtils,
} from '@/lib/api'
import { Edit2, Trash2, Plus, User, X } from 'lucide-react'

export default function ParticipantsPage() {
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState<CreateParticipantDto>({
    name: '',
    surname: '',
    role: ParticipantRole.PARTICIPANT,
    email: '',
    phone: '',
    address: '',
    iban: '',
    isAdult: true,
    dateOfBirth: new Date().toISOString().split('T')[0],
    placeOfBirth: '',
    sex: ParticipantSex.OTHER,
    note: '',
  })

  const queryClient = useQueryClient()

  const { data: participants, isLoading } = useQuery({
    queryKey: ['participants'],
    queryFn: () => participantApi.getAll(),
  })

  const createMutation = useMutation({
    mutationFn: (data: CreateParticipantDto) => participantApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['participants'] })
      setIsCreating(false)
      resetForm()
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateParticipantDto }) =>
      participantApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['participants'] })
      setEditingId(null)
      resetForm()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: participantApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['participants'] })
    },
  })

  const resetForm = () => {
    setFormData({
      name: '',
      surname: '',
      role: ParticipantRole.PARTICIPANT,
      email: '',
      phone: '',
      address: '',
      iban: '',
      isAdult: true,
      dateOfBirth: new Date().toISOString().split('T')[0],
      placeOfBirth: '',
      sex: ParticipantSex.OTHER,
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

  const startEdit = (participant: Participant) => {
    setEditingId(participant.id)
    setFormData({
      name: participant.name,
      surname: participant.surname,
      role: participant.role,
      email: participant.email || '',
      phone: participant.phone || '',
      address: participant.address || '',
      iban: participant.iban || '',
      isAdult: participant.isAdult,
      dateOfBirth: participant.dateOfBirth?.split('T')[0] || '',
      placeOfBirth: participant.placeOfBirth || '',
      sex: participant.sex,
      note: participant.note || '',
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

  const participantsData: Participant[] = Array.isArray(participants)
    ? participants
    : []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Participants</h1>
        <Button
          onClick={() => setIsCreating(true)}
          disabled={isCreating || editingId !== null}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Participant
        </Button>
      </div>

      {(isCreating || editingId !== null) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {editingId ? 'Edit Participant' : 'Create New Participant'}
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
                    Name *
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="First name"
                    required
                    maxLength={100}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Surname *
                  </label>
                  <Input
                    value={formData.surname}
                    onChange={(e) =>
                      setFormData({ ...formData, surname: e.target.value })
                    }
                    placeholder="Last name"
                    required
                    maxLength={100}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Role *
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        role: e.target.value as ParticipantRole,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    {enumUtils.getAllParticipantRoles().map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Sex *
                  </label>
                  <select
                    value={formData.sex}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sex: e.target.value as ParticipantSex,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value={ParticipantSex.MALE}>Male</option>
                    <option value={ParticipantSex.FEMALE}>Female</option>
                    <option value={ParticipantSex.OTHER}>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="email@example.com"
                    maxLength={50}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Phone
                  </label>
                  <Input
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="Phone number"
                    maxLength={25}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Date of Birth
                  </label>
                  <Input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) =>
                      setFormData({ ...formData, dateOfBirth: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Place of Birth
                  </label>
                  <Input
                    value={formData.placeOfBirth}
                    onChange={(e) =>
                      setFormData({ ...formData, placeOfBirth: e.target.value })
                    }
                    placeholder="City, Country"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">IBAN</label>
                  <Input
                    value={formData.iban}
                    onChange={(e) =>
                      setFormData({ ...formData, iban: e.target.value })
                    }
                    placeholder="International Bank Account Number"
                    maxLength={50}
                  />
                </div>
                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.isAdult}
                      onChange={(e) =>
                        setFormData({ ...formData, isAdult: e.target.checked })
                      }
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm font-medium">Is Adult</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Address
                </label>
                <Input
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  placeholder="Full address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea
                  value={formData.note}
                  onChange={(e) =>
                    setFormData({ ...formData, note: e.target.value })
                  }
                  placeholder="Additional notes..."
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

      {participantsData.length === 0 && !isCreating && (
        <Card>
          <CardContent className="text-center py-8">
            <User className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No participants yet
            </h3>
            <p className="text-gray-600 mb-4">
              Get started by adding your first participant
            </p>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Participant
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {participantsData.map((participant) => (
          <Card
            key={participant.id}
            className="hover:shadow-md transition-shadow"
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">
                    {participant.name} {participant.surname}
                  </div>
                  <div className="text-sm text-gray-500">
                    {enumUtils.getParticipantRoleLabel(participant.role)}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => startEdit(participant)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteMutation.mutate(participant.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                {participant.email && (
                  <div>
                    <span className="font-medium">Email:</span>{' '}
                    {participant.email}
                  </div>
                )}
                {participant.phone && (
                  <div>
                    <span className="font-medium">Phone:</span>{' '}
                    {participant.phone}
                  </div>
                )}
                <div>
                  <span className="font-medium">Adult:</span>{' '}
                  {participant.isAdult ? 'Yes' : 'No'}
                </div>
                {participant.note && (
                  <div>
                    <span className="font-medium">Notes:</span>
                    <p className="text-gray-600 mt-1">{participant.note}</p>
                  </div>
                )}
              </div>
              <div className="mt-4 pt-4 border-t">
                <Link href={`/participants/${participant.id}`}>
                  <Button variant="outline" size="sm" className="w-full">
                    View Details
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
