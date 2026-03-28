from liquid import Environment
from liquid import CachingFileSystemLoader
from liquid import parse
from liquid import render

from os import listdir
from os.path import isfile, join, isdir

import yaml

# Given a template directory, outout rendered templates to output_dir.
def generate(templates_dir: string, output_dir: string) -> int:
    env = Environment(loader=CachingFileSystemLoader(templates_dir, ext=".html"))

    files = []
    written = 0
    data = {}
    for f in listdir(templates_dir):
        if isfile(join(templates_dir, f)) and not f.startswith("_"):
            files.append(f)
            data[f] = {}
            ld = yaml.safe_load(extract_data(join(templates_dir, f)))
            if ld is not None:
                data[f] = ld

    for f in files:
        template = env.get_template(f)
        if f in data:
            data[f]["url"] = f
            data[f]["name"] = f.replace(".html", "")
            if "img_dir" in data[f]:
                cat = {}
                _ = loadimgs(data[f]["img_dir"], output_dir, cat)
                data[f]["imgs"] = cat

            with open("%s/%s" % (output_dir, f), "w") as file:
                file.write(template.render(page = data[f]))
                written = written + 1
        else:
            print("Skipping %s. Add this file to %s if needed." % (f, data_file))

    return written

# Given an images directory, find categorized images for a given template.
# Recurses down sub dirs, placing these as categories.
def loadimgs(img_dir: string, output_dir: string, imgcat: dict) -> []:
    imgs = []
    try:
        for img in listdir(join(output_dir, img_dir)):
            fullimg = join(output_dir, img_dir, img)
            if isfile(fullimg):
                imgs.append(join(img_dir, img))
            if isdir(fullimg):
                imgcat[img] = loadimgs(join(img_dir, img), output_dir, imgcat)

    except FileNotFoundError:
        print("Skipping missing image dir %s" % (join(output_dir, img_dir)))

    return imgs

# Pull out any data defined in a template
def extract_data(file_path: string) -> string:
    base = []
    good = False
    with open(file_path, 'r') as file:
        for line_number, line in enumerate(file, start=1):
            if "END_DATA" in line:
                return "\n".join(base)
            if good:
                base.append(line)
            if "START_DATA" in line:
                good = True
    return ""
