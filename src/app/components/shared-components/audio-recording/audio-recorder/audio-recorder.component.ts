/* eslint-disable @typescript-eslint/no-inferrable-types */
import { Component, ViewChild, ElementRef, Output, EventEmitter, NgZone, Input, OnDestroy } from '@angular/core';
import { AudioRecordingService } from '../audio-service/audio-recording.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { distinctUntilChanged } from 'rxjs';

@UntilDestroy()
@Component({
    selector: 'audio-recorder',
    templateUrl: './audio-recorder.component.html',
    styleUrls: ['./audio-recorder.component.css']
})
export class AudioRecorderComponent implements OnDestroy {
    @ViewChild('soundWaveCanvas') soundWaveCanvas!: ElementRef<HTMLCanvasElement>;
    protected isRecording: boolean = false;
    protected isPaused: boolean = false;
    protected timeElapsed: number = 0;

    constructor(private zone: NgZone) { }

    ngOnDestroy(): void {
        this.releaseAudioService();
    }

    private releaseAudioService() {
        if (this.audioRecordingService) {
            this.audioRecordingService.releaseRecorder();
            this.audioRecordingService.recordingStarted.unsubscribe();
            this.audioRecordingService.recordingPaused.unsubscribe();
            this.audioRecordingService.recordingResumed.unsubscribe();
            this.audioRecordingService.recordingStopped.unsubscribe();
            this.audioRecordingService.elapsedRecordingTime.unsubscribe();
            this.audioRecordingService = null;
        }
    }

    @Input() maxRecordingDurationInSec: number = 60;
    @Input() maxFileSizeInMb: number = 200;

    @Output() started: EventEmitter<void> = new EventEmitter();

    private audioRecordingService: AudioRecordingService | null = null;
    startRecording(): void {
        this.audioRecordingService = new AudioRecordingService(this.maxRecordingDurationInSec, this.maxFileSizeInMb);
        this.audioRecordingService.recordingStarted.pipe(untilDestroyed(this)).subscribe(() => {
            this.isRecording = true;
            this.started.next();
        });
        this.audioRecordingService.recordingPaused.pipe(untilDestroyed(this)).subscribe(() => {
            this.isPaused = true;
        });
        this.audioRecordingService.recordingResumed.pipe(untilDestroyed(this)).subscribe(() => {
            this.isPaused = false;
        });

        this.audioRecordingService.elapsedRecordingTime.pipe(untilDestroyed(this), distinctUntilChanged()).subscribe(time => {
            this.zone.run(() => {
                this.timeElapsed = time;
            })

        })

        this.audioRecordingService.recordingStopped.pipe(untilDestroyed(this)).subscribe((file) => {
            this.zone.run(() => {
                this.isRecording = false;
                this.isPaused = false;

                this.recordCompleted.next(file)
            })

            this.releaseAudioService();
        });


        const soundWaveCanvas = this.soundWaveCanvas.nativeElement;
        this.audioRecordingService.startRecording(soundWaveCanvas);
    }

    stopRecording(): void {
        this.audioRecordingService?.stopRecording();
    }

    pauseRecording(): void {
        this.audioRecordingService?.pauseRecording();
    }

    resumeRecording(): void {
        this.audioRecordingService?.resumeRecording();
    }

    @Output() recordCompleted: EventEmitter<File> = new EventEmitter();
}
