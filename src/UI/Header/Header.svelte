<header class="header">
  <h1 class="header__content" data-l10n-id="app_title">Lumber-Room</h1>
</header>

<style lang="scss">
  @import '../../styles/colors.scss';

  .header {
    background-color: $app-background;
    color: $app-foreground;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    width: 100%;
    height: 1.25rem;

    &__content {
      font-size: 17px;
      font-weight: 400;
      text-align: center;
      margin: 0 0.5rem;
    }
  }
</style>
