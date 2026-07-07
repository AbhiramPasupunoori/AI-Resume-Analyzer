cd /Users/abhiram/Documents/GitHub/AI-Resume-Analyzer/backend
source .venv/bin/activate
then use-
python manage.py runserver 


running postgresql

docker exec -it resume-analyzer-postgres \
psql -U resume_user -d resume_analyzer

for tables- \dt
for exit- \q