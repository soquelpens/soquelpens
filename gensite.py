from liquid import Environment
from liquid import CachingFileSystemLoader
from liquid import parse
from liquid import render

from os import listdir
from os.path import isfile, join

import json

def generate(templates_dir: string, output_dir: string, data_file: string) -> int:
    env = Environment(loader=CachingFileSystemLoader(templates_dir, ext=".html"))

    files = []
    for f in listdir(templates_dir):
        if isfile(join(templates_dir, f)) and not f.startswith("_"):
            files.append(f)

    with open(data_file, 'r') as file:
        data = json.load(file)

    for f in files:
        template = env.get_template(f)
        data[f]["url"] = f
        data[f]["name"] = f.replace(".html", "")

        with open("public/%s" % (f), "w") as file:
            file.write(template.render(page = data[f]))

    return len(files)
