import  { type UserRoleEnum } from '@/types/enums/roles/userRole.enum.ts'

export class UserPayloadDto {
  // constructor(user: User) {
  //   this.token = user.token;
  //   this.username = user.username;
  //   this.status = user.status.name;
  //   this.role = user.role;
  // }


  constructor(token: string, username: string, status: string, role: UserRoleEnum) {
    this.token = token
    this.username = username
    this.status = status
    this.role = role
  }

  readonly token: string
  readonly username: string
  readonly status: string
  readonly role: UserRoleEnum
}
