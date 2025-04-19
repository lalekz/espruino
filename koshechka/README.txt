Creating Audio Files for Espruino

1. Install Audacity
3. Open it and open a sound file
3. Down the bottom-left, change Project Rate (Hz) to 22050 or whatever your target playback rate is
4. Click Tracks -> Stereo Track to Mono if the track is stereo
5. Highlight the bit of sound you want to export
6. Click File -> Export Selection
7. Choose Other Uncompressed files
8. Choose Options then RAW (header-less) and Unsigned 8 bit PCM
9. And save to the SD card

If you don't want to use an SD card, you can load small sound snippets (less than 8kB) directly into Espruino's memory using the File Converter page.
