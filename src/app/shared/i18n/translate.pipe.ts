import { Pipe, PipeTransform, inject } from '@angular/core';
import { LanguageService } from '../../core/services/language.service';

@Pipe({ name: 'translate', standalone: true, pure: false })
export class TranslatePipe implements PipeTransform {
  private language = inject(LanguageService);

  transform(value: string | number | boolean | null | undefined): string {
    if (value === null || value === undefined) return this.language.translate('');
    return this.language.translate(String(value));
  }
}
