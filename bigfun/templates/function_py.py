import traceback

from flask import Flask, request, jsonify
import google.auth
import google.cloud.error_reporting

error_reporter = google.cloud.error_reporting.Client()
app = Flask(__name__)


_, PROJECT = google.auth.default()


def compute(args):
    {% for argument in arguments %}{{ argument.name }}, {% endfor %} = args
    {{ code|replace('\n', '\n    ') }}


@app.route("/", methods=['POST'])
def handle():
    try:
        request_json = request.get_json()
        print(request_json)
        rows = request_json['calls']
        user = request_json['sessionUser']
        if user.endswith('.gserviceaccount.com'):
            return f'''
                Hi 👋! Thanks for using BigFunctions! ---
                `{{ name }}` BigFunction only accept calls from real people (not bots) (for now). ---
                To remove this limit 🚀, please send an email to paul.marcombes@unytics.io
            ''', 400
        if len(rows) > 1:
            return f'''
                Hi 👋! Thanks for using BigFunctions! ---
                `{{ name }}` BigFunction only accept calls on 1 row at a time (for now). ---
                To remove this limit 🚀, please send an email to paul.marcombes@unytics.io
            ''', 400
        replies = [compute(row) for row in rows]
        return jsonify( { "replies" :  replies} )
    except Exception:
        error_reporter.report_exception(google.cloud.error_reporting.build_flask_context(request))
        return traceback.format_exc(), 400
