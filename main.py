from gensite import generate

def main():
    print("Wrote %d files" % (generate("templates", "public")))

if __name__ == "__main__":
    main()
