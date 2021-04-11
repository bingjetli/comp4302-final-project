> I've finished 99% of the game so far, just need to polish it a little but it's pretty much ready to ship
>
> I need to make the lights toggleable and moveable but that'll take less than 30 minutes,
>
> also need to setup the controls and write it out in html, and again, that'll take like less than 30 minutes too
>
> basically, we're pretty much done, and we have a fully playable product to submit
>
> anyway, I'm gonna go sleep now, go ahead and push the documentation to the github when you're done with it, I'll wake up sometime in the afternoon and do some last minute edits and submit it
>
> it's been good working with you,
>
> cheers,
>
> - Bailey
>
>
> P.S if you want to test out the gameplay, the controls are P = unpause/pause, spacebar = jump, refresh the page if you gameover

#### feature breakdown

1. the scene is illuminated with 2 light sources, global_light and player_light
   - player_light is attached to the player and moves along with the player
   - planned to let user control player light manually with a toggle, very trivial, will implement tomorrow
   - planned to let user toggle color with the player_light too, also very trivial, will implement tomorrow
   - different textures were used for the entities
2. camera can be controlled at any time with wasd and qe, going to make it more intuitive to use tomorrow
3. textures, done.
4. ground_blocks are carrying the pipe_blocks and player_wings are attached to the player to satisfy the "hierarchical relationship" part of the assignment
5. a basic but fully implemented Entity-Component-Systems game engine along with simple 2D collision detection satisfies the "novel component" of the assignment
6. Video Competition, up to you if you want to make a video on it, might be nice to earn an extra 10%, also if you feel like you want to contribute some more to the project, I'll submit this final project with both our names if you do or don't, so it doesn't really matter
7. we didn't need three.js