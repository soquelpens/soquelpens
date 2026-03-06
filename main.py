from gensite import generate

def main():
    print("Wrote %d files" % (generate("templates", "public", "data.json")))

if __name__ == "__main__":
    main()
