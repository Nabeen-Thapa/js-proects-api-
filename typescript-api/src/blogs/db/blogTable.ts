import { Entity, PrimaryGeneratedColumn, Column, Index } from "typeorm";

export enum blogStatus {
    UNVERIFIED = "unverified",
    ACTIVE = "active",
    BLOCKED = "blocked",
}

@Entity("user_blogs")
export class userBlogs {
    @PrimaryGeneratedColumn()
    blogId!: number;

    @Column({ type: "int" })
    userId!: number;

    @Column({ type: "varchar", length: 255 })
    userEmail!: string;

    @Column({ type: "varchar", length: 255 })
    username!: string;
    
    @Column({ type: "varchar", length: 512 })
    blogTitle!: string;

    @Column({ type: "varchar", length: 512 })
    blogDescription!: string;

    @Column({ type: "timestamp", nullable: true })
    resetPasswordExpires?: Date;

    @Column({
        type: "enum",
        enum: blogStatus,
        default: blogStatus.ACTIVE,
    })
    status!: blogStatus;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    createdAt!: Date;

    @Column({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        onUpdate: "CURRENT_TIMESTAMP",
    })
    updatedAt!: Date;
}
