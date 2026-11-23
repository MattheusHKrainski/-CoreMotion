/** Decode a frame just after the opening timestamp, without starting playback. */
export function videoPreviewTime(duration:number):number|null {
 if(!Number.isFinite(duration)||duration<=0)return null;
 return Math.min(0.1,duration/2);
}
export function showVideoPreview(video:Pick<HTMLVideoElement,'duration'|'currentTime'|'paused'|'seeking'>):void {
 // Do not overwrite playback or a position chosen by the viewer.
 if(!video.paused||video.seeking||video.currentTime>0)return;
 const time=videoPreviewTime(video.duration);
 if(time===null)return;
 try{video.currentTime=time;}catch{/* Some browsers disallow seeking until more data is available. */}
}
