<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import audioPlayStore from './audio-play-store';
  import audioRestartStore from './audio-restart-store';
  import type { DownloadAudio } from './download-audio.model';

  export let audio: DownloadAudio;

  let isPlaying: boolean;

  let audioPlayer: HTMLMediaElement;

  onMount(() => {
    audioPlayer = document.getElementById('audio-player') as HTMLMediaElement;
  });

  const unsubscribeAudioPlay = audioPlayStore.subscribe((shouldPlay) => {
    if (isPlaying === shouldPlay) return;

    isPlaying = shouldPlay;

    if (!audioPlayer) return;

    startOrStop(shouldPlay);
  });

  const startOrStop = (shouldPlay: boolean): void => {
    if (shouldPlay) {
      void audioPlayer.play();
    } else {
      audioPlayer.pause();
    }
  };

  const unsubscribeAudioRestart = audioRestartStore.subscribe(() => {
    console.log('ping');

    if (!audioPlayer) return;

    audioPlayer.fastSeek(0);
    startOrStop(true);
  });

  onDestroy(() => {
    unsubscribeAudioPlay();
    unsubscribeAudioRestart();

    audioPlayStore.set(false);
  });
</script>

<div class="audio-wrapper">
  <div>Hello Audio</div>

  <audio id="audio-player" src="{audio.src}" type="audio/mp3"></audio>
</div>
