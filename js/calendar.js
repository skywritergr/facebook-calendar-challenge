/**
 * Created by gstefanis on 25/01/15.
 *
 * Description of the algorithm:
 *
 * 1. Go through the event list, and create all the relevant DIVs in the document.
 * 2. For each event create the DIV and place it in the document to the relevant row (based on the start time).
 * 3. Add the event to the first possible available column (if no other event is occupying that space in that
 *    column. If it does then move the event to the next column. If there isn't one then create a new one).
 * 4. After adding successfully each event to the right column check if it collides with other events in the same
 *    timeslot. Register all the collisions in the eventsOverlap Object.
 * 5. After all the events are laid out successfully we do a final adjustment. In this adjustment based on the
 *    registered collisions from step 4, we change the width and horizontal position of the DIVs so they occupy
 *    all the free space without braking the rest of the layout.
 */

var layOutDay = (function(){
    'use strict';
    var columnCounter = 0;
    var columns = {'0':[]};
    var eventsOverlap = {};
    var idCounter = 0;

    function createEvent(event, id){
        var divElement = document.createElement('div');
        var h2Element = document.createElement('h2');

        h2Element.appendChild(document.createTextNode('Sample Location'));

        divElement.appendChild(document.createTextNode('Sample Item'));
        divElement.appendChild(h2Element);
        divElement.className = 'event';
        divElement.id = 'event' + id;
        divElement.style.top = (event.start) + 'px';
        divElement.style.height = (event.end - event.start) + 'px';

        document.getElementById('events').appendChild(divElement);

        //This is the function that checks and registers all the timeslot collisions the newly add element has
        // and also adds the element to the first available column.
        addToColumn(divElement);
    }


    //Here we initially check for edge cases. If the columnCounter === 0 and the element doesn't collide with
    //anything else, then add the element to the first column.
    // We don't increment the columnCounter variable unless we need to create a new column. The second edge
    // case is where we need to create a second column and finally if neither of those holds true, loop through
    // and find the first available spot in all columns.
    function addToColumn(el){
        if(columnCounter === 0 && !isCollision(columns[0], el)){
            columns[0].push(el);
            addCollision(el);
            return;
        } else if(columnCounter === 0 && isCollision(columns[0], el)){
            columns[++columnCounter] = [el];
            addCollision(el);
            return;
        }else {
            for(var i=0; i<=columnCounter; i++){
                if(!isCollision(columns[i], el)){
                    columns[i].push(el);
                    addCollision(el);
                    return;
                }
            }
        }

        columns[++columnCounter] = [el];
        addCollision(el);
    }

    //After adding the element to the correct column we check and register for collisions with other events in the
    //same timeslop as our element. We save those collisions using the addOverlap function.
    function addCollision(el){
        var events = Array.prototype.slice.call(document.getElementsByClassName('event'));
        var eventsLength = events.length;
        var elementBottom = pixelToInt(el.style.top) + pixelToInt(el.style.height);
        var elementTop = pixelToInt(el.style.top);

        for(var j=0; j < eventsLength; j++){
            var eventBottom = pixelToInt(events[j].style.top) + pixelToInt(events[j].style.height);
            var eventTop = pixelToInt(events[j].style.top);

            if ((elementTop >= eventTop && elementTop < eventBottom) ||
                (elementBottom > eventTop && elementBottom <= eventBottom) ||
                (elementTop <= eventTop && elementBottom >= eventBottom) ) {
                if(el.id !== events[j].id) {
                    addOverlap(events[j], el);
                }
            }
        }
    }

    //Add the collision to the right place of the object.
    function addOverlap(event, el){
        if(eventsOverlap[event.id] !== undefined && eventsOverlap[event.id].indexOf(el) === -1){
            eventsOverlap[event.id].push(el);
        } else if(eventsOverlap[event.id] === undefined) {
            eventsOverlap[event.id] = [el];
        }

        if(eventsOverlap[el.id] !== undefined && eventsOverlap[el.id].indexOf(event) === -1){
            eventsOverlap[el.id].push(event);
        } else if(eventsOverlap[el.id] === undefined){
            eventsOverlap[el.id] = [event];
        }
    }

    //finally after having placed the elements in the correct rows and columns, and we registered all
    //the collisions then set the maximum possible width.
    function setWidth(){
        var width = 600/(columnCounter + 1);

        for(var i=0; i<=columnCounter; i++){
            for(var j=0; j<columns[i].length; j++) {
                columns[i][j].style.width = (width - 3) + 'px';
                columns[i][j].style.marginLeft = width * i + 'px';
            }
        }
    }

    //as a final adjustment reallocate all the remaining space some elements have.
    function finalAdjustments(){
        for(var i=0; i<idCounter; i++){
            if(eventsOverlap['event'+i] === undefined){
                document.getElementById('event'+i).style.width = '597px';
            } else if(eventsOverlap['event'+i].length < columnCounter){
                var newWidth = 600/(eventsOverlap['event'+i].length + 1);
                var thisEvent = document.getElementById('event'+i);
                //thisEvent.style.width = (newWidth - 3) + 'px';
                adjust(thisEvent, eventsOverlap['event'+i], newWidth);
            }
        }
    }

    function adjust(thisEvent, eventList, width){
        var concatList = [thisEvent];
        concatList = concatList.concat(eventList);

        for(var i=0;i<eventList.length; i++){
            concatList = concatList.concat(Array.prototype.slice.apply(eventsOverlap[eventList[i].id]));
        }

        concatList = concatList.filter(function(item, pos) {
            return concatList.indexOf(item) === pos;
        });
        var sortedList = concatList.sort(sortByMargin);

        if(pixelToInt(sortedList[sortedList.length-1].style.width) +
            pixelToInt(sortedList[sortedList.length-1].style.marginLeft) + 3 < 595) {
            for (i = 0; i < sortedList.length; i++) {
                sortedList[i].style.width = (width - 3) + 'px';
                if (pixelToInt(sortedList[i].style.marginLeft) !== 0) {
                    sortedList[i].style.marginLeft = width * (i) + 'px';
                }
            }
        }
    }

    //Callback function for the .sort() method of the Array. I'm adding here because it's inefficient to
    //create functions like that in for loops.
    function sortByMargin(el1, el2){
        if(pixelToInt(el1.style.marginLeft) < pixelToInt(el2.style.marginLeft)) { return -1; }
        if(pixelToInt(el1.style.marginLeft) > pixelToInt(el2.style.marginLeft)) { return 1; }
        return 0;
    }

    //Helper function that checks if the Element el has any collision in the Column col.
    function isCollision(col, el){
        var elementBottom = pixelToInt(el.style.top) + pixelToInt(el.style.height);
        var elementTop = pixelToInt(el.style.top);

        for(var i = 0; i<col.length; i++){
            var eventBottom = pixelToInt(col[i].style.top) + pixelToInt(col[i].style.height);
            var eventTop = pixelToInt(col[i].style.top);

            if ((elementTop >= eventTop && elementTop < eventBottom) ||
                (elementBottom > eventTop && elementBottom <= eventBottom) ||
                (elementTop <= eventTop && elementBottom >= eventBottom) ) {
                return true;
            }
        }

        return false;
    }

    //Helper function that takes as an input a string of the type "100px" and returns
    //the integer equivalent. In this case 100.
    function pixelToInt(str){
        if(str === ''){ return 0;}
        return parseInt(str.replace(/px$/g,''), 10);
    }

    return function(eventObj){
        var eventsLength = eventObj.length;

        for (var i = 0; i < eventsLength; i++) {
            createEvent(eventObj[i], idCounter);
            idCounter++;
        }

        setWidth();
        finalAdjustments();
    };

})();

layOutDay([ {start: 30, end: 150}, {start: 540, end: 600}, {start: 560, end: 620}, {start: 610, end: 670} ]);