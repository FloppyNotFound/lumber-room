<script lang="ts">
  import navToTabindex from "./helpers/nav-to-tabindex";

  export let className: string;
  export let correction = 0;

  const handleKeydown = (e: KeyboardEvent): void => {
    switch (e.key) {
      case "ArrowLeft":
        navToTabindex(-1, className, correction);
        break;
      case "ArrowRight":
        navToTabindex(1, className, correction);
        break;
    }
  };

  document.activeElement.addEventListener("keydown", handleKeydown);
</script>
