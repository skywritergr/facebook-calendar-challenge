## This is my take on the Facebook calendar challenge. 

I wanted to do it using only Javascript and no framework at all. There are plenty of improvements to be made, but the challenge of correctly laying out the events proved harder that i thought.

## The challenge is the following:

Given a set of events, each with a start time and end time, render the events on a single day calendar (similar to Outlook, Calendar.app, and Google Calendar). There are several properties of the layout:

No events may visually overlap.
If two events collide in time, they MUST have the same width. This is an invariant. Call this width W.
W should be the maximum value possible without breaking the previous invariant.
Each event is represented by a JavaScript object with a start and end attribute. The value of these attributes is the number of minutes since 9am. So {start:30, end:90) represents an event from 9:30am to 10:30am. The events should be rendered in a container that is 620px wide (600px + 10px padding on the left/right) and 720px long (the day will end at 9pm). The styling of the events should match the attached screenshot.

You may structure your code however you like, but you must implement the following function in the global namespace. The function takes in an array of events and will lay out the events according to the above description.

function layOutDay(events) {}
