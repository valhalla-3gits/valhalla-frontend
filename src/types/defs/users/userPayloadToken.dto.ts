import type { UserPayloadDto } from '@/types/defs/users/userPayload.dto.ts'

export class UserPayloadTokenDto {
  constructor(user: UserPayloadDto, token: string) {
    this.user = user
    this.token = token
  }

  readonly user: UserPayloadDto
  readonly token: string
}
