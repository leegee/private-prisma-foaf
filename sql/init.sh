echo `pwd`
source "./.env"
echo DB_USER $DB_USER
echo DB_NAME $DB_NAME

# docker exec -it postgres psql -U $DB_USER -c "CREATE DATABASE $DB_NAME ENCODING 'UTF8' LC_COLLATE 'en_US.UTF-8' LC_CTYPE 'en_US.UTF-8'"

docker cp ./sql/scheme.sql postgres:scheme.sql

docker exec -it postgres psql -U $DB_USER -a $DB_NAME -f scheme.sql

# for sql_file in ./sql/deltas/*.sql
# do
#     docker cp $sql_file postgres:$sql_file
#     docker exec -it postgres psql -U $DB_USER -a $DB_NAME -f $sql_file
# done
