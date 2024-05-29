/* eslint-disable @typescript-eslint/no-inferrable-types */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { VideoRecorderService } from '../service/video-recorder.service';
import { Assets } from '../models/assets.model';
import { FileInformation } from '../models/file-info.model';

@Component({
    selector: 'ca-video-recorder',
    templateUrl: './video-recorder.component.html',
    styleUrls: ['./video-recorder.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class VideoRecorderComponent implements OnInit, OnDestroy {

    constructor(private cdr: ChangeDetectorRef) { }

    private videoService: VideoRecorderService = new VideoRecorderService();

    protected startCamera(deviceId?: string) {
        if (this.stream)
            this.stopCamera(this.stream);
        const tempId = deviceId ? deviceId : this.devices[0].deviceId
        this.videoService.initiateWebcam(this.devices, tempId)
            .then(result => {
                this.isCameraRunning = true;
                this.activeDeviceIndex = result.activeDeviceIndex;
                this.isBackcamera = !this.devices[this.activeDeviceIndex].label.toLowerCase().includes('front');
                if (this.videoLive) {
                    this.videoLive.nativeElement.srcObject = result.stream
                    this.videoLive.nativeElement.muted = true;
                    this.videoLive.nativeElement.play();
                }
                this.stream = result.stream;
                this.cdr.detectChanges();
            })
            .catch(reason => {
                this.error$.next(reason);
                this.isCameraRunning = false;
                this.cdr.detectChanges();
            })
    }

    protected startRecording2() {
        if (!this.stream) { return; }
        this.startRecording(this.stream);
    }


    protected stopRecording2() {
        if (this.stream) {
            if (this.recorder)
                this.stopRecording(this.recorder);
            this.stopCamera(this.stream);
            this.recorder = undefined;
        }
    }

    private stopRecording(recorder: MediaRecorder) {
        this.isReplaying = this.allowReplay;
        recorder.stop();
        this.cdr.detectChanges();
    }


    protected onVideoDataRecived(event: BlobEvent) {
        this.processRecordedBytes(event.data);
    }

    private processRecordedBytes(blob: Blob) {
        if (blob && blob.size > 0) { this.recordedBlobParts.push(blob); this.recordedBlobSize += blob.size; if (this.recordedBlobSize >= this.maxSizeinByte) { this.stopRecording2(); } }
    }

    protected onVideoStarted() {
        this.recordingTimer = setInterval(() => {
            this.recorder?.requestData();

            this.timeElapsed += 1;
            if (this.timeElapsed > this.maxDurationInSec) {
                this.stopRecording2();
            }
            this.cdr.detectChanges();
        }, 1000);
    }


    protected recordedBlob?: FileInformation;

    protected onVideoStopped() {
        if (this.recordingTimer) clearInterval(this.recordingTimer);
        this.timeElapsed = 0;
        if (this.isRecording) {
            console.log('I am here')
            this.processRecordedBlobs().then(data => {
                if (this.isReplaying && this.videoRecorded) {
                    this.videoRecorded.nativeElement.srcObject = null;
                    this.videoRecorded.nativeElement.src = URL.createObjectURL(data.data);
                    this.videoRecorded.nativeElement.muted = false;
                    this.cdr.detectChanges();
                }

                this.recordedBlob = data;
            }).catch(error => {
                this.error$.next(error.message || error);
                this.cdr.detectChanges();
            })
        }
        this.isRecording = false;
        this.cdr.detectChanges();
    }

    private processRecordedBlobs(): Promise<FileInformation> {
        return new Promise((resolve, reject) => {
            if (this.recordedBlobParts.length > 0) {
                const mimeType = this.recordedBlobParts[0].type;
                const blob = new Blob(this.recordedBlobParts, { type: mimeType });
                this.recordedBlobParts = [];
                this.recordedBlobSize = 0;
                resolve(new FileInformation(this.videoService.getFilename(mimeType), blob));
            } else {
                reject('Recording Failed');
            }
        })

    }

    private startRecording(stream: MediaStream) {
        this.recordedBlob = undefined;
        this.turnOnOffTorch(stream, this.isFlashOn);
        this.timeElapsed = 0;
        if (this.videoLive) {
            this.videoLive.nativeElement.muted = true;
            this.videoLive.nativeElement.srcObject = stream;
            this.videoLive.nativeElement.play();
            this.cdr.detectChanges();
        }

        const recorder = this.videoService.setupRecorder(stream, this.onVideoDataRecived.bind(this), this.onVideoStarted.bind(this), this.onVideoStopped.bind(this));
        this.recorder = recorder;
        recorder.start();
        this.isRecording = true;
        this.isReplaying = false;
        this.cdr.detectChanges();
    }

    protected switchCamera() {
        const newIndex = ((this.activeDeviceIndex + 1) % this.devices.length);

        this.startCamera(this.devices[newIndex].deviceId);
    }

    protected turnOnOffTorch2(turnOn: boolean) {
        if (this.stream) { this.turnOnOffTorch(this.stream, turnOn); }
    }

    private turnOnOffTorch(stream: MediaStream, turnOn: boolean) {
        if (this.isMobileDevice) {
            if (turnOn) {
                this.videoService.turnOnTorch(stream).then(success => { if (success) { this.isFlashOn = true; this.cdr.detectChanges(); } })
            } else {
                this.videoService.turnOffTorch(stream).then(success => { if (success) { this.isFlashOn = false; this.cdr.detectChanges(); } })
            }
        }
    }

    private stopCamera(stream: MediaStream) {
        if (!this.isCameraRunning) { return; }
        this.turnOnOffTorch(stream, false);
        this.videoService.stopMediaTracks(stream);
        if (this.videoLive) {
            this.videoLive.nativeElement.srcObject = null;
        }
        this.stream = undefined;
        this.isCameraRunning = false;
        this.cdr.detectChanges();
    }

    protected onCancelRecording() {
        this.isRecording = false;
        this.stopRecording2();
        this.cdr.detectChanges();
        this.recordingCanceled.emit();

    }

    ngOnDestroy(): void {
        this.isRecording = false;
        this.stopRecording2();
        this.recordedBlobParts = [];
        this.recordedBlobSize = 0;
    }

    protected devices: MediaDeviceInfo[] = []
    protected error$: BehaviorSubject<string | undefined> = new BehaviorSubject<string | undefined>(undefined);
    private stream: MediaStream | undefined = undefined;
    private recorder: MediaRecorder | undefined = undefined;
    private recordedBlobParts: Blob[] = []
    private recordedBlobSize: number = 0;

    ngOnInit(): void {
        this.videoService.getAvailableDevices().then(devices => {
            this.devices = devices;
            this.allowSwitchingCamera = devices.length > 1;
            this.error$.next(undefined);
            this.startCamera();
            this.cdr.detectChanges();
        }
        ).catch(reason => {
            this.allowSwitchingCamera = false;
            console.error(reason);
            this.devices = [];
            this.error$.next(reason);
            this.cdr.detectChanges();
        })
    }

    protected onSubmitFile() {
        if (this.recordedBlob) { this.recordCompleted.next(this.recordedBlob); }
    }

    protected tryAgain() {
        if (this.devices.length > this.activeDeviceIndex) {
            this.isReplaying = false;
            this.isRecording = false;
            const deviceId = this.devices[this.activeDeviceIndex].deviceId;
            this.startCamera(deviceId);
        }
    }

    protected recordingTimer: NodeJS.Timeout | undefined = undefined;
    protected activeDeviceIndex: number = 0;
    protected isCameraRunning = false;
    protected Assets = Assets;
    protected isFlashOn: boolean = false;
    protected isRecording: boolean = false;
    protected timeElapsed: number = 0;

    protected isMobileDevice = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    protected isReplaying: boolean = false;
    protected allowSwitchingCamera = false;
    protected isBackcamera = false;

    @ViewChild('videoLive') videoLive: ElementRef<HTMLVideoElement> | undefined = undefined;
    @ViewChild('videoRecorded') videoRecorded: ElementRef<HTMLVideoElement> | undefined = undefined;

    private maxSizeinByte: number = 200000000;
    private _maxSizeInMb: number = 200;
    @Input()
    get maxSizeInMb(): number { return this._maxSizeInMb; }
    set maxSizeInMb(value: number) { this._maxSizeInMb = value; this.maxSizeinByte = value * 1024 * 1024; }
    @Input() maxDurationInSec: number = 600;

    @Input() allowReplay = true;

    @Output() recordCompleted = new EventEmitter<FileInformation>()
    @Output() recordingCanceled = new EventEmitter<void>()

}
