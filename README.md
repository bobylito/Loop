Loop
====

Loop is a JS animation framework using Canvas 2D. It has a strong focus on low level API access 
and boilerplate factorisation.

Philosophy
----------

 * Loop is an animation loop
 * Loop accepts IO that will be passed to animation
 * Loop accepts animations that will be then displayed
 * An animation is basically an object with 2 functions : render for rendering, animate for mutating state
 * Animations can be composed together to create new animations
 * Animations can be enhanced (as long as the contract is respected)

