
'''
https://stackoverflow.com/questions/24021749/unable-to-get-dicom-image-for-display-in-python
CMD:
pip install pydicom
conda install pydicom --channel conda-forge
conda install -c conda-forge gdcm
'''

import os
import cv2
import glob
import pydicom
import numpy as np
import matplotlib.pyplot as plt

from keras.models import Model
from keras.layers import Input, Conv2D, MaxPooling2D, concatenate, Conv2DTranspose

resize_shape = 512
output_path = 'covid_19_library/image_upload/'

# U-net architecture
# From: https://github.com/jocicmarko/ultrasound-nerve-segmentation/blob/master/train.py
def dice_coef(y_true, y_pred):
    y_true_f = keras.flatten(y_true)
    y_pred_f = keras.flatten(y_pred)
    intersection = keras.sum(y_true_f * y_pred_f)
    return (2. * intersection + 1) / (keras.sum(y_true_f) + keras.sum(y_pred_f) + 1)

def dice_coef_loss(y_true, y_pred):

    return -dice_coef(y_true, y_pred)

def unet(input_size=(256,256,1)):
    inputs = Input(input_size)
    
    conv1 = Conv2D(32, (3, 3), activation='relu', padding='same')(inputs)
    conv1 = Conv2D(32, (3, 3), activation='relu', padding='same')(conv1)
    pool1 = MaxPooling2D(pool_size=(2, 2))(conv1)

    conv2 = Conv2D(64, (3, 3), activation='relu', padding='same')(pool1)
    conv2 = Conv2D(64, (3, 3), activation='relu', padding='same')(conv2)
    pool2 = MaxPooling2D(pool_size=(2, 2))(conv2)

    conv3 = Conv2D(128, (3, 3), activation='relu', padding='same')(pool2)
    conv3 = Conv2D(128, (3, 3), activation='relu', padding='same')(conv3)
    pool3 = MaxPooling2D(pool_size=(2, 2))(conv3)

    conv4 = Conv2D(256, (3, 3), activation='relu', padding='same')(pool3)
    conv4 = Conv2D(256, (3, 3), activation='relu', padding='same')(conv4)
    pool4 = MaxPooling2D(pool_size=(2, 2))(conv4)

    conv5 = Conv2D(512, (3, 3), activation='relu', padding='same')(pool4)
    conv5 = Conv2D(512, (3, 3), activation='relu', padding='same')(conv5)

    up6 = concatenate([Conv2DTranspose(256, (2, 2), strides=(2, 2), padding='same')(conv5), conv4], axis=3)
    conv6 = Conv2D(256, (3, 3), activation='relu', padding='same')(up6)
    conv6 = Conv2D(256, (3, 3), activation='relu', padding='same')(conv6)

    up7 = concatenate([Conv2DTranspose(128, (2, 2), strides=(2, 2), padding='same')(conv6), conv3], axis=3)
    conv7 = Conv2D(128, (3, 3), activation='relu', padding='same')(up7)
    conv7 = Conv2D(128, (3, 3), activation='relu', padding='same')(conv7)

    up8 = concatenate([Conv2DTranspose(64, (2, 2), strides=(2, 2), padding='same')(conv7), conv2], axis=3)
    conv8 = Conv2D(64, (3, 3), activation='relu', padding='same')(up8)
    conv8 = Conv2D(64, (3, 3), activation='relu', padding='same')(conv8)

    up9 = concatenate([Conv2DTranspose(32, (2, 2), strides=(2, 2), padding='same')(conv8), conv1], axis=3)
    conv9 = Conv2D(32, (3, 3), activation='relu', padding='same')(up9)
    conv9 = Conv2D(32, (3, 3), activation='relu', padding='same')(conv9)

    conv10 = Conv2D(1, (1, 1), activation='sigmoid')(conv9)

    return Model(inputs=[inputs], outputs=[conv10])

def image_processing(image_path):

	# File name
	file_name = image_path.split('\\')[-1]
	file_extention = file_name.split('.')[-1]

	# Read png file in gray scale
	image = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)

	# Image color equalizer
	image = cv2.equalizeHist(image)

	# # Change color map to BONE
	# image = cv2.applyColorMap(image, cv2.COLORMAP_BONE)

	# Resize image
	image = cv2.resize(image, (resize_shape, resize_shape), interpolation = cv2.INTER_AREA)

	file_name = file_name.replace('.'+file_extention, '_Process.'+file_extention)
	
	cv2.imwrite(output_path + file_name, output_image)
	
	return file_name

def lung_cropper(image_path):

	# File name
	file_name = image_path.split('\\')[-1]
	file_extention = file_name.split('.')[-1]
	
	# Read png file in gray scale
	image = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)

	# Resize image
	image = cv2.resize(image, (resize_shape, resize_shape), interpolation = cv2.INTER_AREA)

	# Load Model
	lung_detection_model = unet(input_size=(512,512,1))
	lung_detection_model.load_weights('covid_19_library/unet_lung_seg.hdf5')

	# Reshape for Model
	image_seg = np.reshape(image, (1, resize_shape, resize_shape, 1))

	# Predict Lung Detection
	image_seg = lung_detection_model.predict(image_seg)
	del lung_detection_model

	# Reshape Back
	image_seg = np.reshape(image_seg, (resize_shape, resize_shape, 1))

	# Make Readable Image [0-255]
	image_seg = (image_seg[:, :, 0] * 255.).astype(np.uint8)

	######################################################################################################
	## Make Lung Detection Mask ##########################################################################
	######################################################################################################

	# As Lungs are Largets Componenst
	# Find Connected Components
	number_of_segments, connected_components = cv2.connectedComponents(image_seg)

	# Make Array of Size of Each Components
	segments_length = np.array([])
	for i in range(number_of_segments):
		segments_length = np.append(segments_length, len(connected_components[connected_components == i]))

	# Find 1st & 2nd Largest Components
	sorted_segments_length = np.sort(segments_length)
	max_segment_1 = sorted_segments_length[-2]
	max_segment_2 = sorted_segments_length[-3]

	# Make a Mask of Tow Components
	image_mask = np.zeros(image.shape, dtype=image.dtype)
	image_mask[connected_components == np.where(segments_length == max_segment_1)] = 255
	image_mask[connected_components == np.where(segments_length == max_segment_2)] = 255

	# # Make Masked Image
	# dcm_image_masked = cv2.bitwise_and(image, dcm_image_mask)

	# Find Non-Zeros X & Y
	img_x = np.nonzero(image_mask.max(axis=0))[0]
	img_y = np.nonzero(image_mask.max(axis=1))[0]

	# Find Bounding Box
	for_pad_min = lambda s: s if s >= 0 else 0
	for_pad_max = lambda s: s if s <= resize_shape else resize_shape

	image_top = for_pad_min(img_y[0]-10)
	image_bottom = for_pad_max(img_y[-1]+10)
	image_left = for_pad_min(img_x[0]-10)
	image_right = for_pad_max(img_x[-1]+10)

	# Crop Image (Lung Detected!)
	image_crop = image[image_top:image_bottom, image_left:image_right]

	# Image color equalizer
	image_equalized = cv2.equalizeHist(image_crop)

	# output_image = np.zeros(image.shape, dtype=image.dtype)
	output_image = np.full(image.shape, 255, dtype=image.dtype)

	image_mask_height = image_crop.shape[0]
	image_mask_width = image_crop.shape[1]

	remain_x = (resize_shape - image_mask_width)//2
	remain_y = (resize_shape - image_mask_height)//2

	output_image[remain_y:remain_y+image_mask_height, remain_x:remain_x+image_mask_width] = image_equalized

	# # Change color map to BONE
	# output_image = cv2.applyColorMap(output_image, cv2.COLORMAP_BONE)

	# output_image = np.concatenate((output_image, image_seg), axis=1)

	file_name = file_name.replace('.'+file_extention, '_Cropped.'+file_extention)
	cv2.imwrite(output_path + file_name, output_image)

	return file_name

def dcm_to_png(dcm_image_path):

	# File name
	file_name = dcm_image_path.split('\\')[-1]
	# print(file_name)

	# Read dcm file
	dcm_data = pydicom.dcmread(dcm_image_path)
	# print(dcm_data)

	# Read dcm image array
	dcm_image = dcm_data.pixel_array

	# Save File
	file_name = file_name.replace('.dcm', '.png')
	plt.imsave(output_path + file_name, dcm_image, cmap=plt.cm.gray)

	return file_name
