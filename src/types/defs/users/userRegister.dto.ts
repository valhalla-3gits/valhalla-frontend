export class UserRegisterDto {

  constructor() {
    this.username = "";
    this.password = "";
    this.firstname = "";
    this.secondname = "";
  }

  readonly username: string;
  readonly password: string;
  readonly firstname: string;
  readonly secondname: string;
}
