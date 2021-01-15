<script lang="ts">
  export let text: string;
</script>

<h4>{text}</h4>

<style lang="scss">
  @import "../../styles/colors.scss";

  h4 {
    background: $app-separator-background;
    color: $app-separator-forground;
    margin: 0;
    padding: 0.1rem 0 0.1rem 0.25rem;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
