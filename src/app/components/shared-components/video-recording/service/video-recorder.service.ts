/* eslint-disable @typescript-eslint/no-inferrable-types */

export class VideoRecorderService {
    private static DEFAULT_VIDEO_OPTIONS: MediaTrackConstraints = { facingMode: 'environment' };

    /**
     * Lists available videoInput devices
     * @returns a list of media device info.
     */
    getAvailableDevices(): Promise<MediaDeviceInfo[]> {
        if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
            return Promise.reject("Couldn't find camera information");
        }

        return new Promise((resolve, reject) => {
            navigator.mediaDevices.getUserMedia({ audio: true, video: true }).then((stream) => {

                navigator.mediaDevices.enumerateDevices()
                    .then((devices: MediaDeviceInfo[]) => {
                        stream.getTracks().forEach(x => x.stop());
                        setTimeout(() => {
                            resolve(devices.filter(x => x.kind === 'videoinput'));
                        }, 1000);
                    })
                    .catch(err => {
                        reject(err.message || err);
                        stream.getTracks().forEach(x => x.stop());
                    })
            })

        })
    }

    /**
     * Stops all active media tracks.
     * This prevents the webcam from being indicated as active,
     * even if it is no longer used by this component.
     */
    stopMediaTracks(stream: MediaStream) {
        const tracks = stream.getTracks();
        if (tracks && tracks.length) {
            // pause video to prevent mobile browser freezes
            tracks.forEach(x => x.stop());
        }
    }

    /**
     * Get MediaTrackConstraints to request streaming the given device
     * @param deviceId
     * @param baseMediaTrackConstraints base constraints to merge deviceId-constraint into
     * @returns
   */
    private getMediaConstraintsForDevice(deviceId?: string, baseMediaTrackConstraints?: MediaTrackConstraints): MediaTrackConstraints {
        const result: MediaTrackConstraints = baseMediaTrackConstraints ? baseMediaTrackConstraints : VideoRecorderService.DEFAULT_VIDEO_OPTIONS;
        if (deviceId) {
            result.deviceId = { exact: deviceId };
        }

        return result;
    }

    /**
     * Extracts the value from the given ConstrainDOMString
     * @param constrainDOMString
     */
    private getValueFromConstrainDOMString(constrainDOMString: ConstrainDOMString): string | undefined {
        if (constrainDOMString) {
            if (constrainDOMString instanceof String) {
                return String(constrainDOMString);
            } else if (Array.isArray(constrainDOMString) && Array(constrainDOMString).length > 0) {
                return String(constrainDOMString[0]);
            } else if (typeof constrainDOMString === 'object') {
                const obj = constrainDOMString as ConstrainDOMStringParameters;
                if (obj.exact) {
                    return String(obj.exact);
                } else if (obj.ideal) {
                    return String(obj.ideal);
                }
            }
        }

        return undefined;
    }

    /**
     * Tries to harvest the deviceId from the given mediaStreamTrack object.
     * Browsers populate this object differently; this method tries some different approaches
     * to read the id.
     * @param mediaStreamTrack
     * @returns deviceId if found in the mediaStreamTrack
     */
    private getDeviceIdFromMediaStreamTrack(mediaStreamTrack: MediaStreamTrack): string | undefined {
        if (mediaStreamTrack.getSettings && mediaStreamTrack.getSettings() && mediaStreamTrack.getSettings().deviceId) {
            return mediaStreamTrack.getSettings().deviceId;
        } else if (mediaStreamTrack.getConstraints && mediaStreamTrack.getConstraints() && mediaStreamTrack.getConstraints().deviceId) {
            const deviceIdObj: ConstrainDOMString = mediaStreamTrack.getConstraints().deviceId || '';
            return this.getValueFromConstrainDOMString(deviceIdObj);
        }

        return undefined;
    }

    initiateWebcam(availableDevices: MediaDeviceInfo[], deviceId?: string, userVideoTrackConstraints?: MediaTrackConstraints): Promise<{
        stream: MediaStream,
        activeDeviceIndex: number
    }> {
        return new Promise((resolve, reject) => {
            const trackConstraints = this.getMediaConstraintsForDevice(deviceId, userVideoTrackConstraints)
            navigator.mediaDevices.getUserMedia(<MediaStreamConstraints>{ video: trackConstraints, audio: true })
                .then((stream: MediaStream) => {
                    const tracks = stream.getVideoTracks();
                    // let setting: MediaTrackSettings | undefined = undefined;
                    let activeDeviceIndex: number = -1;
                    if (tracks.length) {
                        // setting = tracks[0].getSettings();
                        const activeDeviceId: string | undefined = this.getDeviceIdFromMediaStreamTrack(tracks[0]);
                        if (activeDeviceId) {
                            activeDeviceIndex = availableDevices.findIndex(x => x.deviceId === activeDeviceId)
                        }
                    }

                    resolve({
                        stream: stream,
                        activeDeviceIndex: activeDeviceIndex
                    })
                })
                .catch(err => {
                    reject(err.message || err);
                })
        });
    }

    /**
     * Turns on the torch (flashlight) of the device if available.
     * 
     * @param stream The media stream containing video tracks.
     * @returns A promise that resolves to true if the torch was successfully turned on, or false if there was an error or no video tracks were found.
     */
    turnOnTorch(stream: MediaStream): Promise<boolean> {
        return new Promise(resolve => {
            const videoTracks = stream.getVideoTracks();
            if (videoTracks.length > 0) {
                try {
                    // Apply constraints to turn on the torch.
                    videoTracks[0].applyConstraints({
                        advanced: [{ torch: true } as MediaTrackConstraints]
                    });
                    resolve(true); // Resolve promise with true indicating success.
                } catch (error: any) {
                    console.error(error.message || error); // Log any errors encountered.
                    resolve(false); // Resolve promise with false indicating failure.
                }
            } else {
                resolve(true); // Resolve promise with true if no video tracks were found.
            }
        });
    }

    /**
     * Turns off the torch (flashlight) of the device if available.
     * 
     * @param stream The media stream containing video tracks.
     * @returns A promise that resolves to true if the torch was successfully turned off, or false if there was an error or no video tracks were found.
     */
    turnOffTorch(stream: MediaStream): Promise<boolean> {
        return new Promise(resolve => {
            const videoTracks = stream.getVideoTracks();
            if (videoTracks.length > 0) {
                try {
                    // Apply constraints to turn off the torch.
                    videoTracks[0].applyConstraints({
                        advanced: [{ torch: false } as MediaTrackConstraints]
                    });
                    resolve(true); // Resolve promise with true indicating success.
                } catch (error: any) {
                    console.error(error.message || error); // Log any errors encountered.
                    resolve(false); // Resolve promise with false indicating failure.
                }
            } else {
                resolve(true); // Resolve promise with true if no video tracks were found.
            }
        });
    }


    /**
     * Get Output mimetype for the video recorder
     */
    private getOutputMimetype(): string {
        if (MediaRecorder.isTypeSupported('video/mp4')) {
            return 'video/mp4';
        } else if (MediaRecorder.isTypeSupported('video/x-matroska')) {
            return 'video/x-matroska';
        } else if (MediaRecorder.isTypeSupported('video/3gp')) {
            return 'video/3gp';
        } else if (MediaRecorder.isTypeSupported('video/quicktime')) {
            return 'video/quicktime';
        } else {
            return 'video/webm';
        }
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
    getFilename(mimeType: string): string {
        const extension = this.getFileExtensionFromMimeType(mimeType);
        return 'Recording-' + Date.now() + extension;
    }

    setupRecorder(stream: MediaStream, onData: (blob: BlobEvent) => void, onStart: () => void, onStop: () => void): MediaRecorder {
        const recorder = new MediaRecorder(stream, { mimeType: this.getOutputMimetype() });
        recorder.onstart = (_e) => { onStart(); }
        recorder.onstop = (_e) => { onStop(); }
        recorder.ondataavailable = (event: BlobEvent) => { onData(event) }

        return recorder;
    }
}