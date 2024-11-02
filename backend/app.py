from flask import Flask, request
import game

app = Flask(__name__)

@app.route("/host")
def host():
    # serve host.html
    return app.send_static_file('host.html')

@app.route("/player1")
def player1():
    # serve player.html
    return app.send_static_file('player.html')

@app.route("/player2")
def player2():
    # serve player.html
    return app.send_static_file('player.html')

@app.route("/report-segments", methods=['POST'])
def report_segments():
    # get the position from the body json
    data = request.json
    if data["player"] == "player1":
        game.player1["segments"]["x"] = data["x"]
        game.player1["segments"]["y"] = data["y"]
    elif data["player"] == "player2":
        game.player2["segments"]["x"] = data["x"]
        game.player2["segments"]["y"] = data["y"]

    return "OK"

@app.route("/get-segments")
def get_position():
    # don't return the position of the current player
    return_dict = {
        "ai": game.ai["segments"]
    }
    if request.args.get("player") == "player1":
        return_dict["player"] = game.player2["segments"]
    elif request.args.get("player") == "player2":
        return_dict["player"] = game.player1["segments"]
    
    print(return_dict)
    return return_dict

@app.route("/")
def hello_world():
    return "<p>Hello, World!</p>"

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=4000)
