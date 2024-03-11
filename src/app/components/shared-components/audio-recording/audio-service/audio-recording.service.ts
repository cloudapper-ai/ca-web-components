/* eslint-disable @typescript-eslint/no-inferrable-types */
import { EventEmitter } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export class AudioRecordingService {
    private mediaRecorder: MediaRecorder | null = null;
    private recordedChunks: Blob[] = [];
    private isRecording: boolean = false;
    private isPaused: boolean = false;
    private isStopped: boolean = false;
    private maxDurationInSeconds: number = 60;
    private maxFileSizeInBytes: number = 10 * 1024 * 1024; // 10 MB
    private startTime: number = 0;
    private pausedTime: number = 0;

    private audioContext: AudioContext | null = null;
    private audioAnalyser: AnalyserNode | null = null;
    private dataArray: Uint8Array | null = null;
    private soundWaveCanvas: HTMLCanvasElement | null = null;
    private canvasContext: CanvasRenderingContext2D | null = null;

    constructor(maxDurationInSecond: number, maxFilesizeInMb: number) {
        this.maxDurationInSeconds = maxDurationInSecond;
        this.maxFileSizeInBytes = maxFilesizeInMb * 1024 * 1024;
    }

    recordingStarted: EventEmitter<void> = new EventEmitter<void>();
    recordingPaused: EventEmitter<void> = new EventEmitter<void>();
    recordingResumed: EventEmitter<void> = new EventEmitter<void>();
    recordingStopped: EventEmitter<File> = new EventEmitter<File>();
    elapsedRecordingTime: BehaviorSubject<number> = new BehaviorSubject(0);

    private getFileExtensionFromMimeType(mimeType: string): string {
        if (mimeType.startsWith('audio/wav')) {
            return '.wav';
        } else if (mimeType.startsWith('audio/webm')) {
            return '.webm';
        } else if (mimeType.startsWith('audio/ogg')) {
            return '.ogg';
        } else if (mimeType.startsWith('audio/mpeg')) {
            return '.mp3';
        } else {
            return ''
        }
    }

    private filename(mimeType: string): string {
        const extension = this.getFileExtensionFromMimeType(mimeType);
        return 'Recording-' + Date.now() + '.mp3';
    }

    async startRecording(soundWaveCanvas: HTMLCanvasElement): Promise<void> {
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                this.isStopped = false;

                this.recordedChunks = [];
                this.mediaRecorder = new MediaRecorder(stream);
                this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
                    if (!this.isPaused) {
                        this.recordedChunks.push(event.data);
                        if (this.getTotalSize() > this.maxFileSizeInBytes) {
                            this.stopRecording();
                        }
                    }
                };
                this.mediaRecorder.onstop = () => {
                    setTimeout(() => {
                        const mimeType = this.mediaRecorder ? this.mediaRecorder.mimeType : 'audio/wav';
                        const audioBlob = new Blob(this.recordedChunks, { type: mimeType });
                        const file = new File([audioBlob], this.filename(mimeType), {
                            type: mimeType,
                            lastModified: Date.now()
                        });
                        setTimeout(() => {
                            this.recordingStopped.next(file)
                        }, 10);
                    }, 100)


                };
                this.mediaRecorder.start();
                this.isRecording = true;
                this.startTime = Date.now();
                this.elapsedRecordingTime.next(0);

                // Setup audio context and analyzer
                this.audioContext = new AudioContext();
                const source = this.audioContext.createMediaStreamSource(stream);
                this.audioAnalyser = this.audioContext.createAnalyser();
                source.connect(this.audioAnalyser);
                this.audioAnalyser.fftSize = 2048; // Adjust as needed
                this.dataArray = new Uint8Array(this.audioAnalyser.frequencyBinCount);

                // Setup canvas for drawing soundwave
                this.soundWaveCanvas = soundWaveCanvas;
                this.canvasContext = this.soundWaveCanvas.getContext('2d');
                if (this.canvasContext) {
                    this.canvasContext.fillStyle = 'rgb(200, 200, 200)';
                    this.canvasContext.lineWidth = 2;
                    this.canvasContext.strokeStyle = 'rgb(0, 0, 0)';
                }

                this.recordingStarted.emit();
                setTimeout(() => {
                    this.drawRepeatedly();
                }, 10)

            })
            .catch(error => {
                console.error('Error starting recording:', error);
            });
    }

    async drawRepeatedly(): Promise<void> {
        if (this.isStopped) { return; }
        const elapsedTime = (Date.now() - this.startTime) / 1000;

        if (elapsedTime > this.maxDurationInSeconds) {
            this.stopRecording();
            return;
        }

        this.elapsedRecordingTime.next(elapsedTime);

        if (this.isRecording && !this.isPaused) {

            await this.drawSoundWave();
            setTimeout(() => { this.drawRepeatedly(); }, 100);
        }
    }

    stopRecording() {
        if (this.isRecording || this.isPaused) {
            this.isStopped = true;
            this.isRecording = false;
            this.isPaused = false;
            this.startTime = 0;
            this.pausedTime = 0;

            this.soundWaveCanvas = null

            if (this.audioAnalyser) {
                this.audioAnalyser.disconnect()
                this.audioAnalyser = null;
            }
            if (this.audioContext) {
                this.audioContext.close();
                this.audioContext = null;
            }
            setTimeout(() => { if (this.mediaRecorder) this.mediaRecorder.stop(); }, 10)

        }
    }

    releaseRecorder() {
        // Release microphone
        if (this.mediaRecorder) {
            if (this.mediaRecorder.stream) {
                this.mediaRecorder.stream.getTracks().forEach(track => {
                    track.stop();
                });
            }

        }
    }

    pauseRecording() {
        if (this.mediaRecorder && this.isRecording && !this.isPaused) {
            this.mediaRecorder.pause();
            this.isPaused = true;
            this.pausedTime = Date.now();
            this.recordingPaused.emit();
        }
    }

    resumeRecording() {
        if (this.mediaRecorder && this.isPaused) {
            this.mediaRecorder.resume();
            this.isPaused = false;
            this.startTime += Date.now() - this.pausedTime;
            this.pausedTime = 0;

            this.drawRepeatedly();

            this.recordingResumed.emit();
        }
    }

    getTotalSize(): number {
        return this.recordedChunks.reduce((total, chunk) => total + chunk.size, 0);
    }

    async drawSoundWave(): Promise<void> {
        return new Promise(resolve => {
            if (!this.audioContext || !this.audioAnalyser || !this.dataArray || !this.canvasContext) return;

            this.audioAnalyser.getByteFrequencyData(this.dataArray);

            const barWidth = (this.soundWaveCanvas!.width / this.dataArray.length) * 2.5;
            let barHeight;
            let x = 0;

            this.canvasContext.clearRect(0, 0, this.soundWaveCanvas!.width, this.soundWaveCanvas!.height);

            for (let i = 0; i < this.dataArray.length; i++) {
                barHeight = this.dataArray[i] / 2;

                this.canvasContext.fillStyle = 'rgb(' + (barHeight + 100) + ',50,50)';
                this.canvasContext.fillRect(x, this.soundWaveCanvas!.height - barHeight / 2, barWidth, barHeight);

                x += barWidth + 1;
            }

            resolve();
        })


        // this.elapsedRecordingTime = (Date.now() - this.startTime) / 1000;
        // if (this.isRecording && this.elapsedRecordingTime >= this.maxDurationInSeconds) {
        //     this.stopRecording();
        //     this.maxDurationReached.emit();
        // } else if (this.isRecording && !this.isPaused) {
        //     requestAnimationFrame(() => { this.drawingService.next(this.isRecording && !this.isPaused) })
        // }
    }
}
