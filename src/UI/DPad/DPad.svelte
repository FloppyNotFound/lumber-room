<script lang="ts">
  import navToTabindex from './helpers/nav-to-tabindex';

  export let className: string;
  export let correction = 0;

  const handleKeydown = (e: Event): void => {
    const eventKey = (<KeyboardEvent>e).key;
    switch (eventKey) {
      case 'ArrowLeft':
        navToTabindex(-1, className, correction);
        break;
      case 'ArrowRight':
        navToTabindex(1, className, correction);
        break;
      default:
        break;
    }
  };

  document.activeElement?.addEventListener('keydown', handleKeydown);
</script>
