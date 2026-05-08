# Tree Risk AI

Tree Risk AI е веб базиран систем за проценка на ризик од паѓање на дрва во урбана средина. Системот овозможува внес, анализа и приказ на податоци за дрва со цел навремено откривање на потенцијално опасни случаи и поддршка при донесување одлуки.

## Current Status

Проектот е во фаза на имплементација. Основните backend функционалности се имплементирани, вклучително и API, валидација и AI анализа. Дел од функционалностите како ML модел, frontend интеграција, alerts и deployment се во тек.

## Основни функционалности

- Додавање на дрво (администратор)
- Уредување и бришење на дрво
- Преглед на сите дрва
- Детален приказ на дрво
- Автоматска пресметка на risk score
- Класификација на ризик:
  - LOW (0–40)
  - MEDIUM (41–70)
  - HIGH (71–100)
- Историја на ризик (делумно имплементирана)
- Внес на временски услови (основно ниво)

## AI анализа

При додавање на дрво со слика, системот:

- ја компресира сликата
- испраќа барање до AI сервис
- добива risk score (0–100)
- генерира објаснување (ai_description)
- поставува дали дрвото е опасно (is_dangerous)

Оваа анализа е имплементирана во backend и овозможува динамичка проценка на ризик базирана на слика, како привремено решение додека се интегрира ML модел.

## Технологии

Backend:
- Django
- Django REST Framework
- PostgreSQL
- JWT authentication

Frontend:
- React (Vite)
- TailwindCSS
- Leaflet
- Recharts

Tools:
- Git / GitHub
- Docker (планирано)
- Railway (планирано)

## Backend Setup

cd backend  
python -m venv .venv  

Активирање на environment и инсталација:
pip install -r requirements.txt  

Конфигурација:
.env (според .env.example)  

Команди:
python manage.py makemigrations  
python manage.py migrate  
python manage.py createsuperuser  
python manage.py runserver  

## Frontend Setup

cd frontend  
npm install  
npm run dev  

## API Endpoints

Auth:
POST /api/auth/register  
POST /api/auth/login  

Trees:
GET /api/trees  
POST /api/trees  
PUT /api/trees/{id}  
DELETE /api/trees/{id}  
GET /api/trees/high-risk  

Weather:
POST /api/weather  
GET /api/weather  

Risk:
GET /api/risk/history  

Reports:
GET /api/reports/generate  

## Контрола на пристап

- Администратор: целосен пристап
- Најавен корисник: ограничен пристап
- Ненајавен корисник: само преглед

## Валидација

- Не се дозволуваат негативни вредности за height и tilt
- Основна проверка на податоци при внес
- Компресија на слики пред обработка

## Забелешки

- ML моделот е во развој
- AI анализа се користи како привремено решение
- Дел од функционалностите (alerts, препораки, интерактивна мапа) не се целосно имплементирани
- Проектот користи open-source алатки

## Future Improvements

- Интеграција на ML модел
- Вклучување на временски услови во risk score
- Alerts за висок ризик
- Препораки за интервенција
- Интерактивна мапа со автоматско ажурирање
- Сортирање и филтрирање
- Оптимизација на перформанси

## Тим

Team Lead: Марија Димова  
Product Owner: Јана Трпковска  
Backend / AI: Јана Трпковска  
Backend: Никола Тодоров, Илија Бунчески  
ML: Драгана Трифунова  
Frontend: Симона Мицева  
QA: Мартина Михова  
UX/UI: Нела Николова  
DevOps: Јана Гогова  

## Заклучок

Tree Risk AI претставува систем кој комбинира backend логика, анализа на податоци и AI пристап за проценка на ризик, со цел подобро управување со урбаното зеленило и намалување на потенцијални опасности.
