import {it} from 'node:test';
import assert from 'node:assert/strict';
import {showVideoPreview,videoPreviewTime} from '@/lib/video-preview';
it('seleciona um frame inicial inclusive para vídeos curtos',()=>{
 assert.equal(videoPreviewTime(30),0.1);
 assert.equal(videoPreviewTime(0.08),0.04);
 for(const duration of [0,-1,NaN,Infinity])assert.equal(videoPreviewTime(duration),null);
});
it('busca a prévia sem iniciar reprodução nem mudar a posição escolhida',()=>{
 const video={duration:10,currentTime:0,paused:true,seeking:false};
 showVideoPreview(video);assert.equal(video.currentTime,0.1);assert.equal(video.paused,true);
 for(const state of [{currentTime:4,paused:true,seeking:false},{currentTime:0,paused:false,seeking:false},{currentTime:0,paused:true,seeking:true}]){
  const target={duration:10,...state};showVideoPreview(target);assert.equal(target.currentTime,state.currentTime);
 }
});
it('falha de seek não impede os controles de vídeo',()=>{
 assert.doesNotThrow(()=>showVideoPreview({duration:10,paused:true,seeking:false,get currentTime(){return 0;},set currentTime(_value:number){throw new Error('Not ready');}}));
});
