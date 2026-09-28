import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { QuillModule } from 'ngx-quill';
import { TranslatePipe } from '../i18n/translate.pipe';
import { LanguageService } from '../../core/services/language.service';

export type LocalizedFieldMode = 'text' | 'textarea' | 'editor';

/**
 * Bilingual (EN/AR) form field with tab switcher.
 *
 * Usage:
 *   <app-localized-field [label]="'Name' | translate" mode="text" required="true"
 *     [controlEn]="form.controls.nameEn" [controlAr]="form.controls.nameAr" />
 *   <app-localized-field [label]="'Description' | translate" mode="editor"
 *     [controlEn]="form.controls.descriptionEn" [controlAr]="form.controls.descriptionAr"
 *     [editorModulesEn]="descModulesEn" [editorModulesAr]="descModulesAr"
 *     (editorReady)="onEditor($event)" />
 *
 * The EN tab is `dir="ltr"`, the AR tab is `dir="rtl"` so Arabic content is
 * authored right-to-left. Combine with `splitLocalized` (load) /
 * `joinLocalized` (save) from `shared/utils/localized`.
 */
@Component({
  selector: 'app-localized-field',
  standalone: true,
  imports: [ReactiveFormsModule, QuillModule, TranslatePipe],
  styles: `
    :host { display: block; min-width: 0; max-width: 100%; }
    :host ::ng-deep .ql-container { font-size: 14px; }
    :host ::ng-deep .ql-container.ql-snow, :host ::ng-deep .ql-toolbar.ql-snow { max-width: 100%; }
    :host ::ng-deep .ql-toolbar.ql-snow { display: flex; flex-wrap: wrap; }
    :host ::ng-deep .ql-toolbar.ql-snow .ql-formats { margin-right: 10px; }
    :host ::ng-deep .ql-editor { min-height: 120px; }
    :host [dir='rtl'] ::ng-deep .ql-editor { direction: rtl; text-align: right; }
  `,
  template: `
    <div>
      <div class="mb-1.5 flex items-center justify-between gap-2">
        <label [for]="id || label" class="block text-sm font-medium text-[#646D77]">
          {{ label }}
          @if (required) { <span class="text-salmon">*</span> }
        </label>
        <div class="flex overflow-hidden rounded-md border border-[#e3e8ef] text-xs font-semibold">
          <button type="button" (click)="tab.set('en')" [class.bg-salmon]="tab() === 'en'" [class.text-white]="tab() === 'en'" [class.text-[#797979]]="tab() !== 'en'" class="px-2.5 py-1 transition-colors">EN</button>
          <button type="button" (click)="tab.set('ar')" [class.bg-salmon]="tab() === 'ar'" [class.text-white]="tab() === 'ar'" [class.text-[#797979]]="tab() !== 'ar'" class="px-2.5 py-1 transition-colors">عربي</button>
        </div>
      </div>
      @if (tab() === 'en') {
        @switch (mode) {
          @case ('textarea') {
            <textarea [id]="id" [formControl]="controlEn" [rows]="rows" [placeholder]="placeholder" dir="ltr"
              class="mt-1 w-full rounded-md border border-[#c9c9c9] px-3 py-2 text-sm outline-none focus:border-salmon"></textarea>
          }
          @case ('editor') {
            <quill-editor [formControl]="controlEn" [modules]="editorModulesEn ?? editorModules"
              (onEditorCreated)="editorReady.emit({ lang: 'en', editor: $event })"
              [placeholder]="placeholder"></quill-editor>
          }
          @default {
            <input [id]="id" [formControl]="controlEn" type="text" [placeholder]="placeholder" dir="ltr"
              class="mt-1 w-full rounded-md border border-[#c9c9c9] px-3 py-2 text-sm outline-none focus:border-salmon" />
          }
        }
        @if (required && controlEn.touched && controlEn.errors?.['required']) {
          <p class="mt-1 text-xs text-salmon">{{ 'This field is required' | translate }}</p>
        }
      } @else {
        @switch (mode) {
          @case ('textarea') {
            <textarea [id]="id ? id + '-ar' : ''" [formControl]="controlAr" [rows]="rows" [placeholder]="placeholderAr || placeholder" dir="rtl"
              class="mt-1 w-full rounded-md border border-[#c9c9c9] px-3 py-2 text-sm outline-none focus:border-salmon"></textarea>
          }
          @case ('editor') {
            <div dir="rtl">
              <quill-editor [formControl]="controlAr" [modules]="editorModulesAr ?? editorModules"
                (onEditorCreated)="editorReady.emit({ lang: 'ar', editor: $event })"
                [placeholder]="placeholderAr || placeholder"></quill-editor>
            </div>
          }
          @default {
            <input [id]="id ? id + '-ar' : ''" [formControl]="controlAr" type="text" [placeholder]="placeholderAr || placeholder" dir="rtl"
              class="mt-1 w-full rounded-md border border-[#c9c9c9] px-3 py-2 text-sm outline-none focus:border-salmon" />
          }
        }
      }
    </div>
  `,
})
export class LocalizedFieldComponent {
  @Input() label = '';
  @Input() mode: LocalizedFieldMode = 'text';
  @Input() controlEn!: FormControl;
  @Input() controlAr!: FormControl;
  @Input() placeholder = '';
  @Input() placeholderAr = '';
  @Input() required = false;
  @Input() rows = 3;
  /** Quill toolbar config shared by both language editors. */
  @Input() editorModules?: any;
  /** Per-language configs (needed when toolbar handlers must target one editor). */
  @Input() editorModulesEn?: any;
  @Input() editorModulesAr?: any;
  @Input() id = '';
  @Output() editorReady = new EventEmitter<{ lang: 'en' | 'ar'; editor: any }>();

  private language = inject(LanguageService);
  /** Opens on the UI language tab, so the Arabic UI edits Arabic first. */
  tab = signal<'en' | 'ar'>(this.language.language() === 'ar' ? 'ar' : 'en');
}
