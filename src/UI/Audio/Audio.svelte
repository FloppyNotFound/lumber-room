<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import audioPlayStore from './audio-play-store';
  import audioRestartStore from './audio-restart-store';
  import type { DownloadAudio } from './download-audio.model';

  export let audio: DownloadAudio;

  $: isPlaying = !isPaused && !hasEnded && currentTime > 0;

  let isPaused = false;
  let hasEnded = false;
  let currentTime = 0;
  let duration = 0;

  let audioPlayer: HTMLMediaElement;

  let updatePlaybackInfoSub: number;

  onMount(() => {
    audioPlayer = document.getElementById('audio-player') as HTMLMediaElement;

    updatePlaybackInfoSub = setInterval(() => {
      duration = audioPlayer.duration;
      currentTime = audioPlayer.currentTime;
      isPaused = audioPlayer.paused;
      hasEnded = audioPlayer.ended;

      if (hasEnded) audioPlayStore.set(false);
    }, 1000);
  });

  const unsubscribeAudioPlay = audioPlayStore.subscribe((shouldPlay) => {
    if (isPlaying === shouldPlay) return;

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
    if (!audioPlayer) return;

    audioPlayer.fastSeek(0);

    if (!isPlaying) audioPlayStore.set(true);
  });

  onDestroy(() => {
    unsubscribeAudioPlay();
    unsubscribeAudioRestart();

    audioPlayStore.set(false);

    clearInterval(updatePlaybackInfoSub);
  });
</script>

<div class="audio-wrapper">
  <div>{audio.name}</div>
  <div>
    <span>Is Playing:</span>
    <span>{isPlaying}</span>
  </div>
  <div>
    <span>Is Paused:</span>
    <span>{isPaused}</span>
  </div>
  <div>
    <span>Has Ended:</span>
    <span>{hasEnded}</span>
  </div>
  <div>
    <span>Current time:</span>
    <span>{currentTime}</span>
  </div>
  <div>
    <span>Duration:</span>
    <span>{duration}</span>
  </div>

  <audio id="audio-player" src="{audio.src}" type="audio/mp3"></audio>
</div>
