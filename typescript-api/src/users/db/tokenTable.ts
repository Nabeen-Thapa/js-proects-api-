import { Entity, PrimaryGeneratedColumn, Column, Index } from "typeorm";

export enum TokenStatus {
    UNVERIFIED = "unverified",
    ACTIVE = "active",
    BLOCKED = "blocked",
}

@Entity("user_tokens")
@Index("idx_userId", ["userId"])
@Index("idx_userEmail", ["userEmail"])
@Index("idx_accessToken", ["accessToken"])
export class Tokens {
    @PrimaryGeneratedColumn()
    tokenId!: number;

    @Column({ type: "int" })
    userId!: number;

    @Column({ type: "varchar", length: 255 })
    userEmail!: string;

    @Column({ type: "varchar", length: 255 })
    username!: string;
    
    @Column({ type: "varchar", length: 512 })
    accessToken!: string;

    @Column({ type: "varchar", length: 512 })
    refreshToken!: string;

    @Column({ type: "timestamp", nullable: true })
    resetPasswordExpires?: Date;

    @Column({
        type: "enum",
        enum: TokenStatus,
        default: TokenStatus.ACTIVE,
    })
    status!: TokenStatus;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    createdAt!: Date;

    @Column({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        onUpdate: "CURRENT_TIMESTAMP",
    })
    updatedAt!: Date;
}
