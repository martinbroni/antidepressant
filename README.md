# anti.depress.ant — personal one-page website

## Quick start
Open `index.html` in a modern browser.

## Replace media
Put your real files into:
- `assets/video/hero.mp4` — 1920×1080 hero video
- `assets/video/thought-01.mp4` … `thought-03.mp4`
- `assets/video/moment-01.mp4`, `moment-02.mp4`
- `assets/images/hero-poster.jpg`
- `assets/images/about.jpg`
- `assets/images/story.jpg`
- `assets/images/moment-01.jpg` … `moment-04.jpg`
- `assets/audio/music.mp3`

The hero is a full-bleed background video using `object-fit: cover`; replace `assets/video/hero.mp4` with the real 1920×1080 file. The hero video also gets a subtle pointer-based object-position shift on desktop.

## Notes
- No JS/CSS libraries are used.
- Google Fonts are the only external dependency; remove the Google Fonts link if you need a fully offline build.
- Instagram is linked directly; no API or follower-count integration is used.
- The site attempts to start background music immediately on load. If the browser blocks unmuted autoplay, the first tap/click/key press starts it; the sound button always toggles it on/off.
- `prefers-reduced-motion` is supported.


### Звук в Thoughts
Видео в разделе «Мысли» воспроизводятся со своим звуком. Когда такое видео становится активным, фоновая музыка ставится на паузу. Когда пользователь прокручивает дальше и видео выходит из активной области, видео останавливается и фоновая музыка возобновляется, если она играла до запуска видео.
