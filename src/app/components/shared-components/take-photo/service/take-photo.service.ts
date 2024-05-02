import { Injectable } from "@angular/core";

@Injectable({ providedIn: 'root' })
export class TakePhotoService {

    private static DEFAULT_VIDEO_OPTIONS: MediaTrackConstraints = { facingMode: 'environment' };
    private static DEFAULT_IMAGE_TYPE: string = 'image/jpeg';
    private static DEFAULT_IMAGE_QUALITY: number = 0.92;

    /**
     * Lists available videoInput devices
     * @returns a list of media device info.
     */
    getAvailableDevices(): Promise<MediaDeviceInfo[]> {
        if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
            return Promise.reject("Couldn't find camera information");
        }

        return new Promise((resolve, reject) => {
            navigator.mediaDevices.enumerateDevices()
                .then((devices: MediaDeviceInfo[]) => {
                    resolve(devices.filter(x => x.kind === 'videoinput'));
                })
                .catch(err => {
                    reject(err.message || err);
                })
        })
    }

    /**
     * Stops all active media tracks.
     * This prevents the webcam from being indicated as active,
     * even if it is no longer used by this component.
     */
    stopMediaTracks(stream: MediaStream, video: HTMLVideoElement) {
        video.pause();
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
        const result: MediaTrackConstraints = baseMediaTrackConstraints ? baseMediaTrackConstraints : TakePhotoService.DEFAULT_VIDEO_OPTIONS;
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
            navigator.mediaDevices.getUserMedia(<MediaStreamConstraints>{ video: trackConstraints })
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

    takeSnapShot(canvas: HTMLCanvasElement, videoElement: HTMLVideoElement): Promise<File> {
        return new Promise((resolve, reject) => {
            canvas.width = videoElement.videoWidth;
            canvas.height = videoElement.videoHeight;

            // paint snapshot image to canvas
            const context2d = canvas.getContext('2d');
            if (context2d) {
                context2d.drawImage(videoElement, 0, 0);
                canvas.toBlob((blob) => {
                    if (blob) {
                        resolve(new File([blob], Date.now() + '.jpg', { type: TakePhotoService.DEFAULT_IMAGE_TYPE }))
                    } else { reject('Unable to capture snapshot.'); }
                }, TakePhotoService.DEFAULT_IMAGE_TYPE, TakePhotoService.DEFAULT_IMAGE_QUALITY)
            } else {
                reject('Unable to capture snapshot.')
            }
        })

    }
}