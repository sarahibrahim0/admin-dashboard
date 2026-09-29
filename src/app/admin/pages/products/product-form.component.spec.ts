import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { ToastService } from '../../../shared/ui/toast.service';
import { ProductFormComponent } from './product-form.component';

/**
 * The product form has three separate upload paths: the main image, the
 * gallery batch and the rich-text editor picker. Each targets a different
 * endpoint and Cloudinary folder, so each is asserted separately.
 */
describe('ProductFormComponent uploads', () => {
  let component: ProductFormComponent;
  let mock: HttpTestingController;
  let toasts: ToastService;

  function png(name = 'p.png', size = 4096): File {
    const file = new File(['x'], name, { type: 'image/png' });
    Object.defineProperty(file, 'size', { value: size });
    return file;
  }

  function inputWith(files: File[]): HTMLInputElement {
    const input = document.createElement('input');
    Object.defineProperty(input, 'files', { value: files });
    return input;
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    mock = TestBed.inject(HttpTestingController);
    toasts = TestBed.inject(ToastService);
    TestBed.runInInjectionContext(() => {
      component = new ProductFormComponent();
    });
  });

  describe('main image', () => {
    it('uploads to /media/image under the products folder', () => {
      const file = png('main.png');
      component.onFileSelect({ target: inputWith([file]) } as unknown as Event);
      expect(component.showUploadDialog()).toBeTrue();

      component.confirmUpload();

      const req = mock.expectOne(`${environment.apiUrl}media/image`);
      expect(req.request.body.get('image')).toBe(file);
      expect(req.request.body.get('folder')).toBe('products');
      req.flush({ image: { url: 'https://cdn/main.png', publicId: 'm1' } });

      expect(component.imageUploading()).toBeFalse();
      expect(component.imagePreview()).toBe('https://cdn/main.png');
      expect(toasts.toasts().some((t) => t.key === 'Image uploaded')).toBeTrue();
      mock.verify();
    });

    it('never reaches the network for a non-image file', () => {
      component.onFileSelect({ target: inputWith([new File(['x'], 'a.pdf', { type: 'application/pdf' })]) } as unknown as Event);
      expect(component.showUploadDialog()).toBeFalse();
      mock.expectNone(`${environment.apiUrl}media/image`);
    });

    it('leaves the preview untouched when the upload fails', () => {
      component.onFileSelect({ target: inputWith([png()]) } as unknown as Event);
      component.confirmUpload();
      mock
        .expectOne(`${environment.apiUrl}media/image`)
        .flush({ message: 'nope' }, { status: 400, statusText: 'Bad Request' });
      expect(component.imageUploading()).toBeFalse();
      expect(component.imagePreview()).toBe('');
      expect(toasts.toasts().some((t) => t.key === 'nope')).toBeTrue();
      mock.verify();
    });
  });

  describe('gallery', () => {
    it('uploads every selected file to /media/images under products/gallery', () => {
      const files = [png('g1.png'), png('g2.png'), png('g3.png')];
      component.onGallerySelect({ target: inputWith(files) } as unknown as Event);
      component.confirmUpload();

      const req = mock.expectOne(`${environment.apiUrl}media/images`);
      expect(req.request.body.getAll('images')).toEqual(files);
      expect(req.request.body.get('folder')).toBe('products/gallery');
      req.flush({
        images: [
          { url: 'u1', publicId: 'p1' },
          { url: 'u2', publicId: 'p2' },
          { url: 'u3', publicId: 'p3' },
        ],
      });

      expect(component.galleryUploading()).toBeFalse();
      expect(component.gallery().length).toBe(3);
      expect(component.gallery().map((g) => g.url)).toEqual(['u1', 'u2', 'u3']);
      expect(toasts.toasts().some((t) => t.key === 'Images uploaded')).toBeTrue();
      mock.verify();
    });

    it('appends to an already-populated gallery instead of replacing it', () => {
      component.gallery.set([{ url: 'existing', publicId: 'old' }]);
      component.onGallerySelect({ target: inputWith([png()]) } as unknown as Event);
      component.confirmUpload();
      mock.expectOne(`${environment.apiUrl}media/images`).flush({ images: [{ url: 'new', publicId: 'n1' }] });
      expect(component.gallery().map((g) => g.url)).toEqual(['existing', 'new']);
      mock.verify();
    });

    it('refuses a batch larger than 10 files', () => {
      const many = Array.from({ length: 11 }, (_, i) => png(`g${i}.png`));
      component.onGallerySelect({ target: inputWith(many) } as unknown as Event);
      expect(component.showUploadDialog()).toBeFalse();
      mock.expectNone(`${environment.apiUrl}media/images`);
    });

    it('keeps the gallery unchanged when the batch fails', () => {
      component.onGallerySelect({ target: inputWith([png()]) } as unknown as Event);
      component.confirmUpload();
      mock
        .expectOne(`${environment.apiUrl}media/images`)
        .flush({ message: 'no images uploaded' }, { status: 400, statusText: 'Bad Request' });
      expect(component.galleryUploading()).toBeFalse();
      expect(component.gallery().length).toBe(0);
      expect(toasts.toasts().some((t) => t.key === 'no images uploaded')).toBeTrue();
      mock.verify();
    });
  });

  describe('rich text editor', () => {
    it('uploads to /media/image under products/editor/images', () => {
      const created: HTMLInputElement[] = [];
      const original = document.createElement.bind(document);
      spyOn(document, 'createElement').and.callFake(((tag: string) => {
        const el = original(tag);
        if (tag === 'input') created.push(el as HTMLInputElement);
        return el;
      }) as never);

      component.selectEditorImage('descriptionEn');
      const picker = created[0];
      picker.click = () => {};
      const file = png('inline.png');
      Object.defineProperty(picker, 'files', { value: [file] });

      picker.onchange!(new Event('change'));
      const req = mock.expectOne(`${environment.apiUrl}media/image`);
      expect(req.request.body.get('image')).toBe(file);
      expect(req.request.body.get('folder')).toBe('products/editor/images');
      req.flush({ image: { url: 'https://cdn/inline.png', publicId: 'i1' } });

      expect(component.editorImageUploading()).toBeFalse();
      mock.verify();
    });

    it('reports progress back to the editor caller on failure', () => {
      const created: HTMLInputElement[] = [];
      const original = document.createElement.bind(document);
      spyOn(document, 'createElement').and.callFake(((tag: string) => {
        const el = original(tag);
        if (tag === 'input') created.push(el as HTMLInputElement);
        return el;
      }) as never);

      component.selectEditorImage('descriptionEn');
      const picker = created[0];
      picker.click = () => {};
      Object.defineProperty(picker, 'files', { value: [png()] });
      picker.onchange!(new Event('change'));
      mock
        .expectOne(`${environment.apiUrl}media/image`)
        .flush({ message: 'rejected' }, { status: 400, statusText: 'Bad Request' });

      expect(component.editorImageUploading()).toBeFalse();
      expect(toasts.toasts().some((t) => t.key === 'rejected')).toBeTrue();
      mock.verify();
    });
  });
});
