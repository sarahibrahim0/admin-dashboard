import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ConfirmDialogComponent } from './confirm-dialog.component';

/**
 * The ONE shared confirmation set for all add/edit pages — same dialogs,
 * same wording everywhere (product, category, content, coupon, user, role,
 * profile, settings…).
 *
 * Pages only wire their own state/handlers:
 * ```html
 * <app-form-confirms
 *   [saveOpen]="showSaveDialog()"
 *   (save)="confirmSave()" (saveCancel)="showSaveDialog.set(false)"
 *   [uploadOpen]="showUploadDialog()"
 *   (upload)="confirmUpload()" (uploadCancel)="cancelUpload()"
 *   [deleteImageOpen]="showDeleteImageDialog()"
 *   (deleteImage)="confirmDeleteImage()" (deleteImageCancel)="cancelDeleteImage()" />
 * ```
 * Any group can be omitted when the page doesn't need it.
 */
@Component({
  selector: 'app-form-confirms',
  standalone: true,
  imports: [ConfirmDialogComponent],
  template: `
    <app-confirm-dialog [open]="saveOpen" [title]="'Save changes'" [message]="'Do you want to save your changes?'"
      [confirmLabel]="'Save'" [confirmClass]="'btn btn-primary'" (confirm)="save.emit()" (cancel)="saveCancel.emit()" />
    <app-confirm-dialog [open]="uploadOpen" [title]="'Upload image'" [message]="'Do you want to upload this image?'"
      [confirmLabel]="'Confirm'" [confirmClass]="'btn btn-primary'" (confirm)="upload.emit()" (cancel)="uploadCancel.emit()" />
    <app-confirm-dialog [open]="deleteImageOpen" [title]="'Delete image'" [message]="'Do you want to delete this image?'"
      (confirm)="deleteImage.emit()" (cancel)="deleteImageCancel.emit()" />
  `,
})
export class FormConfirmsComponent {
  @Input() saveOpen = false;
  @Input() uploadOpen = false;
  @Input() deleteImageOpen = false;

  @Output() save = new EventEmitter<void>();
  @Output() saveCancel = new EventEmitter<void>();
  @Output() upload = new EventEmitter<void>();
  @Output() uploadCancel = new EventEmitter<void>();
  @Output() deleteImage = new EventEmitter<void>();
  @Output() deleteImageCancel = new EventEmitter<void>();
}
