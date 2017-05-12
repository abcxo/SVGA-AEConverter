$(function() {
    var $document   = $(document);
    var selector    = '[data-rangeslider]';
    var $inputRange = $(selector);

    // Example functionality to demonstrate a value feedback
    // and change the output's value.
    function valueOutput(element) {
        var value = element.value;
        var output = element.parentNode.getElementsByTagName('output')[0];

        output.innerHTML = value;

        if (value != 0){
            player.stepToPercentage((value / 200), false);
        }
    }

    // Initial value output
    for (var i = $inputRange.length - 1; i >= 0; i--) {
        valueOutput($inputRange[i]);
    };

    // Update value output
    $document.on('input', selector, function(e) {
        valueOutput(e.target);
    });

    // Initialize the elements
    $inputRange.rangeslider({
        polyfill: false
    });
});
