;(function($){    
    //pass in just the context as a $(obj) or a settings JS object
    $.fn.autogrow = function(opts) {
        var that = $(this).css({overflow: 'hidden', resize: 'none'}) //prevent scrollies
            , selector = that.selector
            , defaults = {
                context: $(document) //what to wire events to
                , animate: true //if you want the size change to animate
                , speed: 200 //speed of animation
                , fixMinHeight: true //if you don't want the box to shrink below its initial size
                , cloneClass: 'autogrowclone' //helper CSS class for clone if you need to add special rules
            }
        ;
        opts = $.isPlainObject(opts) ? opts : {context: opts ? opts : $(document)};
        opts = $.extend({}, defaults, opts);
        opts.fixMinHeight && that.each(function(i, elem){
            elem = $(elem);
            elem.data('autogrow-start-height', elem.height()); //set min height
        });
        opts.context
            .on('keyup paste', selector, resize)
        ;

        function resize (e){
            var box = $(this)
                , oldHeight = box.height()
                , newHeight = this.scrollHeight
                , minHeight = box.data('autogrow-start-height') || 0
                , clone
            ;
            if (oldHeight < newHeight) { //user is typing
                box.scrollTop(0); //try to reduce the top of the content hiding for a second
                opts.animate ? box.stop().animate({height: newHeight}, opts.speed) : box.height(newHeight);
            } else if (e.which == 8 || e.which == 46) { //user is deleting
                if (oldHeight > minHeight) { //shrink!
                    //this cloning part is not particularly necessary. however, it helps with animation
                    //since the only way to cleanly calculate where to shrink the box to is to incrementally
                    //reduce the height of the box until the $.height() and the scrollHeight differ.
                    //doing this on an exact clone to figure out the height first and then applying it to the
                    //actual box makes it look cleaner to the user
                    clone = box.clone()
                        .addClass(opts.cloneClass) //add clone class for extra css rules
                        .css({position: 'absolute', zIndex:-10}) //make "invisible"
                        .val(box.val()) //populate with content for consistent measuring
                    ;
                    box.after(clone); //append as close to the box as possible for best CSS matching for clone
                    do { //reduce height until they don't match
                        newHeight = clone[0].scrollHeight - 1;
                        clone.height(newHeight);
                    } while (newHeight === clone[0].scrollHeight);
                    newHeight++; //adding one back eliminates a wiggle on deletion 
                    clone.remove();
                    //if user selects all and deletes or holds down delete til beginning
                    //user could get here and shrink whole box
                    newHeight < minHeight && (newHeight = minHeight);
                    oldHeight > newHeight && opts.animate ? box.stop().animate({height: newHeight}, opts.speed) : box.height(newHeight);
                } else { //just set to the minHeight
                    box.height(minHeight);
                }
            } 
        }
    }
})(jQuery);