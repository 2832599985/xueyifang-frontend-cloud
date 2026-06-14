export interface LoginRequest {
    studentId: string
    password: string
}

export interface RegisterRequest {
    studentId: string
    password: string
    confirmPassword: string
    realName: string
    phone: string
    professionalId: number
    email: string
    dormitory: string
}

export interface UpdateProfileRequest {
    nickname?: string
    email?: string
    dormitory?: string
    grade?: string
    professionalId?: number
    avatar?: string
    bio?: string
    phone?: string
}

export interface ChangePasswordRequest {
    oldPassword: string
    newPassword: string
    confirmPassword: string
}

export interface UserInfo {
    id: number
    studentId: string
    realName: string
    nickname: string
    phone: string
    email: string
    dormitory: string
    grade: string
    professionalId: number
    professionalName: string
    avatar: string
    bio: string
    role: number
    publishPermission: number
    permissionReviewStatus: number
    walletBalance: number
    accountStatus: number
}

export interface LoginResponse {
    userInfo: UserInfo
    token: string
    tokenType?: string
    expiresIn?: number
    expiresAt?: string
}
