/* eslint-disable @typescript-eslint/no-inferrable-types */
// recording.service.ts

import { EventEmitter } from "@angular/core";
import { MediaStreamRecorder, RecordRTCPromisesHandler } from 'recordrtc';
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

    startRecording(duration: number, maxSize: number): Promise<void> {
        return new Promise((resolve, reject) => {

            if (typeof MediaStreamRecorder === undefined) {
                reject('Your browser does not support this feature.')
                return;
            }

            this.duration = duration;
            this.maxSize = maxSize * 1024 * 1024;
            this.elapsedTime = 0
            this.stream = undefined;

            try {
                navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: {
                        echoCancellation: true
                    }
                }).then(stream => {
                    this.recordRTC = new RecordRTCPromisesHandler(stream, {
                        type: 'video',
                        timeSlice: 1000,
                        mimeType: 'video/webm',
                        disableLogs: true,
                        ondataavailable: (data) => {
                            this.recordedBlobs.push(data);
                        }
                    });
                    this.recordRTC.startRecording().then(() => {
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

                        resolve();
                    }).catch(reason => {
                        reject(reason)
                    });

                }).catch(reason => {
                    reject(reason)
                });

            } catch (error: any) {
                console.error('Error accessing media devices:', error);
                reject(error.message)
            }
        })

    }

    stopRecording(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.isRecording) {
                this.recordRTC?.stopRecording().then(() => {
                    // const videoBlob = new Blob(this.recordedBlobs);
                    this.recordRTC?.getBlob().then(videoBlob => {
                        const file = new File([videoBlob], this.filename(videoBlob.type), {
                            type: videoBlob.type,
                            lastModified: Date.now()
                        });
                        this.onVideoReady.next(file);
                        this.isRecording = false;
                        if (this.timerInterval) {
                            clearInterval(this.timerInterval);
                        }
                        setTimeout(() => {
                            this.clearRecording();
                        }, 250);
                        resolve();
                    }).catch(error => {
                        if (this.timerInterval) {
                            clearInterval(this.timerInterval);
                        }
                        setTimeout(() => {
                            this.clearRecording();
                        }, 250);
                        if (error) {
                            if (error === 'Empty blob.') {
                                reject('Your browser does not support this feature.');
                            } else {
                                reject(error);
                            }
                        } else {
                            reject('Unfortunately we could not record anything.');
                        }
                        reject(error ? error : 'Unknown error');
                    })

                }).catch(error => {
                    if (this.timerInterval) {
                        clearInterval(this.timerInterval);
                    }
                    setTimeout(() => {
                        this.clearRecording();
                    }, 250);
                    if (error) {
                        if (error === 'Empty blob.') {
                            reject('Your browser does not support this feature.');
                        } else {
                            reject(error);
                        }
                    } else {
                        reject('Unfortunately we could not record anything.');
                    }
                    reject(error ? error : 'Unknown error');
                })
            } else {
                reject('Recoding is not on going');
            }
        })

    }

    /**
     * Pauses the current recording.
     */
    pauseRecording() {
        if (this.isRecording) {
            this.recordRTC?.pauseRecording().then(() => {
                this.isPaused = true;
                // stop elapsed time count down.
                clearInterval(this.timerInterval);
            });

        }
    }

    /**
     * Resumes the paused recording.
     */
    resumeRecording() {
        if (this.isPaused) {
            this.recordRTC?.resumeRecording().then(() => {
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
            })
        }
    }

    /**
     * Clears the current recording.
     */
    clearRecording() {
        // Clear recorded blobs and reset elapsed time
        try {
            this.recordedBlobs = [];
            this.elapsedTime = 0;
            this.stream?.getTracks().forEach(x => x.stop());
            this.recordRTC?.reset()
            this.recordRTC?.destroy();
            this.stream = undefined;
        } catch (_error) { }

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
            return '.wmv'; // this file type is not supported by browser.
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
