/* eslint-disable @typescript-eslint/no-inferrable-types */
// recording.service.ts

import { EventEmitter } from "@angular/core";
import { RecordRTCPromisesHandler } from 'recordrtc';
/**
 * This service manages recording video streams using the MediaRecorder API.
 * It allows starting, stopping, pausing, resuming, and clearing recordings,
 * and provides events when the recording is ready.
 */
export class RecordingService {
    private recordRTC?: RecordRTCPromisesHandler; // RecordRTC instance for recording video

    // MediaRecorder instance for recording video
    // private mediaRecorder?: MediaRecorder;

    // Array to store recorded video blobs
    private recordedBlobs: Blob[] = [];
    // Duration of recording (in seconds)
    private duration: number = 300;
    // Maximum size of recorded video (in bytes)
    private maxSize: number = 200;
    // Flags to track recording and pause states
    private isRecording = false;
    private isPaused = false;
    // Variables to track recording duration and timing
    private startTime: number = 0;
    private elapsedTime: number = 0;
    // Interval reference for updating recording duration
    private timerInterval: any;

    private stream?: MediaStream;

    // Event emitter for notifying when the video recording is ready
    onVideoReady: EventEmitter<File> = new EventEmitter();

    constructor() { }

    async startRecording(duration: number, maxSize: number) {
        this.duration = duration;
        this.maxSize = maxSize * 1024 * 1024;
        this.elapsedTime = 0
        this.stream = undefined;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: {
                    echoCancellation: true
                }
            });


            this.recordRTC = new RecordRTCPromisesHandler(stream, {
                type: 'video',
                disableLogs: true,
                timeSlice: 1000,
                ondataavailable: (data) => {
                    this.recordedBlobs.push(data);
                }
            });
            await this.recordRTC.startRecording();
            this.stream = stream;

            this.isRecording = true;
            this.startTime = Date.now();

            this.timerInterval = setInterval(() => {
                // Update elapsed time periodically
                this.elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);
                // Check recording size periodically and stop if exceeds maximum size
                if (this.recordedBlobs.length > 0 && this.getBlobSize() >= this.maxSize) {
                    this.stopRecording();
                }
            }, 1000);

            setTimeout(() => {
                this.stopRecording();
            }, this.duration * 1000);
        } catch (error) {
            console.error('Error accessing media devices:', error);
        }
    }

    async stopRecording() {
        if (this.isRecording) {
            this.recordedBlobs = [];
            clearInterval(this.timerInterval);
            await this.recordRTC?.stopRecording();
            const videoBlob = await this.recordRTC?.getBlob();
            let file: File | undefined = undefined;
            if (videoBlob) {
                file = new File([videoBlob], this.filename(videoBlob.type), {
                    type: videoBlob.type,
                    lastModified: Date.now()
                });
            }

            await this.clearRecording();

            setTimeout(() => {
                if (file) {
                    this.onVideoReady.next(file);
                }
            }, 500);

            this.isRecording = false;
        }
    }

    // /**
    //  * Starts recording video stream with given duration and maximum size.
    //  * @param duration The duration of the recording (in seconds).
    //  * @param maxSize The maximum size of the recording (in megabytes).
    //  */
    // async startRecording(duration: number, maxSize: number) {
    //     try {
    //         // Initialize recording parameters
    //         this.duration = duration;
    //         this.maxSize = maxSize * 1024 * 1024;
    //         // Get video stream from user's media devices
    //         const stream = await navigator.mediaDevices.getUserMedia({
    //             video: true, audio: {
    //                 echoCancellation: true
    //             }
    //         });
    //         // Initialize MediaRecorder with video stream
    //         this.mediaRecorder = new MediaRecorder(stream);
    //         // Event listener for data available during recording
    //         this.mediaRecorder.ondataavailable = (event) => {
    //             if (event.data && event.data.size > 0) {
    //                 this.recordedBlobs.push(event.data);
    //             }
    //         };
    //         // Event listener for when recording stops
    //         this.mediaRecorder.onstop = (event) => {
    //             // Create a file from recorded blobs
    //             const videoBlob = new Blob(this.recordedBlobs);
    //             const file = new File([videoBlob], this.filename(videoBlob.type), {
    //                 type: videoBlob.type,
    //                 lastModified: Date.now()
    //             });
    //             // Emit event with the recorded video file
    //             this.onVideoReady.next(file)
    //         }

    //         this.mediaRecorder.onerror = (event: any) => {
    //             console.log('Media recording error: ', event.error)
    //         }

    //         // Start recording
    //         this.mediaRecorder.start();
    //         this.isRecording = true;
    //         this.startTime = Date.now();

    //         this.timerInterval = setInterval(() => {
    //             // Update elapsed time periodically
    //             this.elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);
    //             // Check recording size periodically and stop if exceeds maximum size
    //             if (this.recordedBlobs.length > 0 && this.getBlobSize() >= this.maxSize) {
    //                 this.stopRecording();
    //             }
    //         }, 1000);

    //         // Stop recording after specified duration
    //         setTimeout(() => {
    //             this.stopRecording();
    //         }, (this.duration - this.elapsedTime) * 1000);
    //     } catch (error) {
    //         throw error;
    //     }

    // }

    // /**
    //  * Stops the current recording.
    //  */
    // async stopRecording() {
    //     if (this.isRecording) {
    //         this.mediaRecorder?.stop();
    //         this.isRecording = false;
    //         clearInterval(this.timerInterval);
    //     }
    // }

    /**
     * Pauses the current recording.
     */
    async pauseRecording() {
        if (this.isRecording) {
            await this.recordRTC?.pauseRecording()
            this.isPaused = true;
            // stop elapsed time count down.
            clearInterval(this.timerInterval);
        }
    }

    /**
     * Resumes the paused recording.
     */
    async resumeRecording() {
        if (this.isPaused) {
            await this.recordRTC?.resumeRecording()
            this.isPaused = false;
            this.startTime = Date.now() - (this.elapsedTime * 1000);
            // Resume updating elapsed time periodically
            this.timerInterval = setInterval(() => {
                this.elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);
                // Check recording size periodically and stop if exceeds maximum size
                if (this.recordedBlobs.length > 0 && this.getBlobSize() >= this.maxSize) {
                    this.stopRecording();
                }
            }, 1000);
        }
    }

    /**
     * Clears the current recording.
     */
    async clearRecording() {
        // Clear recorded blobs and reset elapsed time
        this.recordedBlobs = [];
        this.elapsedTime = 0;
        await this.recordRTC?.reset()
        await this.recordRTC?.destroy();
        this.stream?.getTracks().forEach(x => x.stop())
        this.stream = undefined;
    }

    /**
     * Retrieves the current media stream.
     * @returns The current media stream, if available.
     */
    getStream(): MediaStream | undefined {
        return this.stream;
    }

    /**
     * Calculates the size of recorded blobs.
     * @returns The total size of recorded blobs (in bytes).
     */
    private getBlobSize() {
        return new Blob(this.recordedBlobs).size;
    }

    /**
     * Determines the file extension from the given MIME type.
     * @param mimeType The MIME type of the file.
     * @returns The file extension corresponding to the MIME type.
     */
    private getFileExtensionFromMimeType(mimeType: string): string {
        // Determine file extension based on MIME type
        if (mimeType.startsWith('video/webm')) {
            return '.webm';
        } else if (mimeType.startsWith('video/mp4')) {
            return '.mp4';
        } else if (mimeType.startsWith('video/x-matroska')) {
            return '.mkv';
        } else if (mimeType.startsWith('video/3gp')) {
            return '.3gp';
        } else if (mimeType.startsWith('video/quicktime')) {
            return '.mov';
        } else {
            return '';
        }
    }

    /**
     * Generates a filename based on the current timestamp and file extension.
     * @param mimeType The MIME type of the file.
     * @returns The generated filename.
     */
    private filename(mimeType: string): string {
        const extension = this.getFileExtensionFromMimeType(mimeType);
        return 'Recording-' + Date.now() + extension;
    }
}
