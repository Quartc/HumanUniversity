from flask import Flask, render_template, jsonify, request
import json
import os
from datetime import datetime

app = Flask(__name__)

STARS_FILE = 'stars_data.json'

GALLERY_ITEMS = [
    {
        'id': 1,
        'title': 'Земля из космоса',
        'description': 'Фотография "Blue Marble" — вид Земли из космоса, изменивший восприятие человечеством своей планеты',
        'image': 'earth_from_space.jpg',
        'category': 'history'
    },
    {
        'id': 2,
        'title': 'Ступенька в бесконечность',
        'description': 'Первый шаг человека на Луне, 1969 год — момент, когда человечество перестало быть привязанным к одной планете',
        'image': 'moon_step.jpg',
        'category': 'history'
    },
    {
        'id': 3,
        'title': 'Туманность Ориона',
        'description': 'Звёздные ясли — место рождения новых звёзд и планетных систем',
        'image': 'orion_nebula.jpg',
        'category': 'space'
    },
    {
        'id': 4,
        'title': 'Солнечная активность',
        'description': 'Влияние солнечного ветра на магнитосферу Земли и технологии человечества',
        'image': 'sun_activity.jpg',
        'category': 'science'
    },
    {
        'id': 5,
        'title': 'Международная космическая станция',
        'description': 'Символ объединения человечества в исследовании космоса',
        'image': 'iss.jpg',
        'category': 'technology'
    },
    {
        'id': 6,
        'title': 'Сознание и космос',
        'description': 'Нейровизуализация: как изучение космоса расширяет границы человеческого сознания',
        'image': 'consciousness.jpg',
        'category': 'philosophy'
    }
]

CONTACTS = {
    'email': 'space.researcher@human-universe.ru',
    'phone': '+7 (967) 123-45-67',
    'address': 'г. Пенза',
    'social': {
        'telegram': '@quartc'
    }
}

def load_stars():
    if os.path.exists(STARS_FILE):
        try:
            with open(STARS_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except:
            return []
    return []

def save_stars(stars):
    with open(STARS_FILE, 'w', encoding='utf-8') as f:
        json.dump(stars, f, ensure_ascii=False, indent=2)

user_stars = load_stars()


@app.route('/')
def index():
    return render_template('index.html', 
                         current_year=datetime.now().year,
                         contacts=CONTACTS)

@app.route('/about')
def about():
    return render_template('about.html',
                         current_year=datetime.now().year,
                         contacts=CONTACTS)

@app.route('/gallery')
def gallery():
    return render_template('gallery.html',
                         gallery_items=GALLERY_ITEMS,
                         current_year=datetime.now().year,
                         contacts=CONTACTS)

@app.route('/contacts')
def contacts():
    return render_template('contacts.html',
                         contacts=CONTACTS,
                         current_year=datetime.now().year)


@app.route('/star-trail')
def star_trail():
    return render_template('star-trail.html',
                         current_year=datetime.now().year,
                         contacts=CONTACTS)

@app.route('/api/add-star', methods=['POST'])
def add_star_to_sky():
    global user_stars
    
    data = request.json
    name = data.get('name', '').strip()
    
    if not name or len(name) < 2 or len(name) > 20:
        return jsonify({'error': 'Имя должно быть от 2 до 20 символов'}), 400
    
    x = data.get('x')
    y = data.get('y')
    if x is None or y is None:
        x = 50 + (hash(name) % 800)
        y = 50 + ((hash(name) * 13) % 500)
    
    new_star = {
        'id': len(user_stars) + 1,
        'name': name,
        'x': x,
        'y': y,
        'date': datetime.now().strftime('%d.%m.%Y %H:%M'),
        'color': data.get('color', '#ffd700'),
        'timestamp': datetime.now().timestamp()
    }
    
    user_stars.append(new_star)
    
    save_stars(user_stars)
    
    return jsonify({'success': True, 'star': new_star})

@app.route('/api/get-stars', methods=['GET'])
def get_stars():
    global user_stars
    return jsonify(user_stars)

@app.route('/api/delete-star/<int:star_id>', methods=['DELETE'])
def delete_star(star_id):
    global user_stars
    
    user_stars = [star for star in user_stars if star['id'] != star_id]
    
    save_stars(user_stars)
    
    return jsonify({'success': True})

@app.route('/api/contact-form', methods=['POST'])
def handle_contact_form():
    data = request.json
    return jsonify({
        'status': 'success',
        'message': 'Сообщение успешно отправлено. Свяжемся с вами в ближайшее время!'
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)