export type TeamRole = 'owner' | 'admin' | 'member'

export interface TeamMember {
  userId: number
  username?: string | null
  nickname?: string | null
  avatar?: string | null
  role: TeamRole | string
  status: number
  presence?: string | null
  lastSeen?: string | null
}

export interface TeamOverview {
  teamId: number
  name: string
  ownerId: number
  memberCount: number
  maxMembers: number
  versionLabel: string
  currentRole: TeamRole | string
  members: TeamMember[]
}

export interface TeamInvitation {
  id: number
  teamId: number
  inviteeId?: number | null
  inviteeEmail?: string | null
  token: string
  role: TeamRole | string
  status: string
  expireTime?: string | null
  createTime?: string | null
}

export interface TeamPresence {
  userId: number
  username?: string | null
  nickname?: string | null
  status: 'online' | 'away' | 'offline' | string
  lastSeen?: string | null
}

export interface TeamComment {
  id: number
  designId: number
  userId: number
  username?: string | null
  nickname?: string | null
  content: string
  parentId?: number | null
  createTime?: string | null
}

export interface TeamVersion {
  id: number
  designId: number
  versionNo: number
  userId: number
  username?: string | null
  nickname?: string | null
  canvasJson: string
  note?: string | null
  createTime?: string | null
}
