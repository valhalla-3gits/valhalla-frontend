export class UserLoginDto {

  constructor() {
    this.username = "";
    this.password = "";
  }

  readonly username: string;
  readonly password: string;
}
