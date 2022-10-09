
# import gc
import cv2
import numpy as np
import tensorflow as tf
from tensorflow.keras.applications import MobileNet, VGG16
from tensorflow.keras.layers import AveragePooling2D, Dropout, Flatten, Dense, Input
from tensorflow.keras.models import Model
# from tensorflow.keras.backend import clear_session

from keras.models import load_model

def predict_covid_19_x_ray(image_path):

	xray_image = cv2.imread(image_path)
	xray_image = cv2.cvtColor(xray_image, cv2.COLOR_BGR2RGB)

	########################################################################################################
	########################################################################################################
	########################################################################################################
	# xray_image = cv2.imread(xray_image, cv2.IMREAD_GRAYSCALE)
	# xray_image = cv2.equalizeHist(xray_image)
	xray_image = cv2.resize(xray_image, (256, 256), interpolation = cv2.INTER_AREA)
	xray_image = 255 - xray_image
	xray_image = xray_image.astype('float32')
	xray_image /= 255

	xray_image = np.reshape(xray_image, (1, 256, 256, 3))

	model = load_model('covid_19_library/nf_model_simple.h5')

	########################################################################################################
	########################################################################################################
	########################################################################################################

	predicted = model.predict(xray_image)

	del model
	# clear_session()
	# gc.collect()
	
	# print(predicted)
	# print(np.round(predicted[0][0]*100, 2))
	# return np.round(predicted[0][0]*100, 2)
	return np.round(predicted[0][0]*100, 2)

def predict_covid_19_x_ray_new(image_processing, lung_cropper):

	xray_image_processing = cv2.imread('covid_19_library/image_upload/'+image_processing)
	xray_image_cropper = cv2.imread('covid_19_library/image_upload/'+lung_cropper)
	
	xray_image_processing = cv2.cvtColor(xray_image_processing, cv2.COLOR_BGR2RGB)
	xray_image_cropper = cv2.cvtColor(xray_image_cropper, cv2.COLOR_BGR2RGB)

	########################################################################################################
	########################################################################################################
	########################################################################################################

	## covid_19_xray_model
	xray_image_processing = xray_image_processing.astype('float32')
	xray_image_processing /= 255

	xray_image_cropper = xray_image_cropper.astype('float32')
	xray_image_cropper /= 255
	
	xray_image_processing = np.reshape(xray_image_processing, (1, 512, 512, 3))
	xray_image_cropper = np.reshape(xray_image_cropper, (1, 512, 512, 3))

	model = load_model('covid_19_library/High_End_covid_19_xray_Model.h5')

	predicted = model.predict(xray_image_processing, xray_image_cropper)

	del model
	# clear_session()
	# gc.collect()

	return np.round(predicted[0][0]*100, 2)

def predict_covid_19_ct_scan(image_path):
	# import tensorflow_hub as hub 
	
	# ct_image = cv2.imread(image_path)
	# ct_image = cv2.cvtColor(ct_image, cv2.COLOR_BGR2RGB)
	# ct_image = cv2.resize(ct_image, (224, 224))
	# ct_image = ct_image.astype('float32')
	# ct_image /= 255
	
	# ct_image = np.reshape(ct_image, (1, 224, 224, 3))

	# model = load_model('covid_19_ctscan_weights.h5', custom_objects={"KerasLayer":hub.KerasLayer})
	# predicted = model.predict(ct_image)
	# # print(predicted)
	# # print(np.round(predicted[0][0]*100, 2))
	# # return np.round(predicted[0][0]*100, 2)
	# return np.round(predicted[0][0]*100, 2)
	pass

# print(predict_covid_19_x_ray('C:/Users/asus/Desktop/Covid App/Data/Covid-19/1.2.840.113564.54.192.168.1.91.20200310150233491.18717_8176.png'))