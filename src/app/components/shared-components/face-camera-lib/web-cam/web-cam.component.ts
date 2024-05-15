/* eslint-disable @typescript-eslint/no-inferrable-types */
import { CommonModule } from "@angular/common";
import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from "@angular/core";
import { TakePhotoService } from "./service/take-photo.service";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { BehaviorSubject, distinctUntilChanged, from } from "rxjs";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
import { Assets } from "../lib-models/assets.model";


@UntilDestroy()
@Component({
    selector: 'web-cam',
    templateUrl: './web-cam.component.html',
    styleUrls: ['./web-cam.component.css'],
    standalone: true,
    imports: [CommonModule]
})
export class WebCamComponent implements OnInit, AfterViewInit, OnDestroy {
    constructor(private sanitizer: DomSanitizer, private service: TakePhotoService) {
    }

    @Input() autocapture: boolean = false;
    @Input() allowOverlay: boolean = false;

    @Output() captureCompleted: EventEmitter<File> = new EventEmitter();

    @Output() videoReady: EventEmitter<{
        video: HTMLVideoElement,
        canvas: HTMLCanvasElement
    }> = new EventEmitter();

    @Output() videoEnded: EventEmitter<void> = new EventEmitter()

    protected Assets = Assets;

    @ViewChild('VideoElement')
    protected videoElement?: ElementRef<HTMLVideoElement>;
    @ViewChild('Overlay')
    protected overlayElement?: ElementRef<HTMLCanvasElement>;

    @ViewChild('Canvas')
    protected canvasElement?: ElementRef<HTMLCanvasElement>;


    protected stream?: MediaStream;

    protected error$ = new BehaviorSubject<string | undefined>(undefined)

    protected isPreviewing: boolean = false;

    private availableDevices$ = new BehaviorSubject<MediaDeviceInfo[]>([]);
    private deviceIndex: number = -1;
    protected get availableDevices(): MediaDeviceInfo[] { return this.availableDevices$.getValue(); }
    protected set availableDevices(values: MediaDeviceInfo[]) { this.availableDevices$.next(values); }

    ngOnInit(): void {
        from(this.service.getAvailableDevices()).pipe(untilDestroyed(this)).subscribe({
            next: devices => { this.availableDevices = devices; },
            error: err => { this.availableDevices = []; console.error(err); }
        })
    }
    ngAfterViewInit(): void {
        this.availableDevices$.pipe(untilDestroyed(this), distinctUntilChanged()).subscribe(devices => {
            if (devices.length > 0)
                this.startCaptureV2();
        })
    }

    protected startCaptureV2(index: number = -1) {
        this.isPreviewing = false;
        this.dataUrl = undefined;
        this.capturedFile = undefined;
        this.stopCapture();
        this.service.initiateWebcam(this.availableDevices, index >= 0 ? this.availableDevices[index].deviceId : undefined, undefined)
            .then((value) => { this.error$.next(undefined); this.startCapture(value.stream, value.activeDeviceIndex); })
            .catch(err => this.error$.next(err))
    }

    protected startCapture(stream: MediaStream, activeDeviceIndex: number) {
        if (this.videoElement) {
            this.stream = stream;
            this.videoElement.nativeElement.srcObject = stream;
            this.videoElement.nativeElement.play();
            this.deviceIndex = activeDeviceIndex;
            setTimeout(() => {
                if (this.videoElement && this.overlayElement) {
                    this.videoReady.next({
                        video: this.videoElement.nativeElement,
                        canvas: this.overlayElement.nativeElement
                    })
                }

            }, 750);

        }
    }

    protected stopCapture() {
        if (this.stream && this.videoElement?.nativeElement) {
            this.service.stopMediaTracks(this.stream, this.videoElement.nativeElement);
        }

        this.videoEnded.next();
    }

    ngOnDestroy(): void {
        this.stopCapture();
    }

    protected capturedFile?: File;
    protected dataUrl: SafeUrl | undefined;
    protected setCapturedImage(file?: File) {
        if (file) {

            this.readFile(file).then(url => {
                if (url) {
                    this.isPreviewing = true;
                    this.capturedFile = file;
                    this.dataUrl = url;
                } else {
                    this.isPreviewing = false;
                    this.capturedFile = undefined;
                    this.dataUrl = undefined;
                }
            })
        } else {
            this.isPreviewing = false;
            this.capturedFile = undefined;
            this.dataUrl = undefined;
        }

    }

    private readFile(file: File): Promise<SafeUrl | undefined> {
        return new Promise<SafeUrl | undefined>(resolve => {
            const reader = new FileReader();
            reader.onload = () => {
                resolve(this.sanitizer.bypassSecurityTrustUrl(reader.result as string))
            }

            reader.onerror = () => {
                resolve(undefined);
            }

            reader.readAsDataURL(file);
        })

    }

    protected captureImageClicked() {
        if (this.canvasElement?.nativeElement && this.videoElement?.nativeElement) {
            this.service.takeSnapShot(this.canvasElement.nativeElement, this.videoElement.nativeElement)
                .then(file => {
                    this.stopCapture();
                    if (this.autocapture) {
                        this.captureCompleted.next(file);
                    } else {
                        this.setCapturedImage(file);
                    }
                })
                .catch(err => {
                    this.setCapturedImage(undefined);
                    console.error(err);
                })
        }
    }
    protected rotateCameraClicked() {
        if (this.deviceIndex === -1) { return; }
        const index = (this.deviceIndex + 1) % this.availableDevices.length;
        this.startCaptureV2(index);

    }
    protected submitImageClicked() {
        if (this.isPreviewing && this.capturedFile) {
            this.captureCompleted.next(this.capturedFile);
        }
    }
    protected refreshImageClicked() {
        this.startCaptureV2(this.deviceIndex);
    }

    public requestCaptureImage() {
        this.captureImageClicked();
    }
}