import { TestBed } from '@angular/core/testing';
import { LanguageService } from './language.service';

describe('LanguageService toast messages', () => {
  let language: LanguageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    language = TestBed.inject(LanguageService);
  });

  it('translates the default role deletion error in Arabic and English', () => {
    const selectedLanguage = language.language();

    language.setLanguage('ar');
    expect(language.translate('cannot delete default role')).toBe('لا يمكن حذف الدور الافتراضي');

    language.setLanguage('en');
    expect(language.translate('cannot delete default role')).toBe('Cannot delete default role');

    language.setLanguage(selectedLanguage);
  });

  it('translates API errors that include resource details', () => {
    const selectedLanguage = language.language();
    language.setLanguage('ar');

    expect(language.translate('product not found: 123')).toBe('المنتج غير موجود: 123');
    expect(language.translate('insufficient stock for Blue Shirt')).toBe('المخزون غير كافٍ للمنتج: Blue Shirt');
    expect(language.translate('cannot change order from pending to shipped'))
      .toBe('لا يمكن تغيير حالة الطلب من pending إلى shipped');

    language.setLanguage(selectedLanguage);
  });
});
