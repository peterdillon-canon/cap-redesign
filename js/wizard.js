

$(document).ready(function () {
    //Initialize tooltips
   // $('.nav-tabs > li a[title]').tooltip();
    // $('#tp').tooltip("show");
    // $( '#step1' ).tooltip({ placement: 'top', trigger: 'manual'}).tooltip('show');
    //Wizard

    // -------- Disable/Enable button logic --------
    $("input[name='series']").change(function () {
        $("#saveStep1").prop("disabled", false);
    });
    $("input[name='model']").change(function () {
        $("#saveStep2").prop("disabled", false);
    });
    $("input[name='os']").change(function () {
        $("#saveStep3").prop("disabled", false);
    });
    $("input[name='package']").change(function () {
        $("#saveStep4").prop("disabled", false);
    });

    // Feedback button
    $("input[name='helpful']").change(function () {
        $("#submitFeedback").prop("disabled", false);
    });

    $('a[data-toggle="tab"]').on('show.bs.tab', function (e) {
         var $target = $(e.target);
        if ($target.parent().hasClass('disabled')) {
            return false;
        }
    });

    $(".next-step").click(function (e) {
        var $active = $('.wizard .nav-tabs li.active');
        $active.next().removeClass('disabled');
        nextTab($active);
    });
    $(".prev-step").click(function (e) {
        var $active = $('.wizard .nav-tabs li.active');
        prevTab($active);
    });

    // --------------- Tooltip --------------------
    $('#configurator [data-toggle="tooltip"]')
        .tooltip({
            animated: 'fade',
            placement: 'left',
            html: true
        });
        // Force tooltip to stay open for debugging :)
        // .tooltip({trigger: 'manual', placement: 'left', arrow: "left"}).tooltip('show')

    
    // OS detection
    if (navigator.appVersion.indexOf("Win")!=-1) { 
        OSName="Windows";
        $("input[name='os'][value='Windows']").attr("checked", true);
        $('#os-img').attr('src', '../img/hover-printers/windows-logo.png');
        $('#osValue').text( 'Windows' );
    };
    if (navigator.appVersion.indexOf("Mac")!=-1) { 
        $("input[name='os'][value='Mac 10.8 - 10.11']").attr("checked", true);
        $("input[name='os'][value='Mac OS Ver 10.12+']").attr("checked", true);
        $('#os-img').attr('src', '../img/hover-printers/apple-logo.png');
        $('#osValue').text( 'Mac' );
    };


    $('#saveStep1').on('click', function() {
        var seriesValue = $("input[name='series']:checked").val();
        $('#seriesValue').text( seriesValue );
    });
    $('#saveStep2').on('click', function() {
        var modelValue = $("input[name='model']:checked").val();
        $('#modelValue').text( modelValue );
    });
    $('#saveStep3').on('click', function() {
        var osValue = $("input[name='os']:checked").val();
        $('#osValue').text( osValue );
    });
    $('#saveStep4').on('click', function() {
        var packageValue = $("input[name='package']:checked").val();
        $('#packageValue').text( packageValue );
        
        var a = $("input[name='series']:checked").val();
        var aa = $("input[name='series']:checked").attr('id'); // ID's to set image filename
        var b = $("input[name='model']:checked").val();
        var bb = $("input[name='model']:checked").attr('id');
        var c = $("input[name='os']:checked").val();
        var cc = $("input[name='os']:checked").attr('id');
        var d = $("input[name='package']:checked").val();
        setCookie(a,aa,b,bb,c,cc,d);
    });
});

// ----------------------------------------------
function setCookie(a, aa, b, bb, c, cc, d) {
    Cookies.set('configurator-data', {
        series: a,
        seriesImgId: aa,
        model: b,
        modelImgId: bb,
        os: c,
        osImgId: cc,
        package: d
    });
}

// ----------------------------------------------
function getCookie() {
    var data = Cookies.getJSON('configurator-data');
    if (data) {
        console.log('Loading cookie data...');
        $("input[name='series'][value='" + data.series + "']").attr("checked", true);
        $('#series-img').attr('src', '../img/hover-printers/' + data.seriesImgId + '.png');
        $("input[name='model'][value='" + data.model + "']").attr("checked", true);
        $('#model-img').attr('src', '../img/hover-printers/' + data.modelImgId + '.png');
        $("input[name='os'][value='" + data.os + "']").attr("checked", true);
        $('#os-img').attr('src', '../img/hover-printers/' + data.osImgId + '.png');
        $("input[name='package'][value='" + data.package + "']").attr("checked", true);
        $('#seriesValue').text( data.series );
        $('#modelValue').text( data.model );
        $('#osValue').text( data.os );
        $('#packageValue').text( data.package );
        $(".next-step").attr('disabled', false);
        console.log('Data loaded');
    } else {
        console.log('No cookie data found.');
    }    
}

// ----------------------------------------------
$(document).ready(function () {
   
    getCookie();

    
    $(".show-access-overlay").on('click', function() {
        $('.overlay-bg, #access-content').fadeIn();
    });
    $(".closer, #saveAccess ").on('click', function() {
        $('.overlay-bg, .content').fadeOut();
    });
    // ---------------------------------------------
    $("#lovEmployerOpen").on('click', function() {
        $('.overlay-bg, #lovEmployerContent').fadeIn();
        $('#lovEmployerContent').css({ 'width': '800'});
    });
    $(".closer, #cancelLovEmployer").on('click', function() {
        $('.overlay-bg, .content').fadeOut();
    });
    // ---------------------------------------------
    $("#lovAddressOpen").on('click', function() {
        $('.overlay-bg, #lovAddressContent').fadeIn();
        $('#lovAddressContent').css({ 'width': '90%'});
    });
    $(".closer, #saveLovAddress ").on('click', function() {
        $('.overlay-bg, .content').fadeOut();
    });
    // ---------------------------------------------




    $("#show-rate-wizard-overlay").on('click', function() {
        $('.overlay-bg, #rate-content').fadeIn();
    });

    // Animated button script
    $(".submit").click(function() {
        event.preventDefault();
        $("#submitFeedback, input[name='helpful'], #rate-message").prop("disabled", true);
        $(".submit").addClass("loading");
        setTimeout(function() {
          $(".submit").addClass("hide-loading");
          $(".done").addClass("finish");
        }, 2500);
        setTimeout(function() {
          $(".submit").removeClass("loading");
          $(".submit").removeClass("hide-loading");
          $(".done").removeClass("finish");
          $(".failed").removeClass("finish");
        }, 3500);
      });

      $(document).keydown(function(e) {
        if (e.keyCode == 27) {
            $('.overlay-bg, .content').fadeOut();
        }
    });

});

// ----------------------------------------------
function setImage(id, name) {
    $('#' + id).attr('src', '../img/hover-printers/' + name + '.png');
}

// ---------------------------------------------
function nextTab(elem) {
    $('#loader, .ct').show();
    // fake timeout
    setTimeout(function() {
        $(elem).next().find('a[data-toggle="tab"]').click();
        $('#productCarousel .right.carousel-control').trigger('click');
        $('#loader, .ct').hide();
      }, 1000);
}
function prevTab(elem) {
    $('#loader, .ct').show();
    // fake timeout
    setTimeout(function() {
        $(elem).prev().find('a[data-toggle="tab"]').click();
        $('#productCarousel .left.carousel-control').trigger('click');
        $('#loader, .ct').hide();
      }, 1000);
}



