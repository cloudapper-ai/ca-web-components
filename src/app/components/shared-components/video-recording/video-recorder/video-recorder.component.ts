/* eslint-disable @typescript-eslint/no-inferrable-types */
import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit, Output, EventEmitter, NgZone, Input } from '@angular/core';
import { RecordingService } from '../service/video-recorder.service';
import { Assets } from '../../../../models/assets.model';

@Component({
    selector: 'video-recorder',
    templateUrl: './video-recorder.component.html',
    styleUrls: ['./video-recorder.component.css']
})
export class VideoRecorderComponent implements AfterViewInit, OnDestroy {
    protected Assets = Assets;
    @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
    @ViewChild('videoCanvas') canvasElement!: ElementRef<HTMLCanvasElement>;

    recordingService?: RecordingService;
    @Input() duration: number = 300;
    @Input() maxSize: number = 200;
    @Output() recordCompleted: EventEmitter<File> = new EventEmitter();
    @Output() cancel: EventEmitter<string | undefined> = new EventEmitter();

    protected stopCanvasRendering = false;
    protected elapsedTime: number = 0;
    private timerInterval: any;

    constructor(private zone: NgZone) { }
    ngAfterViewInit(): void {
        this.displayVideoPreview();

        setTimeout(() => { this.startRecording() }, 10);
    }

    ngOnDestroy() {
        this.recordingService?.clearRecording();
    }

    protected isRecording: boolean = false;
    protected isPaused: boolean = false;


    protected async onFileReady(file: File) {
        this.recordingService = undefined;
        this.zone.run(() => {
            this.recordCompleted.next(file)
        })
    }

    protected async startRecording() {
        this.recordingService = new RecordingService();
        this.recordingService.onVideoReady.subscribe(file => {
            this.onFileReady(file);

        })
        this.elapsedTime = 0;
        try {
            await this.recordingService?.startRecording(this.duration, this.maxSize);
            this.isRecording = true;
            this.isPaused = false;
            this.displayVideoPreview();
            this.playVideo();
            this.startTimer();
        } catch (error: any) {
            this.cancel.next(error.message)
        }

    }

    protected stopRecording() {
        this.stopCanvasRendering = true;
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
        videoElement.muted = true;
        const stream = this.recordingService?.getStream()
        if (stream) {
            videoElement.srcObject = stream;
            this.stopCanvasRendering = false;
            this.processVideoFrames(videoElement, this.canvasElement.nativeElement)
        }
    }

    private processVideoFrames(videoElement: HTMLVideoElement, canvasElement: HTMLCanvasElement) {
        const context = canvasElement.getContext('2d');
        const processFrame = () => {
            if (context && !videoElement.paused && !videoElement.ended) {
                canvasElement.width = videoElement.videoWidth;
                canvasElement.height = videoElement.videoHeight;
                context.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
                // Perform processing or analysis on the canvas image data
                // For example, you can use libraries like TensorFlow.js for machine learning tasks
            }
            if (!this.stopCanvasRendering)
                requestAnimationFrame(processFrame);
        };
        if (!this.stopCanvasRendering)
            requestAnimationFrame(processFrame);
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
