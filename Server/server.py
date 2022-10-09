
from covid_19_library import covid_19_algo, covid_19_nn, dcm_convertor

from flask import (
    Flask,
    request,
    render_template,
    send_from_directory,
    url_for,
    jsonify
)
# from flask_uploads import UploadSet, configure_uploads, IMAGES
from flask_cors import CORS, cross_origin
from werkzeug.utils import secure_filename
import os

import sys
import webbrowser
from tkinter import *

basedir = os.path.abspath(os.path.dirname(__file__))

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

from logging import Formatter, FileHandler
handler = FileHandler(os.path.join(basedir, 'log.txt'), encoding='utf8')
handler.setFormatter(
    Formatter("[%(asctime)s] %(levelname)-8s %(message)s", "%Y-%m-%d %H:%M:%S")
)
app.logger.addHandler(handler)


# app.config['ALLOWED_EXTENSIONS'] = set(['txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif'])
app.config['ALLOWED_EXTENSIONS'] = set(['png', 'jpg', 'jpeg', 'dcm'])


def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1] in app.config['ALLOWED_EXTENSIONS']


# @app.context_processor
# def override_url_for():
#     return dict(url_for=dated_url_for)


# def dated_url_for(endpoint, **values):
#     if endpoint == 'js_static':
#         filename = values.get('filename', None)
#         if filename:
#             file_path = os.path.join(app.root_path,
#                                      'static/js', filename)
#             values['q'] = int(os.stat(file_path).st_mtime)
#     elif endpoint == 'css_static':
#         filename = values.get('filename', None)
#         if filename:
#             file_path = os.path.join(app.root_path,
#                                      'static/css', filename)
#             values['q'] = int(os.stat(file_path).st_mtime)
#     return url_for(endpoint, **values)


# @app.route('/css/<path:filename>')
# def css_static(filename):
#     return send_from_directory(app.root_path + '/static/css/', filename)


# @app.route('/js/<path:filename>')
# def js_static(filename):
#     return send_from_directory(app.root_path + '/static/js/', filename)


# @app.route('/')
# def index():
#     return render_template('index.html')


@app.route('/covid_19_x_ray_file', methods=['POST'])
@cross_origin()
def covid_19_x_ray_file():
    if request.method == 'POST':
        files = request.files['x_ray_file']
        if files and allowed_file(files.filename):
            filename = secure_filename(files.filename)
            app.logger.info('FileName: ' + filename)
            updir = os.path.join(basedir, 'covid_19_library/image_upload/')
            files.save(os.path.join(updir, filename))

            # new_file_name = filename
            # if filename.split('.')[-1] == 'dcm':
            #     new_file_name = dcm_convertor.dcm_to_png('covid_19_library/image_upload/'+new_file_name)

            # image_processing = dcm_convertor.image_processing('covid_19_library/image_upload/'+new_file_name)
            # lung_cropper = dcm_convertor.lung_cropper('covid_19_library/image_upload/'+new_file_name)

            # file_size = os.path.getsize(os.path.join(updir, filename))
            predicted = covid_19_nn.predict_covid_19_x_ray('covid_19_library/image_upload/'+filename)
            # predicted = covid_19_nn.predict_covid_19_x_ray_new(image_processing, lung_cropper)
            # return jsonify(name=filename, size=file_size)
            os.remove('covid_19_library/image_upload/' + filename)
            return jsonify(predict=str(predicted))
            # return jsonify(predict=str(predicted), orgimg=new_file_name, pricimg=image_processing, cropimg=lung_cropper)


@app.route('/covid_19_ct_scan_file', methods=['POST'])
@cross_origin()
def covid_19_ct_scan_file():
    if request.method == 'POST':
        files = request.files['ct_scan_file']
        if files and allowed_file(files.filename):
            filename = secure_filename(files.filename)
            app.logger.info('FileName: ' + filename)
            updir = os.path.join(basedir, 'covid_19_library/image_upload/')
            files.save(os.path.join(updir, filename))
            file_size = os.path.getsize(os.path.join(updir, filename))
            predicted = covid_19_nn.predict_covid_19_ct_scan('covid_19_library/image_upload/'+filename)
            # return jsonify(name=filename, size=file_size)
            os.remove('covid_19_library/image_upload/' + filename)
            return jsonify(predict=str(predicted))


@app.route('/covid_19_floawchart', methods=['GET'])
@cross_origin()
def covid_19_floawchart():
    if request.method == 'GET':
        group_req = request.args['group']
        rr_req = request.args['rr']
        spo2_req = request.args['spo2']
        fever_req = request.args['fever']
        body_system_req = request.args['body_system']
        in_danger_req = request.args['in_danger']
        medicine_req = request.args['medicine']
        illness_req = request.args['illness']
        lung_image_req = request.args['lung_image']
        lung_infiltrate_req = request.args['lung_infiltrate']

        color, drug, ct = covid_19_algo.calculate_covid_19_flowchart(group_req, rr_req, spo2_req, fever_req, body_system_req, in_danger_req, medicine_req, illness_req, lung_image_req, lung_infiltrate_req)

        return jsonify(color=color, drug=drug, ct=ct)


if __name__ == '__main__':

    os_dash = '/'
    if sys.platform == 'win32':
        os_dash = '\\'
    curent_dir = os.path.dirname(os.path.realpath(__file__))
    splited_dir = curent_dir.split(os_dash)
    client_dir = ''
    for i in range(0, len(splited_dir)-1):
        client_dir += splited_dir[i]+'/'

    client_dir += 'Client/index.html'
    client_dir = 'file:///'+ client_dir
    # print(client_dir)
    webbrowser.open(client_dir)

    app.run(host='localhost', port=8000, debug=True)
