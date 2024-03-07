/* eslint-disable @typescript-eslint/no-inferrable-types */
import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit, Output, EventEmitter, NgZone, Input } from '@angular/core';
import { RecordingService } from '../service/video-recorder.service';
import { Assets } from '../../../../models/assets.model';

@Component({
    selector: 'video-recorder',
    templateUrl: './video-recorder.component.html',
    styleUrls: ['./video-recorder.component.css']
})
export class VideoRecorderComponent implements OnInit, AfterViewInit, OnDestroy {
    protected Assets = Assets;
    @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
    recordingService?: RecordingService;
    @Input() duration: number = 300;
    @Input() maxSize: number = 200;
    @Output() recordCompleted: EventEmitter<File> = new EventEmitter();

    protected elapsedTime: number = 0;
    private timerInterval: any;

    constructor(private zone: NgZone) { }
    ngAfterViewInit(): void {
        this.displayVideoPreview();

        setTimeout(() => { this.startRecording() }, 10);
    }

    ngOnInit() {
        this.recordingService = new RecordingService();

    }

    ngOnDestroy() {
        this.recordingService?.clearRecording();
    }

    protected isRecording: boolean = false;
    protected isPaused: boolean = false;

    protected async startRecording() {
        this.recordingService?.clearRecording();
        this.recordingService?.onVideoReady.subscribe(file => {
            this.zone.run(() => {
                this.recordCompleted.next(file)
            })

            setTimeout(() => {
                this.recordingService?.clearRecording()
                this.recordingService = undefined;
            }, 10)

        })
        this.elapsedTime = 0;
        await this.recordingService?.startRecording(this.duration, this.maxSize);
        this.isRecording = true;
        this.isPaused = false;
        this.displayVideoPreview();
        this.playVideo();
        this.startTimer();
    }

    protected stopRecording() {
        this.recordingService?.stopRecording();
        clearInterval(this.timerInterval);
        this.pauseVideo();
        this.isRecording = false;
        this.isPaused = false;
    }

    protected pauseRecording() {
        this.recordingService?.pauseRecording();
        clearInterval(this.timerInterval);
        this.pauseVideo();
        this.isRecording = true;
        this.isPaused = true;
    }

    protected resumeRecording() {
        this.recordingService?.resumeRecording();
        this.startTimer();
        this.playVideo();
        this.isRecording = true;
        this.isPaused = false;
    }

    protected displayVideoPreview() {
        const videoElement: HTMLVideoElement = this.videoElement.nativeElement;
        const stream = this.recordingService?.getStream()
        if (stream) {
            videoElement.srcObject = stream;
        }
    }

    protected playVideo() {
        const videoElement: HTMLVideoElement = this.videoElement.nativeElement;
        if (videoElement) { videoElement.play(); }
    }

    protected pauseVideo() {
        const videoElement: HTMLVideoElement = this.videoElement.nativeElement;
        if (videoElement) { videoElement.pause(); }
    }

    protected startTimer() {
        this.timerInterval = setInterval(() => {
            this.elapsedTime++;
        }, 1000);
    }


}
