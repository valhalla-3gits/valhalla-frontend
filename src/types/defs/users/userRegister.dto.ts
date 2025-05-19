export class UserRegisterDto {

  constructor() {
    this.username = "";
    this.password = "";
    this.firstname = "";
    this.lastname = "";
  }

  readonly username: string;
  readonly password: string;
  readonly firstname: string;
  readonly lastname: string;
}
