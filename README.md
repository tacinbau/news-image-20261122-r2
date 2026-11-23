# The World in One Day — Sunday 22 November 2026

[![rank](https://make.fun/badge/news-image-20261122/tacinbau/news-image-20261122-r2/rank.svg)](https://make.fun/bounty/news-image-20261122)
[![reward](https://make.fun/badge/news-image-20261122/tacinbau/news-image-20261122-r2/reward.svg)](https://make.fun/bounty/news-image-20261122)
[![news-image-20261122](https://make.fun/badge/news-image-20261122.svg)](https://make.fun/bounty/news-image-20261122)

A one-page newspaper that sums up the world's news of Sunday 22 November 2026:
36 stories across 7 regions, led by the COP31 climate deal, the 186-drone
night over Ukraine, and the Iran radar claim against Bahrain's denial.

## How it works

`main.ts` (Node 22, standard library only) draws the whole image from
scratch — a small built-in 5x7 bitmap font, a canvas of rectangles, discs,
triangles and lines, and a tiny PNG encoder — and writes it to
`$MAKEFUN_OUTPUT_DIR/entry.png`. It runs with no network and is fully
deterministic: two runs write byte-identical output.

Run it locally:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## License

MIT. See [LICENSE](LICENSE).
