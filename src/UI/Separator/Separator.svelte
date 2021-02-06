<script lang="ts">
  export let text: string;
</script>

<h4 class="separator-wrapper">
  <div class="separator-wrapper__content">{text}</div>
</h4>

<style lang="scss">
  @import "../../styles/colors.scss";

  .separator-wrapper {
    background: $app-separator-background;
    color: $app-separator-forground;
    margin: 0;
    padding: 0.1rem 0 0.1rem 0.25rem;
  }
</style>
