/* eslint-disable @typescript-eslint/no-inferrable-types */
import { Directive, ElementRef, Input, OnDestroy, OnInit, Renderer2 } from "@angular/core";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { BehaviorSubject } from "rxjs";
import { getFileExtension, isAnImage, isAnAudio, AudioFile, isAVideo, VideoFile, isADocument, DocFile, isAPDF, PdfFile, isAnHtml, HtmlFile, FileLink, AnyLink } from "../../helpers/attachment-helpers.helper";


@UntilDestroy()
@Directive({
    selector: '[file-to-image]',
    standalone: true
})
export class FileToImageDirective implements OnInit, OnDestroy {


    private static cache: Map<string, string> = new Map();

    private file$: BehaviorSubject<File | undefined> = new BehaviorSubject<File | undefined>(undefined);


    @Input()
    get file(): File | undefined { return this.file$.getValue(); }
    set file(value: File) { this.file$.next(value); }


    constructor(private el: ElementRef, private renderer: Renderer2) {
        const img = el.nativeElement as HTMLImageElement;
        if (!img) {
            throw new Error('This directive is only allowed in a image element')
        }
    }

    ngOnInit() {
        FileToImageDirective.cache = new Map();
        this.file$.pipe(untilDestroyed(this)).subscribe(file => {
            if (!file) { (this.el.nativeElement as HTMLImageElement).hidden = true; return; }

            const key = `${file.size}-${file.name}`;
            const cached = FileToImageDirective.cache.get(key);
            if (cached) {
                (this.el.nativeElement as HTMLImageElement).hidden = false;
                this.renderer.setAttribute(this.el.nativeElement, 'src', cached);
            } else {
                const fileextension = getFileExtension(file.name);
                if (fileextension) {
                    if (isAnImage(fileextension)) {
                        const reader = new FileReader();
                        reader.onload = () => {
                            const dataurl = reader.result as string;
                            FileToImageDirective.cache.set(key, dataurl);
                            (this.el.nativeElement as HTMLImageElement).hidden = false;
                            this.renderer.setAttribute(this.el.nativeElement, 'src', dataurl);
                        }
                        reader.readAsDataURL(file)

                    } else if (isAnAudio(fileextension)) {
                        FileToImageDirective.cache.set(key, AudioFile);
                        (this.el.nativeElement as HTMLImageElement).hidden = false;
                        this.renderer.setAttribute(this.el.nativeElement, 'src', AudioFile);
                    } else if (isAVideo(fileextension)) {
                        FileToImageDirective.cache.set(key, VideoFile);
                        (this.el.nativeElement as HTMLImageElement).hidden = false;
                        this.renderer.setAttribute(this.el.nativeElement, 'src', VideoFile);
                    } else if (isADocument(fileextension)) {
                        FileToImageDirective.cache.set(key, DocFile);
                        (this.el.nativeElement as HTMLImageElement).hidden = false;
                        this.renderer.setAttribute(this.el.nativeElement, 'src', DocFile);
                    } else if (isAPDF(fileextension)) {
                        FileToImageDirective.cache.set(key, PdfFile);
                        (this.el.nativeElement as HTMLImageElement).hidden = false;
                        this.renderer.setAttribute(this.el.nativeElement, 'src', PdfFile);
                    } else if (isAnHtml(fileextension)) {
                        FileToImageDirective.cache.set(key, HtmlFile);
                        (this.el.nativeElement as HTMLImageElement).hidden = false;
                        this.renderer.setAttribute(this.el.nativeElement, 'src', HtmlFile);
                    } else {
                        FileToImageDirective.cache.set(key, FileLink);
                        (this.el.nativeElement as HTMLImageElement).hidden = false;
                        this.renderer.setAttribute(this.el.nativeElement, 'src', FileLink);
                    }
                } else {
                    FileToImageDirective.cache.set(key, AnyLink);
                    (this.el.nativeElement as HTMLImageElement).hidden = false;
                    this.renderer.setAttribute(this.el.nativeElement, 'src', AnyLink);
                }
            }

        });
    }

    ngOnDestroy(): void {
        FileToImageDirective.cache.clear();
    }
}