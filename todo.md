# Loop
An animation system : this is the todo

## Features
 [ ] test if required IO are provided by IO manager before start
 [ ] Bind model data
 [-] Text animations 
 [ ]  - complex
 [+]  - simple
 [+]  - loading
 [+] Map based on Tiled file (basic version)
 [ ] Map based on Tiled file (read all properties for square/flat map)
 [ ] Switch rendering on the fly for particles ? 
 [+] Particles : Image data rendering
 [+] Control time
 [+] Pluggable IO on animation system
 [+] Mouse IO manager
 [+] Keyboard IO manager
 [+] Hierarchical animations >> Meta animations
 [+] Meta animations : 
 [+]  - a then b animation
 [+]  - all a,b,c animations at the same time 

## Cleanup 
 [+] Remove datastore
 [+] Main loop as a function to be used multiple time
 [ ] Refactor and generalize results/andThen

## FIX
 [ ] Particles creation time should be added by the particle system.
 [+] Particle creation should be done at the animate phase and time based on ioState
 [+] Fix circle particle position

## Investigate 
 [ ] Particle system over time (pure function, reproductibility)?
 [ ] Time control for particles
 [ ] animation context >> meta animations?
 [ ] Rendering engine with filled triangles
 [+] Rendering engine with filled line and curve => boring...

## Samples 
 [+] Update everything
 [+] Reorganize folders
 [~] Make exp2 starfield tangent direction
 [+] Port bezier under the sea
