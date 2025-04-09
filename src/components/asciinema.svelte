<script>
const { cast = 'demo.cast', cols = 80, rows = 24 } = $props()
import 'asciinema-player/dist/bundle/asciinema-player.css'

async function load(node) {
    const Player = await import("asciinema-player")
    Player.create(cast, node, {
        cols,
        rows,
        terminalLineHeight: 1,
        preload: true,
        poster: 'npt:0.1',
        controls: true,
    });
}

</script>

<div class="asciinema-preview" use:load></div>
