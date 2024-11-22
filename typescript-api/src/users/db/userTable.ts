import { Entity, PrimaryGeneratedColumn, Column, Unique } from "typeorm";

@Entity("user_details")
@Unique(["email", "phone", "username"])
export class User {
  @PrimaryGeneratedColumn()
  userId!: number;

  @Column({ type: "varchar" })
  name!: string;

  @Column({ type: "varchar" })
  fullName!: string;

  @Column({ type: "varchar" })
  username!: string;

  @Column({ type: "varchar", unique: true })
  email!: string;

  @Column({ type: "varchar" })
  password!: string;

  @Column({ type: "varchar", unique: true })
  phone!: string;

  @Column({ type: "int" })
  age!: number;

  @Column({ type: "date", nullable: true })
  dateOfBirth?: Date;

  @Column({ type: "varchar", nullable: true })
  profileImage?: string;

  @Column({ type: "varchar" })
  gender!: string;

  @Column({ type: "timestamp", nullable: true })
  resetPasswordExpires?: Date;
  @Column({
    type: "enum",
    enum: ["unverified", "active", "blocked"],
    default: "active",
  })
  status!: "unverified" | "active" | "blocked";

  // You don't necessarily need this constructor unless you're handling manual object creation
  constructor(
    name: string,
    fullName: string,
    username: string,
    email: string,
    password: string,
    phone: string,
    age: number,
    gender: string,
    status: "unverified" | "active" | "blocked",
    dateOfBirth?: Date,
    profileImage?: string,
    resetPasswordExpires?: Date
  ) {
    this.name = name;
    this.fullName = fullName;
    this.username = username;
    this.email = email;
    this.password = password;
    this.phone = phone;
    this.age = age;
    this.gender = gender;
    this.status = status;
    this.dateOfBirth = dateOfBirth;
    this.profileImage = profileImage;
    this.resetPasswordExpires = resetPasswordExpires;
  }
}
