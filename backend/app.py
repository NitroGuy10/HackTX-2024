from flask import Flask, request
import game

app = Flask(__name__)

@app.route("/host")
def host():
    # serve host.html
    return app.send_static_file('host.html')

@app.route("/player1")
def player1():
    # serve player1.html
    return app.send_static_file('player1.html')

@app.route("/report-position", methods=['POST'])
def report_position():
    # get the position from the body json
    data = request.json
    game.x = data['x']
    game.y = data['y']

    return {
        'message': 'Position updated'
    }

@app.route("/get-position")
def get_position():
    # return the position as json
    return {
        'x': game.x,
        'y': game.y
    }

@app.route("/")
def hello_world():
    return "<p>Hello, World!</p>"

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=4000)
