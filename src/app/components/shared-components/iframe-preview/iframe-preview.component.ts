/* eslint-disable @typescript-eslint/no-inferrable-types */
import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { BehaviorSubject } from 'rxjs';
import { Assets } from '../../../models/assets.model';

@UntilDestroy()
@Component({
    selector: 'iframe-preview',
    templateUrl: './iframe-preview.component.html',
    styleUrls: ['./iframe-preview.component.css'],
    standalone: true,
    imports: [CommonModule]
})
export class IframePreviewComponent implements OnInit {
    protected Assets = Assets;

    @ViewChild('iframeElement') iframeRef?: ElementRef<HTMLIFrameElement>;
    private _openingLink: string = 'https://www.cloudapper.com';
    @Input()
    get openingLink(): string { return this._openingLink; }
    set openingLink(value: string) { this._openingLink = value; this.trustedurl = this.sanitizer.bypassSecurityTrustResourceUrl(this.openingLink); }
    protected trustedurl: SafeResourceUrl = ''

    @Output() errorReceived: EventEmitter<string> = new EventEmitter();

    constructor(private sanitizer: DomSanitizer) { }
    ngOnInit(): void {
        this.error$.pipe(untilDestroyed(this)).subscribe(error => {
            if (error) {
                setTimeout(() => {
                    this.errorReceived.next(error)
                }, 500);
            }
        })
    }

    protected isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
    protected error$: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

    protected onLoad() {
        this.isLoading$.next(false);

    }
}