import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('uploaded_files')
export class UploadedFile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'file_name' })
  fileName: string;

  @Column({ name: 'original_file_name' })
  originalFileName: string;

  @Column({ name: 'content_type' })
  contentType: string;

  @Column({ name: 'file_size', type: 'bigint' })
  fileSize: number;

  @Column({ type: 'varchar', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', nullable: true })
  category: string | null;

  @Column({ name: 'is_public', default: false })
  isPublic: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'created_by', type: 'varchar', nullable: true })
  createdBy: string | null;

  get downloadUrl(): string {
    return `/api/files/${this.id}/download`;
  }
}
