#!/bin/sh

PASSWD="Cdn5flwkahd)0"
DATE=$(date '+%Y%m%d')

#sshpass -p$PASSWD scp -o StrictHostKeyChecking=no root@222.239.93.60:/usr/service/logs/wj2solbox_syncd/wj2solbox_syncd_$DATE.log /usr/service/wjsyncweb/data
sshpass -p$PASSWD scp -o StrictHostKeyChecking=no root@222.239.93.60:/usr/service/logs/wj2solbox2_syncd/wj2solbox2_syncd_$DATE.log /usr/service/wjsyncweb/data
sshpass -p$PASSWD scp -o StrictHostKeyChecking=no root@222.239.93.61:/usr/service/logs/wj2solbox_full_syncd/wj2solbox_full_syncd_$DATE.log /usr/service/wjsyncweb/data
#awk -F '"' '/COMPLETED/{split($1,a," "); print substr(a[1],2,length(a[1])-2) "||" substr(a[6],1,length(a[6])-1) "||" $2 "||;"}' /usr/service/wjsyncweb/data/wj2solbox_syncd_$DATE.log > /usr/service/wjsyncweb/data/data_$DATE.log
awk -F '"' '/COMPLETED/{split($1,a," "); print substr(a[1],2,length(a[1])-2) "||" substr(a[6],1,length(a[6])-1) "||" $2 "||;"}' /usr/service/wjsyncweb/data/wj2solbox2_syncd_$DATE.log > /usr/service/wjsyncweb/data/data_$DATE.log
#cat /usr/service/wjsyncweb/data/wj2solbox_full_syncd_$DATE.log | awk '/SUCCESS/{print $7}' | sort -u  > /usr/service/wjsyncweb/data/full_data_success_$DATE.log
awk '$5 ~ /\[RETRY/ && ($6 ~ /SUCCESS]/ || $6 ~ /FAILURE]/){print substr($1,2,length($1)-2), substr($6,1,length($6)-1), substr($9,2,length($9)-2), substr($(NF),2,length($(NF))-2)}' /usr/service/wjsyncweb/data/wj2solbox2_syncd_$DATE.log > /usr/service/wjsyncweb/data/retry_data_$DATE.log

#hls
cat /usr/service/wjsyncweb/data/data_$DATE.log | awk '/WJTH_HLS/' | awk '/SUCCESS/' | awk '/MP4/' | awk '{print "'$DATE'||"$0}'  > /usr/service/wjsyncweb/data/hls_data_$DATE.log
cat /usr/service/wjsyncweb/data/hls_data* > /usr/service/wjsyncweb/data/all_hls_data.log

#sync file the other handle
awk -F '"' '/COMPLETED SUCCESS/{split($1,a," "); print substr(a[1],2,length(a[1])-2),substr(a[6],1,length(a[6])-1),$2,$(NF)}' /usr/service/wjsyncweb/data/wj2solbox2_syncd_$DATE.log > /usr/service/wjsyncweb/data/sync_data_success_$DATE.log
awk -F '"' '/COMPLETED FAILURE/{split($1,a," "); print $2}' /usr/service/wjsyncweb/data/wj2solbox2_syncd_$DATE.log | sort -u > /usr/service/wjsyncweb/data/sync_data_failure_$DATE.log
awk -F '"' '/COMPLETED/{split($1,a," "); print substr(a[1],2,length(a[1])-2),substr(a[6],1,length(a[6])-1),$2,$(NF)}' /usr/service/wjsyncweb/data/wj2solbox_full_syncd_$DATE.log > /usr/service/wjsyncweb/data/sync_dupl_full_data_$DATE.log
sort -r -k 3,3 /usr/service/wjsyncweb/data/sync_dupl_full_data_$DATE.log > /usr/service/wjsyncweb/data/sync_full_data_r_$DATE.log
sort -u -k 3,3 /usr/service/wjsyncweb/data/sync_full_data_r_$DATE.log > /usr/service/wjsyncweb/data/sync_full_data_u_$DATE.log

i=20171026
while [ $i -lt $DATE ]
do
        curl "http://localhost:8888/sync/data/$i"
        i=$(($i+1))
done

