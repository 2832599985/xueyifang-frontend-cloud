import request from '@/api/request'
import type {
    LoginRequest,
    RegisterRequest,
    UpdateProfileRequest,
    ChangePasswordRequest,
    UserInfo,
    LoginResponse
} from '@/types/auth'

interface CloudLoginResponse {
    token: string
    tokenType?: string
    expiresIn?: number
    expiresAt?: string
    userId?: number
    username?: string
    nickname?: string
    role?: string | number
    roleCode?: number
    publishPermission?: number
}

type CloudUserProfile = Partial<Omit<UserInfo, 'role'>> & {
    userId?: number
    username?: string
    role?: string | number
    roleCode?: number
    status?: number
}

const toNumber = (value: unknown, fallback = 0) => {
    if (value === null || value === undefined || value === '') return fallback
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : fallback
}

const toRoleCode = (role: unknown, roleCode?: number) => {
    if (typeof roleCode === 'number') return roleCode
    if (typeof role === 'number') return role
    if (typeof role === 'string') {
        const normalized = role.toUpperCase()
        if (normalized === 'ADMIN') return 2
        if (normalized === 'STUDENT') return 1
    }
    return 1
}

const normalizeUserInfo = (source: CloudUserProfile): UserInfo => {
    const id = toNumber(source.id ?? source.userId)
    const username = source.username || source.studentId || ''
    const nickname = source.nickname || source.realName || username
    const publishPermission = toNumber(source.publishPermission)

    return {
        id,
        studentId: source.studentId || username,
        realName: source.realName || nickname,
        nickname,
        phone: source.phone || '',
        email: source.email || '',
        dormitory: source.dormitory || '',
        grade: source.grade || '',
        professionalId: toNumber(source.professionalId),
        professionalName: source.professionalName || '',
        avatar: source.avatar || '',
        bio: source.bio || '',
        role: toRoleCode(source.role, source.roleCode),
        publishPermission,
        permissionReviewStatus: toNumber(source.permissionReviewStatus, publishPermission === 1 ? 1 : 0),
        walletBalance: toNumber(source.walletBalance),
        accountStatus: toNumber(source.accountStatus ?? source.status, 1)
    }
}

export const authApi = {
    /**
     * 用户登录
     */
    async login(data: LoginRequest): Promise<LoginResponse> {
        const response = await request<CloudLoginResponse>({
            url: '/auth/login',
            method: 'post',
            data: {
                username: data.studentId,
                password: data.password
            }
        })

        return {
            token: response.token,
            tokenType: response.tokenType,
            expiresIn: response.expiresIn,
            expiresAt: response.expiresAt,
            userInfo: normalizeUserInfo({
                id: response.userId,
                userId: response.userId,
                username: response.username,
                studentId: response.username,
                realName: response.nickname || response.username,
                nickname: response.nickname || response.username,
                role: response.role,
                roleCode: response.roleCode,
                publishPermission: response.publishPermission
            })
        }
    },

    /**
     * 用户注册
     */
    async register(data: RegisterRequest): Promise<UserInfo> {
        await request<void>({
            url: '/auth/register',
            method: 'post',
            data: {
                username: data.studentId,
                password: data.password,
                nickname: data.realName,
                phone: data.phone,
                email: data.email
            }
        })

        return normalizeUserInfo({
            username: data.studentId,
            studentId: data.studentId,
            realName: data.realName,
            nickname: data.realName,
            phone: data.phone,
            email: data.email
        })
    },

    /**
     * 获取当前用户信息
     */
    async getCurrentUser(): Promise<UserInfo> {
        const response = await request<CloudUserProfile>({
            url: '/auth/currentUser',
            method: 'get'
        })

        return normalizeUserInfo(response)
    },

    /**
     * 修改个人信息
     */
    updateProfile(data: UpdateProfileRequest) {
        return request<void>({
            url: '/auth/updateProfile',
            method: 'put',
            data
        })
    },

    /**
     * 修改密码
     */
    changePassword(data: ChangePasswordRequest) {
        return request<void>({
            url: '/auth/changePassword',
            method: 'put',
            data
        })
    },

    /**
     * 退出登录
     */
    logout() {
        return request<boolean>({
            url: '/auth/logout',
            method: 'post'
        })
    }
}
