# Loop
An animation system : this is the todo

## Features
 [+] Particles : Image data rendering
 [+] Control time
 [ ] animation context
 [+] Pluggable IO on animation system
 [ ] test if required IO are provided by IO manager before start
 [ ] Mouse IO manager
 [ ] Keyboard IO manager
 [ ] Hierarchical animations
 [ ] Switch rendering on the fly

## Cleanup 
 [+] Remove datastore
 [+] Main loop as a function to be used multiple time

## FIX
 [ ] Particles creation time should be added by the particle system.
 [+] Particle creation should be done at the animate phase and time based on ioState

## Investigate 
 [ ] Particle system over time (pure function, reproductibility)?
 [ ] Time control for particles
 [+] Rendering engine with filled line and curve => boring...
 [ ] Rendering engine with filled triangles

## Samples 
 [-] Update everything
 [ ] Reorganize folders
 [~] Make exp2 starfield tangent direction
 [+] Port bezier under the sea
