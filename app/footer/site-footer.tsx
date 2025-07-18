const siteConfig = {
  links: {
    github: "https://github.com/wjgoh",
  },
};

export function SiteFooter() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 border-grid border-t py-1 md:py-0 bg-background">
      <div className="container-wrapper flex items-center justify-center">
        <div className="container py-1 md:py-2 flex items-center justify-center">
          <div className="text-balance text-center text-xs md:text-sm leading-tight md:leading-loose text-muted-foreground">
            Made with ❤️ by{" "}
            <a
              href={siteConfig.links.github}
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              wjgoh
            </a>
            .
          </div>
        </div>
      </div>
    </footer>
  );
}
