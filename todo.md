# Loop
An animation system : this is the todo

## Features
 [ ] test if required IO are provided by IO manager before start
 [ ] Bind model data
 [-] Pluggable output contexts
 [+]  - Canvas 2D
 [-]  - Web audio
 [+] WebGL/GLSL filters
 [ ] Animated sprites
 [+] Text animations 
 [+]  - simple
 [+]  - loading
 [+] Map based on Tiled file (basic version)
 [+] Map based on Tiled file (read all properties for square/flat map)
 [+]  - character definition (position)
 [ ]  - pickups
 [ ] KeyboardIO : some buttons need autofire some not
 [ ] Switch rendering on the fly for particles ? What would be the purpose?
 [+] Center tile rendering on position (or give a way to specify the placement in the screen?)
 [+] GameScreen enhance Loop.meta.all
 [+] Particles : Image data rendering
 [+] Control time
 [+] Pluggable IO on animation system
 [+] Mouse IO manager
 [+] Mouse CLICKS!!!
 [+] Keyboard IO manager
 [+] Hierarchical animations >> Meta animations
 [+] Meta animations : 
 [+]  - a then b animation
 [+]  - all a,b,c animations at the same time 
 [+]  - some of a and b
 [+]  - unless predicate do a
 [+]  - loop a 

## Tools
 [+] Count particles 
 [+] Debug/logger to output stuff happening under the hood
 [+] Make a consolidated debug and display graph over time with jsPlot
 [ ] Enhance graphical debugger to change time resolution

## Cleanup 
 [ ] Update requestAnimationFrame polyfill
 [+] Remove datastore
 [+] Main loop as a function to be used multiple time
 [+] Refactor and generalize results/andThen
 [+] Move library source in src folder
 [+] Gruntify lib
 [+] Update samples to use gruntified concated version of the lib 

## FIX
 [ ] Particles creation time should be added by the particle system.
 [+] Particle creation should be done at the animate phase and time based on ioState
 [+] Fix circle particle position

## Investigate 
 [ ] Particle system over time (pure function, reproductibility)?
 [ ] Time control for particles
 [+] Sound output?
 [+] Animation context >> meta animations?
 [ ] Rendering engine with filled triangles
 [+] Rendering engine with filled line and curve => boring...

## Samples 
 [+] Update everything
 [+] Reorganize folders
 [~] Make exp2 starfield tangent direction
 [+] Port bezier under the sea

## Documentation
 [ ] README.md

## Slideman - game 
 [+] Collision with only one point
 [+] Change character state depending on its position / map (on the ground, hitting a wall...)
 [ ] Split into several files
 [ ] Camera
 [ ] Camera with zoom
 [+] Friction when sliding on walls
 [+] Hide under the ceiling
