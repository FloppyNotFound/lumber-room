<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import audioPlayStore from './audio-play-store';
  import audioRestartStore from './audio-restart-store';
  import type { DownloadAudio } from './download-audio.model';
  import Separator from '../Separator/Separator.svelte';

  export let audio: DownloadAudio;

  let isPaused = false;
  let hasEnded = false;

  let currentTimeSeconds = 0;
  let durationSeconds = 0;

  let audioPlayer: HTMLMediaElement;

  let updatePlaybackInfoSub: number;

  $: isPlaying = !isPaused && !hasEnded && currentTimeSeconds !== 0;
  $: currentTime = toPlaybackTime(currentTimeSeconds, false);
  $: duration = toPlaybackTime(durationSeconds, true);

  onMount(() => {
    audioPlayer = document.getElementById('audio-player') as HTMLMediaElement;

    updatePlaybackInfoSub = setInterval(() => {
      currentTimeSeconds = !Number.isNaN(audioPlayer.currentTime)
        ? Math.round(audioPlayer.currentTime)
        : 0;
      durationSeconds = !Number.isNaN(audioPlayer.duration)
        ? Math.round(audioPlayer.duration)
        : 0;

      isPaused = audioPlayer.paused;
      hasEnded = audioPlayer.ended;

      if (hasEnded) {
        audioPlayStore.set(false);
        currentTimeSeconds = 0;
      }
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

  const toPlaybackTime = (
    timeInSeconds: number,
    isWithMinutesSuffix: boolean
  ): string => {
    if (Number.isNaN(timeInSeconds)) return '0';

    const minutes = Math.round(timeInSeconds / 60);
    const minutesPrefix = minutes < 10 ? '0' : '';

    const seconds = Math.round(timeInSeconds % 60);
    const secondsPrefix = seconds < 10 ? '0' : '';

    const suffix = isWithMinutesSuffix ? ' min' : '';

    return `${minutesPrefix}${minutes}:${secondsPrefix}${seconds}${suffix}`;
  };
</script>

<div id="audio-wrapper">
  <div id="audio-wrapper__separator">
    <Separator text="{audio.name}" />
  </div>
  <div id="audio-wrapper__status">
    <span>Status:</span>
    <span>
      {#if isPlaying}
        Playing
      {:else}
        Paused
      {/if}
    </span>
  </div>

  <div id="audio-wrapper__player">
    <input
      id="audio-player-ui"
      type="range"
      min="0"
      max="{durationSeconds}"
      value="{currentTimeSeconds}"
      step="1" />
    <div>
      {currentTime} / {duration}
    </div>
    <audio id="audio-player" src="{audio.src}" type="audio/mp3"></audio>
  </div>
</div>

<style lang="scss">
  #audio-wrapper {
    &__separator {
      margin: 0 -0.5rem;
    }

    &__status {
      margin-top: 1rem;
    }

    &__player {
      margin-top: 0.5rem;
      margin-right: 0.25rem;

      #audio-player-ui {
        width: 100%;
        margin-left: auto;
        margin-right: auto;
      }
    }
  }
</style>
