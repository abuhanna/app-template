import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('uploaded_files')
export class UploadedFile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fileName: string;

  @Column()
  storedFileName: string;

  @Column()
  contentType: string;

  @Column({ type: 'bigint' })
  fileSize: number;

  @Column()
  filePath: string;

  @CreateDateColumn()
  createdAt: Date;
}
