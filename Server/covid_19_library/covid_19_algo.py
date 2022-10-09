
def calculate_covid_19_flowchart(group_req, rr_req, spo2_req, fever_req, body_system_req, in_danger_req, medicine_req, illness_req, lung_image_req, lung_infiltrate_req):
	
	group = group_req
	rr = int(rr_req)
	spo2 = int(spo2_req)

	fever = fever_req
	body_system = body_system_req
	in_danger = in_danger_req
	medicine = medicine_req
	illness = illness_req
	lung_image = lung_image_req
	lung_infiltrate = lung_infiltrate_req

	group = group.split(',')
	illness = illness.split(',')
	medicine = medicine.split(',')

	ct = 'no'
	if in_danger == 'yes' and fever == 'yes':
		ct = 'yes'
	
	drug = 'yes'
	if len(medicine) == 0 and len(illness) == 0:
		drug = 'no'
	
	# color-drug-ct

	if rr>30 or spo2<93:
		return 'red', drug, ct

	if 'group_1' in group and body_system == 'yes':
		return 'red', drug, ct

	if fever == 'empty':
		return 'error', drug, ct

	if fever == 'no':
		return 'green', drug, ct

	if in_danger == 'empty' and body_system == 'empty':
		return 'error', drug, ct

	if in_danger == 'no' and body_system == 'no':
		return 'green', drug, ct
	
	if lung_image == 'no' or lung_image == 'empty':
		return 'brown', drug, ct

	if lung_infiltrate == 'empty' or lung_infiltrate == 'no':
		return 'brown', drug, ct

	return 'red', drug, ct