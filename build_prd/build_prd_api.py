import os
import requests
#------------------------------------------------------>APP BACKEND - API FLASK<----------------------------------------------------------#
#------------>GLOBAL VARIABLES<----------------#
NAME="api_faustoauth"
REGISTRY="richard24se"
TAG="latest"
BRANDING="_fausto"
PRE_BUILDING = "docker build -f ../docker/api/api_prd.Dockerfile -t "

#JOIN COMPLETE_NAME
COMPLETE_NAME = NAME+":"+TAG

##########----->VERSION<----------######
#------------>BUILD IMAGE<----------------#
building = PRE_BUILDING+COMPLETE_NAME+" ../"
print(building)
os.system(building)

# #SQUASH IMAGE FOR PUBLIC 
# PRE_BUILDING = "docker build -f ../docker/api_sppc/api_prd_public.Dockerfile -t "
# #JOIN COMPLETE_NAME
# COMPLETE_NAME = NAME+"_public"+":"+TAG
# ##########----->VERSION<----------######
# #------------>BUILD IMAGE<----------------#
# building = PRE_BUILDING+COMPLETE_NAME+" ../"
# print(building)
# os.system(building)
#------------>TAG IMAGE<----------------#
tagging = "docker tag "+COMPLETE_NAME+" "+REGISTRY+"/"+COMPLETE_NAME
print(tagging)
os.system(tagging)
#------------>PUSH IMAGE<----------------#
pushing = "docker push "+REGISTRY+"/"+COMPLETE_NAME
print(pushing)
os.system(pushing)
# #------------>VERIFY IMAGE<----------------#
verifying = "docker images -q "+REGISTRY+"/"+COMPLETE_NAME
print(verifying)
response = os.popen(verifying).read()
print(response)



