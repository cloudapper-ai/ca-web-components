/* eslint-disable @typescript-eslint/no-inferrable-types */
// recording.service.ts

import { EventEmitter } from "@angular/core";
/**
 * This service manages recording video streams using the MediaRecorder API.
 * It allows starting, stopping, pausing, resuming, and clearing recordings,
 * and provides events when the recording is ready.
 */
export class RecordingService {
    // MediaRecorder instance for recording video
    private mediaRecorder?: MediaRecorder;
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

    // Event emitter for notifying when the video recording is ready
    onVideoReady: EventEmitter<File> = new EventEmitter();

    constructor() { }

    /**
     * Starts recording video stream with given duration and maximum size.
     * @param duration The duration of the recording (in seconds).
     * @param maxSize The maximum size of the recording (in megabytes).
     */
    async startRecording(duration: number, maxSize: number) {
        // Initialize recording parameters
        this.duration = duration;
        this.maxSize = maxSize * 1024 * 1024;
        // Get video stream from user's media devices
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        // Initialize MediaRecorder with video stream
        this.mediaRecorder = new MediaRecorder(stream, {
            mimeType: 'video/webm'
        });
        // Event listener for data available during recording
        this.mediaRecorder.ondataavailable = (event) => {
            if (event.data && event.data.size > 0) {
                this.recordedBlobs.push(event.data);
            }
        };
        // Event listener for when recording stops
        this.mediaRecorder.onstop = (event) => {
            // Create a file from recorded blobs
            const mimeType = 'video/webm';
            const audioBlob = new Blob(this.recordedBlobs, { type: mimeType });
            const file = new File([audioBlob], this.filename(mimeType), {
                type: mimeType,
                lastModified: Date.now()
            });
            // Emit event with the recorded video file
            this.onVideoReady.next(file)
        }

        // Start recording
        this.mediaRecorder.start();
        this.isRecording = true;
        this.startTime = Date.now();

        // Update elapsed time periodically
        this.timerInterval = setInterval(() => {
            this.elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);
            // Check recording size periodically and stop if exceeds maximum size
            if (this.recordedBlobs.length > 0 && this.getBlobSize() >= this.maxSize) {
                this.stopRecording();
            }
        }, 1000);

        // Stop recording after specified duration
        setTimeout(() => {
            this.stopRecording();
        }, (this.duration - this.elapsedTime) * 1000);
    }

    /**
     * Stops the current recording.
     */
    async stopRecording() {
        if (this.isRecording) {
            this.mediaRecorder?.stop();
            this.isRecording = false;
            clearInterval(this.timerInterval);
        }
    }

    /**
     * Pauses the current recording.
     */
    pauseRecording() {
        if (this.isRecording) {
            this.mediaRecorder?.pause();
            this.isPaused = true;
            clearInterval(this.timerInterval);
        }
    }

    /**
     * Resumes the paused recording.
     */
    resumeRecording() {
        if (this.isPaused) {
            this.mediaRecorder?.resume();
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
    clearRecording() {
        // Clear recorded blobs and reset elapsed time
        this.recordedBlobs = [];
        this.elapsedTime = 0;
        // Stop all media tracks in the stream
        this.mediaRecorder?.stream.getTracks().forEach(x => x.stop());
    }

    /**
     * Retrieves the current media stream.
     * @returns The current media stream, if available.
     */
    getStream(): MediaStream | undefined {
        return this.mediaRecorder?.stream;
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
