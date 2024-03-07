/* eslint-disable @typescript-eslint/no-inferrable-types */
import { Directive, ElementRef, Input, OnDestroy, OnInit, Renderer2 } from "@angular/core";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { BehaviorSubject, combineLatest } from "rxjs";
import { getFileExtension, isAnImage, isAnAudio, AudioFile, isAVideo, VideoFile, isADocument, DocFile, isAPDF, PdfFile, isAnHtml, HtmlFile, FileLink, AnyLink } from "../../helpers/attachment-helpers.helper";


@UntilDestroy()
@Directive({
    selector: '[file-url-image]',
    standalone: true
})
export class FileUrlToImageDirective implements OnInit, OnDestroy {


    private static cache: Map<string, string> = new Map();

    private url$: BehaviorSubject<string | undefined> = new BehaviorSubject<string | undefined>(undefined);
    private isImage$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    @Input()
    get url(): string | undefined { return this.url$.getValue(); }
    set url(value: string | undefined) { this.url$.next(value); }

    @Input()
    get isImage(): boolean { return this.isImage$.getValue() }
    set isImage(value: boolean) { this.isImage$.next(value); }


    constructor(private el: ElementRef, private renderer: Renderer2) {
        const img = el.nativeElement as HTMLImageElement;
        if (!img) {
            throw new Error('This directive is only allowed in a image element')
        }
    }

    ngOnInit() {
        combineLatest([this.url$, this.isImage$]).pipe(untilDestroyed(this)).subscribe(([url, isImage]) => {
            if (!url) { (this.el.nativeElement as HTMLImageElement).hidden = true; return; }

            const cached = FileUrlToImageDirective.cache.get(url);
            if (cached) {
                (this.el.nativeElement as HTMLImageElement).hidden = false;
                this.renderer.setAttribute(this.el.nativeElement, 'src', cached);
                return;
            }

            if (isImage) {
                FileUrlToImageDirective.cache.set(url, url);
                (this.el.nativeElement as HTMLImageElement).hidden = false;
                this.renderer.setAttribute(this.el.nativeElement, 'src', url);
            } else {
                const fileextension = getFileExtension(url);
                if (fileextension) {
                    if (isAnImage(fileextension)) {
                        FileUrlToImageDirective.cache.set(url, url);
                        (this.el.nativeElement as HTMLImageElement).hidden = false;
                        this.renderer.setAttribute(this.el.nativeElement, 'src', url);
                    } else if (isAnAudio(fileextension)) {
                        FileUrlToImageDirective.cache.set(url, AudioFile);
                        (this.el.nativeElement as HTMLImageElement).hidden = false;
                        this.renderer.setAttribute(this.el.nativeElement, 'src', AudioFile);
                    } else if (isAVideo(fileextension)) {
                        FileUrlToImageDirective.cache.set(url, VideoFile);
                        (this.el.nativeElement as HTMLImageElement).hidden = false;
                        this.renderer.setAttribute(this.el.nativeElement, 'src', VideoFile);
                    } else if (isADocument(fileextension)) {
                        FileUrlToImageDirective.cache.set(url, DocFile);
                        (this.el.nativeElement as HTMLImageElement).hidden = false;
                        this.renderer.setAttribute(this.el.nativeElement, 'src', DocFile);
                    } else if (isAPDF(fileextension)) {
                        FileUrlToImageDirective.cache.set(url, PdfFile);
                        (this.el.nativeElement as HTMLImageElement).hidden = false;
                        this.renderer.setAttribute(this.el.nativeElement, 'src', PdfFile);
                    } else if (isAnHtml(fileextension)) {
                        FileUrlToImageDirective.cache.set(url, HtmlFile);
                        (this.el.nativeElement as HTMLImageElement).hidden = false;
                        this.renderer.setAttribute(this.el.nativeElement, 'src', HtmlFile);
                    } else {
                        FileUrlToImageDirective.cache.set(url, FileLink);
                        (this.el.nativeElement as HTMLImageElement).hidden = false;
                        this.renderer.setAttribute(this.el.nativeElement, 'src', FileLink);
                    }
                } else {
                    FileUrlToImageDirective.cache.set(url, AnyLink);
                    (this.el.nativeElement as HTMLImageElement).hidden = false;
                    this.renderer.setAttribute(this.el.nativeElement, 'src', AnyLink);
                }
            }

        })
    }

    ngOnDestroy(): void {
        FileUrlToImageDirective.cache.clear();
    }
}