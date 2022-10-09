
function covid19_submit() {

    document.getElementById('block_page_loader').style.display = 'block';
    document.getElementById('tree_page_loader').style.display = 'block';
    
    event.preventDefault();        
    
    webservice_url = 'http://localhost:8000/';
    
    var form_data = check_inputs();
    
    if (form_data['error'] != 'empty') {
        alert(form_data['error']);
    }
    else {
        color = '';
        drug = '';
        ct_nedded = '';
        predict = 0;
        
        $.ajax({
            async: false,
            type: "GET",
            url: webservice_url+'covid_19_floawchart',
            data: form_data,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (response) {
                // alert('success');
                color = response['color'];
                drug = response['drug'];
                ct_nedded = response['ct'];
                console.log(response);
            },
            error: function (response) {
                // alert('error');
                console.log(response.responseText);
            },
            failure: function (response) {
                // alert('failure');
                console.log(response.responseText);
            }
        });
            
        var x_ray_image = $('#x_ray_file')[0].files[0];
            
        if (x_ray_image != null) {
                var iamge_data = new FormData($('#uploadform')[0]);
                $.ajax({
                    async: false,
                    type: 'POST',
                    url: webservice_url+'covid_19_x_ray_file',
                    data: iamge_data,
                    contentType: false,
                    processData: false,
                    dataType: 'json'
                }).done(function(data, textStatus, jqXHR){
                    predict = data['predict']
                    console.log(data);
                    // console.log(data['name']);
                    // console.log(textStatus);
                    // console.log(jqXHR);
                    // console.log('Success!');
                    // $("#resultFilename").text(data['name']);
                    // $("#resultFilesize").text(data['size']);
                }).fail(function(data){
                    alert('error!');
                });
        }
            
        // var ct_image = $('#ct_scan_file')[0].files[0];
            
        // if (ct_image != null) {
        //     var iamge_data = new FormData($('#uploadform')[0]);
        //     $.ajax({
        //         async: false,
        //         type: 'POST',
        //         url: webservice_url+'covid_19_ct_scan_file',
        //         data: iamge_data,
        //         contentType: false,
        //         processData: false,
        //         dataType: 'json'
        //     }).done(function(data, textStatus, jqXHR){
        //         predict = data['predict']
        //         console.log(data);
        //         // console.log(data['name']);
        //         // console.log(textStatus);
        //         // console.log(jqXHR);
        //         // console.log('Success!');
        //         // $("#resultFilename").text(data['name']);
        //         // $("#resultFilesize").text(data['size']);
        //     }).fail(function(data){
        //         alert('error!');
        //     });
        // }
            
        var html_data = '';
            
        if (color == 'error' || color == '') {
            html_data += '<div class="col-md-9"><div class="c-content-panel"><div class="c-label">توضیحات</div><div class="c-body">';
            html_data += '<blockquote class="c-border-black"><p>';
            if(color == '')
                html_data += 'مشکل در عملکرد سیستم.<br>';
            else
                html_data += 'اطلاعات به درستی وارد نشده است.<br>';
            html_data += '</p></blockquote>';
            html_data += '</div></div></div>';
        }
        else
        {
            if (x_ray_image != null) {
                if (parseInt(predict) >= 50 && color != 'green') {
                    color = 'red';
                }
                
                html_data += '<div class="col-md-3">' +
                            '<div class="c-content-counter-1"><div class="row"><div class="col-md-12">';
                if (parseInt(predict) >= 50) {html_data += '<div class="c-counter c-bg-red c-bg-red-font" data-counter="counterup">'+predict+' %</div>';}
                            
                else {html_data += '<div class="c-counter c-bg-green c-bg-green-font" data-counter="counterup">'+predict+' %</div>';}
                
                html_data += '<h4 class="c-title c-first c-font-black c-font-uppercase c-font-bold">احتمال ابتلا به کرونا</h4>' +
                            '</div></div></div>' +
                            '</div>';
                
                // html_data += '<div class="col-md-3"><div class="c-progress-bar-container">' +
                //     '<div class="c-progress-bar-line c-border-red c-font-dark" data-progress-bar="circle" data-stroke-width="6" data-duration="1500" data-trail-width="5" data-progress="' + predict + '" data-display-value="true" data-animation="bounce"></div>' +
                //     '</div><div class="c-progress-bar-desc-container"><p class="c-progress-bar-desc c-center"><span class="c-font-red">' + predict + '</span> درصد احتمال ابتلا به کرونا</p></div></div>';
            }
            if (x_ray_image != null)
                html_data += '<div class="col-md-9"><div class="c-content-panel"><div class="c-label">توضیحات</div><div class="c-body">';
            else
                html_data += '<div class="col-md-12"><div class="c-content-panel"><div class="c-label">توضیحات</div><div class="c-body">';
            if (color == 'red') {
                html_data += '<blockquote class="c-border-red">' +
                            '<div class="c-content-ver-nav">' +
                            '<h2 class="c-title c-first c-font-red c-font-uppercase c-font-bold c-font-center">نیازمند ارجاع به بیمارستان</h2>' +
                            '<ul class="c-menu c-arrow-dot">';

                if(ct_nedded == 'yes')
                    html_data += '<li><span c-font-red>انجام CT-Scan (حتما)</span></li>';
                
                html_data += '<li>تکمیل ارزیابی های  بالینی، پاراکلینیکی و آزمایشگاهی (PCR,CT/CXR,CBC,CRP)</li>' +
                            '<li>بیمارانی که علاوه بر بیماری تنفسی حاد دارای یک/چند مورد از علائم زیر باشند، با نظر پزشک معالج، اندیکاسیون بستری دارند<ul>' +
                            '<li>RR > 30</li>' +
                            '<li>po2 < 93%</li>' +
                            '<li>انفیلتراسیون ریوی در گرافی قفسه صدری که مطرح کننده کووید 19 باشد</li>' +
                            '<li>قضاوت بالینی پزشک متخصص</li>' +
                            '</ul></li>' +

                            '<li>شروع رژیم ضد ویروسی در صورت مثبت بودن نتایج تست ملکولی و عکس رادیولوژیک</li>' +
                            '<li>رژیم ضد ویروسی شامل:<ul>' +
                            '<li>هیدروکسی کلروکین 2 قرص باهم در روز اول و به صورت تک دوز</li>' +
                            '<li>لوپیناویر+ریتوناویر (کلترا) هر 12 ساعت 2 عدد حداقل 7 و حداکثر 14 روز</li>' +
                            '</ul></li>' +

                            '</ul></div><br>';
                
                if(drug == 'yes')
                {
                    html_data += '<div class="c-content-panel"><div class="c-body">' +
                                '<h4 class="c-title c-first c-font-red c-font-uppercase c-font-bold c-font-center">هشدارها و تداخلات داروی هیدروکسی کلروکین</h4>' +
                                '<span class="c-font-bold">موارد منع مصرف: </span>بیماران فاویسم، صرع، حساسیت به دارو<br><br>' +
                                '<span class="c-font-bold">تداخلات داروئی هیدروکسی کلروکین: </span>افزایش خطر آریتمی در همزمانی تجویز با فلوروکینولون ها بخصوص لوفلوکساسین، متادون، اندانسترون، متوکلوپرامید، کوئتیاپین، دیگوگسین، آمیودارون، کلاریترومایسین، آزیترومایسین، هیدروکلروتیازید، هپارین<br>' +
                                '</div></div>';
                }
                
                // html_data += '<div class="c-content-panel"><div class="c-body">' +
                //             '<h2 class="c-title c-first c-font-red c-font-uppercase c-font-bold c-font-center">بستری در بخش مراقبت های ویژه</h2>' +
                //             '<ul class="c-menu c-arrow-dot">' +
                //             '<li>شرایط ورود مریض به بخش مراقبت های ویژه:<ul>' +
                //             '<li>تشخیص قطعی کرونا ( مثبت یا CT با الگوی GGO)</li>' +
                //             '<li>دیسترس تنفسی با RR > 30</li>' +
                //             '<li>P/F ratio < 200</li></li>' +
                //             '<li>اختلال همودینامیک با MAP < 60 mmhg</li>' +
                //             '<li>اختلال نورولوژیک و کاهش سطح هوشیاری</li>' +
                //             '</ul></li>' +
                //             '</ul>' +
                //             '<span>تذکر: تمامی موارد بالا برای بستری بیمار در بخش مراقبت های ویژه باید وجود داشته باشند.</span>' +
                //             '</div></div>';
                
                html_data += '</blockquote>';
            }
            if (color == 'brown') {
                // alert(ct_nedded);
                html_data += '<blockquote class="c-border-brown">' +
                            '<div class="c-content-ver-nav">' +
                            '<h2 class="c-title c-first c-font-brown c-font-uppercase c-font-bold c-font-center">افراد پرخطر با اندیکاسیون درمان سرپایی</h2>' +
                            '<ul class="c-menu c-arrow-dot">';
                            
                if(ct_nedded == 'yes')
                    html_data += '<li><span c-font-red>انجام CT-Scan (حتما)</span></li>';
                            
                html_data += '<li>استراحت و جداسازی در منزل تا 14 روز پس از بهبود علایم</li>' +
                            '<li>درمان های تسکینی و حمایتی</li>' +
                            '<li>هیدروکسی کلروکین (tab 200mg)   روز اول هر 12 ساعت 2 عدد و در ادامه هر 12 ساعت 1 عدد به مدت حداقل 5 روز(تا 10 روز قابل تمدید می باشد)</li>' +
                            '<li>آنتی بیوتیک در صورت صلاح دید پزشک معالج</li>' +
                            
                            // '<li>اقدامات تکمیلی مورد نیاز:<ul>' +
                            // '<li>اگر بیمار تب داشته و جزو گروه های پر خطر است و یا نقص ایمنی با یا بدون تب، نمونه گیری انجام شود و در صورت مثبت شدن و تشدید علایم به بیمارستان و در غیر اینصورت به نقاهتگاه  ارجاع داده شود</li>' +
                            // '<li>اگر فردی تب داشته و علامتدار است(لرز، سرفه خشک، گلودرد) در صورتی که جزو گروه پر خطر الف است بهتر است CT  شود و در صورتی که جزو گروه ب است CXR کافی است</li>' +
                            // '<li>بیماران با نقص ایمنی حتما باید CT شوند و برای ارزیابی های بیش تر به بیمارستان ارجاع داده شوند</li>' +
                            // '</ul></li>' +
                            
                            '<li>به بیمار آموزش داده شود که درصورت بروز علایم زیر مجددا مراجعه نماید:<ul>' +
                            '<li>تنگی نفس/ تنفس دشوار</li>' +
                            '<li>تشدید سرفه ها یا بروز سرفه های خلط دار</li>' +
                            '<li>عدم قطع تب پس از 5 روز از شروع بیماری</li>' +
                            '<li>کاهش سطح هوشیاری</li>' +
                            '</ul></li></ul></div><br>';

                if(drug == 'yes')
                {
                    html_data += '<div class="c-content-panel"><div class="c-body">' +
                                '<h4 class="c-title c-first c-font-red c-font-uppercase c-font-bold c-font-center">هشدارها و تداخلات داروی هیدروکسی کلروکین</h4>' +
                                '<span class="c-font-bold">موارد منع مصرف: </span>بیماران فاویسم، صرع، حساسیت به دارو<br><br>' +
                                '<span class="c-font-bold">تداخلات داروئی هیدروکسی کلروکین: </span>افزایش خطر آریتمی در همزمانی تجویز با فلوروکینولون ها بخصوص لوفلوکساسین، متادون، اندانسترون، متوکلوپرامید، کوئتیاپین، دیگوگسین، آمیودارون، کلاریترومایسین، آزیترومایسین، هیدروکلروتیازید، هپارین<br>' +
                                '</div></div>';
                }
                
                html_data += '</blockquote>';
            }
            if (color == 'green') {
                html_data += '<blockquote class="c-border-green">' +
                            '<div class="c-content-ver-nav">' +
                            '<h2 class="c-title c-first c-font-green c-font-uppercase c-font-bold c-font-center">افرادی که اندیکاسیون بستری و درمان سرپایی ندارد</h2>' +
                            '<ul class="c-menu c-arrow-dot">';
                
                if(ct_nedded == 'yes')
                    html_data += '<li><span c-font-red>انجام CT-Scan (حتما)</span></li>';
                            
                html_data += '<li>استراحت و جداسازی در منزل تا 14 روز پس از بهبود علایم</li>' +
                            '<li>تغذیه مناسب و مصرف مایعات کافی</li>' +
                            '<li>درمان های حمایتی</li>' +
                            '<li>آنتی بیوتیک در صورت صلاح دید پزشک معالج</li>' +
                            '<li>به بیمار آموزش داده شود که درصورت بروز علایم زیر مجددا مراجعه نماید:<ul>' +
                            '<li>تنگی نفس/ تنفس دشوار</li>' +
                            '<li>تشدید سرفه ها یا بروز سرفه های خلط دار</li>' +
                            '<li>عدم قطع تب پس از 5 روز از شروع بیماری</li>' +
                            '<li>کاهش سطح هوشیاری</li>' +
                            '</ul></li>' +
                            '<li>CBC و CRP برای بیمارانی که نیاز به بستری ندارند توصیه نمی شود.</li>' +
                            '</ul></div></blockquote>';
            }
            html_data += '</div></div></div>';
        }
            
        document.getElementById('result_panel').style.display = 'block';
        document.getElementById('result_help').style.display = 'none';
        document.getElementById("result_dive").innerHTML = html_data;
    }
        
    document.getElementById('block_page_loader').style.display = 'none';
    document.getElementById('tree_page_loader').style.display = 'none';
    }
