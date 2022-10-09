
// var body_system_count = 0;
var in_danger_count = 0;

function temperature_show() {
    var fever = $("input[name='fever']:checked").val();
    if(fever == 'yes')
    {
        document.getElementById('temperature').disabled = false;
    }
    else
    {
        document.getElementById('temperature').disabled = true;
        document.getElementById('temperature').value = 36;
    }
}

function body_system_show(object) {
    
    var object_id = object.id;

    if(object_id == 'body_system_yse')
    {
        // document.getElementById('body_system_yse').checked = true;
        document.getElementById('fever_yse').checked = true;
        if (document.getElementById('temperature').disabled == true) {
            document.getElementById('temperature').disabled = false;
        }
    }

    // if(object_id == 'body_system_no')
    // {
    //     $("input[name='body_system_option']:checked").each(function(i){
    //         document.getElementById($(this).attr('id')).checked = false;
    //     });
    //     body_system_count = 0;
    // }
    // else
    // {
    //     var checkbox = $("input[id='"+object_id+"']:checked").val();
    //     if(checkbox != null)
    //         body_system_count ++;
    //     else
    //         body_system_count --;
        
    //     if(body_system_count > 0)
    //     {
    //         document.getElementById('body_system_yse').checked = true;
    //         document.getElementById('fever_yse').checked = true;

    //         if (document.getElementById('temperature').disabled == true) {
    //             document.getElementById('temperature').disabled = false;
    //         }
    //     }
    //     else
    //         document.getElementById('body_system_no').checked = true;
    // }
}

function in_danger_show(object) {
    var object_id = object.id;
    if(object_id == 'in_danger_no')
    {
        $("input[name='disease']:checked").each(function(i){
            document.getElementById($(this).attr('id')).checked = false;
        });
        in_danger_count = 0
    }
    else
    {
        var checkbox = $("input[id='"+object_id+"']:checked").val();
        if(checkbox != null)
            in_danger_count ++;
        else
            in_danger_count --;
        
        if(in_danger_count > 0)
            document.getElementById('in_danger_yse').checked = true;
        else
            document.getElementById('in_danger_no').checked = true;
    }
}

function lung_image_show() {
    document.getElementById('x_ray_file_show').style.display = 'block';
    // document.getElementById('ct_scan_file_show').style.display = 'block';
    document.getElementById('lung_infiltrate_show').style.display = 'block';
}

function check_inputs() {

    var error = 'empty';
    // var has_error = false;
    
    // var val = [];
    // $("input[name='disease']:checked").each(function(i){
    //     val[i] = $(this).val();
    //     alert(val[i]);
    // });
    // alert(val.length);

    // Page-1
    var patient_name = document.getElementById('patient_name').value;
    var patient_lastname = document.getElementById('patient_lastname').value;
    var patient_age = document.getElementById('patient_age').value;
    var patient_gender = $("input[name='patient_gender']:checked").val();
    var patient_address = document.getElementById('patient_address').value;
    var patient_phone = document.getElementById('patient_phone').value;

    if (patient_name == null || patient_name == '')
        patient_name = 'empty';
    if (patient_lastname == null || patient_lastname == '')
        patient_lastname = 'empty';
    if (patient_age == null || patient_age == '')
        patient_age = 'empty';
    if (patient_gender == null || patient_gender == '')
        patient_gender = 'empty';
    if (patient_address == null || patient_address == '')
        patient_address = 'empty';
    if (patient_phone == null || patient_phone == '')
        patient_phone = 'empty';

    // Page-2
    var group = '';
    $("input[name='group']:checked").each(function(i){
        group += $(this).val() + ',';
    });
    var rr = document.getElementById('rr').value;
    var spo2 = document.getElementById('spo2').value;
    var fever = $("input[name='fever']:checked").val();

    if (group.length == 0)
        group = 'empty';
    else
        group = group.substring(0, group.length - 1);
    if (rr == null || rr == '')
        rr = 30;
    if (spo2 == null || rr == '')
        spo2 = 94;
    if (fever == null)
        fever = 'empty';

    // Page-3
    var body_system = $("input[name='body_system']:checked").val();
    var in_danger = $("input[name='in_danger']:checked").val();
    var medicine = '';
    $("input[name='medicine']:checked").each(function(i){
        medicine += $(this).val() + ',';
    });
    var illness = '';
    $("input[name='illness']:checked").each(function(i){
        illness += $(this).val() + ',';
    });
    
    if (body_system == null)
        body_system = 'empty';
    if (in_danger == null)
        in_danger = 'empty';
    if (medicine.length == 0)
        medicine = 'empty';
    else
        medicine = medicine.substring(0, medicine.length - 1);
    if (illness.length == 0)
        illness = 'empty';
    else
        illness = illness.substring(0, illness.length - 1);
    
    // Page-4
    var cpr = $("input[name='cpr']:checked").val();
    var lymphocytopenia = document.getElementById('lymphocytopenia').value;

    if (cpr == null)
        cpr = 'empty';
    if (lymphocytopenia == null || lymphocytopenia == '')
        lymphocytopenia = 'empty';
    
    // Page-5
    var lung_image = $("input[name='lung_image']:checked").val();
    var x_ray_image = $('#x_ray_file')[0].files[0];
    var lung_infiltrate = $("input[name='lung_infiltrate']:checked").val();

    if (lung_image == null)
        lung_image = 'empty';
    if (x_ray_image == null)
        x_ray_image = 'empty';
    else
        x_ray_image = 'file';
    if (lung_infiltrate == null)
        lung_infiltrate = 'empty';
    
    
    if (rr == 'empty' || spo2 == 'empty') {
        error = 'لطفا مقادیر صفحه 2 را پر نمایید.';
    }

    var form_data = {
        'error': error,
        'patient_name': patient_name,
        'patient_lastname': patient_lastname,
        'patient_age': patient_age,
        'patient_gender': patient_gender,
        'patient_address': patient_address,
        'patient_phone': patient_phone,
        'group': group,
        'rr': rr,
        'spo2': spo2,
        'fever': fever,
        'body_system': body_system,
        'in_danger': in_danger,
        'medicine': medicine,
        'illness': illness,
        'cpr': cpr,
        'lymphocytopenia': lymphocytopenia,
        'lung_image': lung_image,
        'x_ray_image': x_ray_image,
        'lung_infiltrate': lung_infiltrate
    }

    console.log(form_data)

    return form_data;
}